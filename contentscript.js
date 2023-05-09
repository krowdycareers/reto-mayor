// OBTENCION DE DATA
function getJobInformation() {
  let jobsElementInformation = [...document.querySelectorAll("div[id*=jobcard]")];

  const jobJSONData = jobsElementInformation.map(el => {
    const city=el.querySelector("[class*=zonesLinks]").innerText;
    const [, { children: [{ children: [, { innerText: title }, { innerText: salary }] }] }] = el.children;
    return { title, salary, city };
  });

  return jobJSONData;
}

// formateo de salario
const formatSalary =(salary)=>{
  if (/\d/.test(salary)) {
    return salary.replace(/[^\d-]/g, '');
  } else {
    return 'Sueldo no mostrado';
  }
}


// Transformar la data
const convertData = (jobsInformation) => {
  const convertData = jobsInformation.map(dato => {

    const { salary, city, ...rest } = dato;
    
    const formattedSalary = formatSalary(salary);

    return {
      ...rest,
      salaryRange: formattedSalary,
      city: city,
    };
  });
  return convertData;
}

const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

portBackground.postMessage({ cmd: 'online' });

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === "scrap") {
      const jobsInformation = getJobInformation();
      const jobsFormatings = convertData(jobsInformation);
      const buttonNext = document.querySelector("[class*=next]");
      const nextPage = !buttonNext.className.includes("disabled");
      portBackground.postMessage({ cmd: 'getInfo', jobsFormatings, nextPage });
    }
  });
});

chrome.runtime.onMessage.addListener(function (message) {
  const { cmd, jobs } = message;

  if (cmd === "submitJobs" && jobs) {
    chrome.storage.local.set({ jobs: jobs });
    chrome.runtime.sendMessage({ cmd: "submitJobs", jobs });
  }
});

