const getJobsInformation = () => {
    const jobCardsAsNodeList = document.querySelectorAll('[id*="jobcard"]');
    return [...jobCardsAsNodeList].map((job) => {
      const jobSalary = job.querySelector("[class*='salary-']").textContent.trim().replace(/\s+/g, " ");
      const ubication = job.querySelector("[class*='zonesLinks'").innerText;
  
      return { ubication, jobSalary };
    });
  };
  
  const groupJobsByUbication = (arrayWithJobsInformation) =>
    arrayWithJobsInformation.reduce((acc, { ubication, jobSalary }) => {
      const amountJobsByUbicationAndSalary = acc[ubication]?.[jobSalary]?.amountOfJobs || 0;
  
      if (!acc[ubication]) acc[ubication] = {};
  
      if (!acc[ubication][jobSalary])
        acc[ubication][jobSalary] = {
          amountOfJobs: 1,
        };
      else acc[ubication][jobSalary].amountOfJobs = amountJobsByUbicationAndSalary + 1;
  
      return acc;
    }, {});
  
  const portBackground = chrome.runtime.connect({
    name: "content_script-background",
  });
  
  portBackground.postMessage({ command: "online" });
  let getListenerWithJobsInformation;
  
  chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(({ cmd }) => {
      if (cmd === "scrap") {
        getListenerWithJobsInformation = getJobsInformation();
        const buttonNext = document.querySelector("[class*=next]");
  
        const nextPage = !buttonNext.className.includes("disabled");
  
        const getJobInformationFromLocalStorage = localStorage.getItem("jobsInformation");
  
        if (nextPage) {
          if (getJobInformationFromLocalStorage) {
            const parseJobInformationFromLocalStorage = JSON.parse(getJobInformationFromLocalStorage);
            localStorage.setItem("jobsInformation", JSON.stringify([...parseJobInformationFromLocalStorage, ...getListenerWithJobsInformation]));
          } else {
            localStorage.setItem("jobsInformation", JSON.stringify(getListenerWithJobsInformation));
          }
        } else {
          const jobsInformationForThisDay = JSON.parse(getJobInformationFromLocalStorage);
          getListenerWithJobsInformation = groupJobsByUbication([...jobsInformationForThisDay, ...getListenerWithJobsInformation]);
        }
  
        portBackground.postMessage({ command: "getInfo", getListenerWithJobsInformation, nextPage });
      }
    });
  });