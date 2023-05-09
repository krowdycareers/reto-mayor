let jobs = {};
let start = false;

const addPageToUrl = (url) => {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || '1';
  const newPage = parseInt(page) + 1;

  return url.replace(regex, `page=${newPage}`);
};

const changeTabToNextPage = async (url, tabid) => {
  const newUrl = addPageToUrl(url);
  await chrome.tabs.update(tabid, { url: newUrl });
};

function filterJobs(jobJsonInfo) {
  jobJsonInfo.forEach((job) => {
    if (jobs.hasOwnProperty(job.location)) {
      if (jobs[job.location].hasOwnProperty(job.salary)) {
        jobs[job.location][job.salary].push(job);
      } else {
        jobs[job.location][job.salary] = [job];
      }
    } else {
      jobs[job.location] = {};
      jobs[job.location][job.salary] = [job];
    }
  });
}

chrome.runtime.onConnect.addListener(function (port) {
  console.log('connected - background');

  port.onMessage.addListener(async function (request, sender) {
    if (request.cmd === 'start') {
      start = true;
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      let contentPort = chrome.tabs.connect(tab.id, {
        name: 'bg-content_script',
      });
      contentPort.postMessage({ cmd: 'scrap' });
    }

    if (request.cmd === 'finish') {
      if (start) {
        start = false;
        console.log('finish', start);
      }
    }

    if (request.cmd === 'online') {
      const { id } = sender.sender.tab;

      if (start) {
        let contentPort = chrome.tabs.connect(id, {
          name: 'bg-content_script',
        });
        contentPort.postMessage({ cmd: 'scrap' });
      }
    }

    if (request.cmd === 'getInfo') {
      filterJobs(request.jobs);
      chrome.storage.local.set({ jobs: JSON.stringify(jobs) });

      if (request.nextPage) {
        const { url, id } = sender.sender.tab;
        changeTabToNextPage(url, id);
      } else {
        start = false;
      }
    }
  });
});
