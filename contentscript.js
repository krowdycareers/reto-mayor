console.log("Ejecutando el content script 2.0");
function getJobInformation() {
  const elemCardJobs = [...document.querySelectorAll('[id*="jobcard-"]')];
  const jobs = elemCardJobs.map((cardJob) => {
    
    const location = cardJob.querySelector("[class*=link-0-2-605]:last-child").innerText;
    const [
      { href: url },
      {
        children: [
          {
            children: [
              { innerText: date },
              { innerText: title },
              { innerText: salary },
            ],
          },
        ],
      },
    ] = cardJob.children; 

    return {location, salary};
  });

  return jobs;
}

//Connect to background
const portBackground = chrome.runtime.connect({ name: "content-background" });

portBackground.onMessage.addListener(async ({ message }) => {
  if ((message = "nextpage")) {
    const nextPageButton = document.querySelector("[class*=next-]");
    nextPageButton.click();
  }
});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function ({ message }) {
    if (message === "getJobs") {
      const jobs = getJobInformation();
      port.postMessage({ message: "ok", data: jobs });
      portBackground.postMessage({ message: "finish" });
    }
  });
});
