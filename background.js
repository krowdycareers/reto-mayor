let jobs = [];
let start = false;

let allJobsInformation = [];

function addPageToUrl(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || '1';
  const newPage = parseInt(page) + 1;

  return url.replace(regex, `page=${newPage}`);
}

async function changeTabToNextPage(url, tabId) {
  const newURL = addPageToUrl(url)
  await chrome.tabs.update(tabId, {url: newURL})
}

function buildAllJobsInformation(scrapedJobs) {
  scrapedJobs.forEach(scrapedJob => {
    let jobHasLocation = allJobsInformation.findIndex(j => {
      return j.location === scrapedJob.location;
    });
    if (jobHasLocation >= 0) {
      let jobHasSalary = allJobsInformation[jobHasLocation].salaryRange.findIndex(j => {
        return j.salary === scrapedJob.salary;
      });
      if (jobHasSalary >= 0) {
        allJobsInformation[jobHasLocation].salaryRange[jobHasSalary].jobsCount += 1;
      } else {
        allJobsInformation[jobHasLocation].salaryRange.push({salary: scrapedJob.salary, jobsCount: 1})
      }
    } else {
      allJobsInformation.push({
        location: scrapedJob.location,
        salaryRange: [
          {salary: scrapedJob.salary, jobsCount: 1}
        ]
      });
    }
  })
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const {cmd} = params;
    if (cmd === "start") {
      start = true;
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      let port = chrome.tabs.connect(tab.id, { name: "bg-content_script" });
      port.postMessage({ cmd: "scrap" });
    }
    if (cmd === "online") {
      const {
        sender:
          {tab: {id}},
      } = sender;
      if (start) {
        let port = chrome.tabs.connect(id, { name: "bg-content_script" });
        port.postMessage({ cmd: "scrap" });
      }
    }
    if (cmd === "getInfo") {
      const {jobsInformation, isLastPage} = params;
      jobs = [...jobs, ...jobsInformation];
      buildAllJobsInformation(jobsInformation);
      const {
        sender:
          {tab: {id}},
      } = sender;
      let port = chrome.tabs.connect(id, {name: 'bg-content_script'});
      port.postMessage({cmd: 'saveLocal', allJobsInformation: allJobsInformation});
      if (isLastPage) {
        const {
          sender:
            {
              tab: {url, id}
            },
        } = sender;
        changeTabToNextPage(url, id);
      } else {
        start = false;
        let port = chrome.tabs.connect(id, {name: 'bg-content_script'});
        port.postMessage({cmd: 'finished'});
      }
    }
  });
});
