function getJobInformation() {
  let jobElementInformation = document.querySelectorAll("div[id*=jobcard]");
  jobElementInformation = [...jobElementInformation];

  const jobJsonInformation = jobElementInformation.map((el) => {
    const [
      {},
      {
        children: [
          {
            children: [
              { innerText: dateJob },
              {},
              { innerText: jobSalaryRange },
            ],
          },
        ],
      },
    ] = el.children;
    salaryRange = jobSalaryRange.split("\n")[0];
    date = dateJob.split("\n")[0];
    country = el.querySelector("p[class*=zonesLinks]").innerText;
    return { date, salaryRange, country };
  });

  const filterDate = jobJsonInformation.filter((e) => e.date === "Hoy");

  const filterCountry = filterDate.filter((value, index, array) => {
    
    return array.findIndex(obj => obj.country === value.country && obj.salaryRange === value.salaryRange) === index;
  });

  return filterCountry;
}

const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

portBackground.postMessage({ cmd: "online" });

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === "scrap") {
      const jobsInformation = getJobInformation();

      portBackground.postMessage({ cmd: "getInfo", jobsInformation });
    }
  });
});
