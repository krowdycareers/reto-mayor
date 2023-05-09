function getJobsInformation() {
  let jobInfo = document.querySelectorAll("div[id*=jobcard]");
  jobInfo = [...jobInfo];
  const jobsJson = jobInfo.map((el) => {
    let location =
      el.children[1].children[0].children[
        el.children[1].children[0].children.length - 2
      ].innerText;
    const [
      { href: url },
      {
        children: [
          {
            children: [
              { innerText: fecha },
              { innerText: title },
              { innerText: salary },
            ],
          },
        ],
      },
    ] = el.children;

    return { url, title, salary, location };
  });
  return jobsJson;
}

function jobsFilter(jsonJobs) {
  const filteredJobs = {};

  jsonJobs.forEach((job) => {
    let location =
      job.location.split("\n\n")[1] ?? job.location.split("\n\n")[0];
    const regex = /CDMX/;
    if (location.match(regex)) {
      console.log("CDMX");
      location = "CDMX";
    } else {
      location = location.split(",")[0];
    }
    let salary = job.salary.split("\n")[0];
    if (filteredJobs.hasOwnProperty(location)) {
      if (filteredJobs[location].hasOwnProperty(salary)) {
        filteredJobs[location][salary]++;
      } else {
        filteredJobs[location][salary] = 1;
      }
    } else {
      filteredJobs[location] = { [salary]: 1 };
    }
  });
  console.log(
    "🚀 ~ file: contentscript.js:56 ~ jobsFilter ~ filteredJobs:",
    filteredJobs
  );
  return filteredJobs;
}

//Connect to background
const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

portBackground.postMessage({ cmd: "online" });

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === "scrap") {
      const jobsInformation = getJobsInformation();
      const filteredJobs = jobsFilter(jobsInformation);
      const btnNext = document.querySelector("[class*=next]");
      const pageNext = !btnNext.className.includes("disabled");
      portBackground.postMessage({ cmd: "getInfo", filteredJobs, pageNext });
    }
  });
});
