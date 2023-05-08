
function getJobInformation() {
  let jobsElementInformation = document.querySelectorAll("div[id*=jobcard]");
  jobsElementInformation = [...jobsElementInformation];
  
  const jobJSONInformation = jobsElementInformation.map(el => {
    const city=el.querySelector("[class*=zonesLinks]").innerText;
    const [, { children: [{ children: [, { innerText: title }, { innerText: salary }] }] }] = el.children;
    return { title, salary, city };
  });

  return jobJSONInformation;
}

function transformedData(jobsInformationList){
  const transformedData = jobsInformationList.map(dato => {
    const { salary, city, ...rest } = dato;
    const formattedSalary = /\d/.test(salary) ? salary.replace(/[^\d-]/g, '') : 'Sueldo no mostrado';
    let finalCity = city;
    if (finalCity === '') {
      finalCity = 'Ciudad no mostrada';
    } else if (finalCity.includes('\n\n')) {
      const cityParts = finalCity.split('\n\n');
      finalCity = cityParts[1];
    }
    return {
      ...rest,
      salaryRange: formattedSalary,
      city: finalCity,
    };
  });
  return transformedData;
}

const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

portBackground.postMessage({ cmd: 'online' });

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === "scrap") {
      const jobsInformation = getJobInformation();
      const jobsTransformed = transformedData(jobsInformation);
      const buttonNext = document.querySelector("[class*=next]");
      const nextPage = !buttonNext.className.includes("disabled");
      portBackground.postMessage({ cmd: 'getInfo', jobsTransformed, nextPage });
    }
  });
});

chrome.runtime.onMessage.addListener(function (message) {
  const { cmd, jobs } = message;

  if (cmd === "sendJobs" && jobs) {
    chrome.storage.local.set({ jobs: jobs });
    chrome.runtime.sendMessage({ cmd: "sendJobs", jobs });
  }
});