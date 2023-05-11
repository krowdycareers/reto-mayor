const ports = {};
let jobs = [];
let start = false;
let counter = 1;

const addPageToURL = (url) => {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || "1";
  const nextPage = parseInt(page) + 1;
  return url.replace(regex, `page=${nextPage}`);
};

const changeTabToNextPage = async (url, tabId) => {
  const newURL = addPageToURL(url);
  await chrome.tabs.update(tabId, { url: newURL });
};

const setFormatToJobsInfo = (jobsToFormat) => {
  const uniqueJobDate = [...new Set(jobsToFormat.map((item) => item.jobDate))];

  const jobsInfo = uniqueJobDate.map((date) => {
    const jobsByDate = jobsToFormat.filter((job) => job.jobDate === date);

    const uniqueJobSalaryRange = [
      ...new Set(jobsByDate.map((item) => item.jobSalary)),
    ];

    const jobsSalaryRangeDetails = uniqueJobSalaryRange.map((salary) => {
      const jobsDetails = jobsByDate.filter((job) => job.jobSalary === salary);

      return {
        salaryRange: salary,
        jobsDetails,
      };
    });

    return {
      jobsDate: date,
      jobsSalaryRange: jobsSalaryRangeDetails,
    };
  });

  const jobsInfoFormatted = {};

  jobsInfo.forEach((job) => {
    const jobDate = job.jobsDate;
    const salaryInfo = {};

    job.jobsSalaryRange.forEach((range) => {
      const salaryRange = range.salaryRange;
      const jobCount = range.jobsDetails.length;
      salaryInfo[salaryRange] = jobCount;
    });

    jobsInfoFormatted[jobDate] = salaryInfo;
  });

  return jobsInfoFormatted;
};

chrome.runtime.onConnect.addListener((port) => {
  ports[port.name] = port;

  port.onMessage.addListener(
    async ({ cmd, jobsInformation, nextPage }, sender) => {
      if (cmd === "start") {
        start = true;
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        let port = chrome.tabs.connect(tab.id, {
          name: "background-content_script",
        });
        port.postMessage({ cmd: "scrap" });
      }

      if (cmd === "online") {
        const {
          sender: {
            tab: { id },
          },
        } = sender;

        if (start) {
          let port = chrome.tabs.connect(id, {
            name: "background-content_script",
          });

          port.postMessage({ cmd: "scrap" });
        }
      }

      if (cmd === "getInfo") {
        jobs = [...jobs, ...jobsInformation];

        if (nextPage && counter < 3) {
          const {
            sender: {
              tab: { url, id },
            },
          } = sender;
          changeTabToNextPage(url, id);
          counter++;
        } else {
          const jobsInfoFormatted = setFormatToJobsInfo(jobs);

          ports["popup-background"].postMessage({
            cmd: "end",
            data: jobsInfoFormatted,
          });

          start = false;
          jobs = [];
          counter = 0;
        }
      }
    }
  );
});
