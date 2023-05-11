function getJobsInformation() {
  // Find all the job card elements on the page
  const jobsElementInformation = [
    ...document.querySelectorAll("div[id*=jobcard]"),
  ];

  // Extract relevant job information from each card element
  const jobJsonInformation = jobsElementInformation.map((el) => {
    const location = el.querySelector("[class*=zonesLinks]").innerText;

    const [
      { },
      {
        children: [
          {
            children: [{ }, { innerText: title }, { innerText: salary }],
          },
        ],
      },
    ] = el.children;

    // Extract the numeric range of the salary (if present)
    const salaryRange = /\d/.test(salary)
      ? salary.replace(/[^\d-]/g, "")
      : "Sueldo omitido";
    // Return an object with the job information
    return { title, salary: salaryRange, location };
  });

  return jobJsonInformation;
}

// Connect to the background script and notify it that this script is online
const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

portBackground.postMessage({ cmd: "online" });

// Listen for messages from the background script
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd == "scrap") {
      // Get the job information from the current page
      const jobsInformation = getJobsInformation();

      // Check if there is a next page button on the page
      const btnNext = document.querySelector("[class*=next]");
      const nextPage = !btnNext.className.includes("disabled");

      // Send the job information and next page status to the background script
      portBackground.postMessage({
        cmd: "getInfo",
        jobsInformation,
        nextPage,
      });
    }
  });
});