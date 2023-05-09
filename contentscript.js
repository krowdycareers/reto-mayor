console.log("Ejecutandose el content script 1.0");

function getJobInformation() {
  const jobs = Array.from(document.querySelectorAll("[id*='jobcard-']"));
  const getJobs = jobs.map((job) => {
    const [
      { href: link },
      {
        children: [
          {
            children: [
              { innerText: date },
              { innerText: title },
              { innerText: salary },
              { innerText: beneficios },
              {
                children: [elementEnterpriseCity],
              },
            ] = null,
          } = {},
        ] = null,
      },
    ] = job.children;

    const enterprise = elementEnterpriseCity?.querySelector("label")?.innerText;
    const city = elementEnterpriseCity?.querySelector("p")?.innerText;

    return {
      link,
      date,
      title,
      salary,
      beneficios,
      enterprise,
      city,
    };
  });

  return getJobs;
}

function filterJobs(jobs) {
  const JobsFilterBySalaryAndCity = jobs.filter((job) => {
    return job.salary.toString().search(/[\d]/) >= 0 && job.city;
  });

  return JobsFilterBySalaryAndCity;
}

const portBackground = chrome.runtime.connect({ name: "content-background" });

portBackground.postMessage({ cmd: "online" });

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === "scrap") {
      const jobsInformation = getJobInformation();
      const buttonNext = document.querySelector("[class*=next]");
      const nextPage = !buttonNext.className.includes("disable");

      portBackground.postMessage({
        cmd: "getInfo",
        jobsInformation: filterJobs(jobsInformation),
        nextPage,
      });
    }
  });
});

const port = chrome.runtime.connect({ name: "contenct-popup" });
portBackground.onMessage.addListener(async ({ cmd, data }) => {
  if (cmd === "finish") {
    port.postMessage({ cmd, data });
  }
});
