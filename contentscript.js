function getJobsInformation() {
  const jobsElementInformation = [
    ...document.querySelectorAll("div[id*=jobcard]"),
  ];

  const jobJsonInformation = jobsElementInformation.map((el) => {
    const location = el.querySelector("[class*=zonesLinks]").innerText;

    const [
      {},
      {
        children: [
          {
            children: [{}, { innerText: title }, { innerText: salary }],
          },
        ],
      },
    ] = el.children;

    const salaryRange = /\d/.test(salary)
      ? salary.replace(/[^\d-]/g, "")
      : "Sueldo omitido";

    return { title, salary: salaryRange, location };
  });

  return jobJsonInformation;
}

const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

portBackground.postMessage({ cmd: "online" });

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd == "scrap") {
      const jobsInformation = getJobsInformation();
      const btnNext = document.querySelector("[class*=next]");
      const nextPage = !btnNext.className.includes("disabled");

      portBackground.postMessage({
        cmd: "getInfo",
        jobsInformation,
        nextPage,
      });
    }
  });
});
