let jobs = [];
let start = false;

const saveObjectInlocalStorage = async function (obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ jobs: obj });
    } catch (ex) {
      reject(ex);
    }
  });
};

const getObjectInlocalStorage = async function (obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(obj, function (value) {
        resolve(value);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

function addPageToURL(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || "1";
  const newPage = parseInt(page) + 1;
  if (!match) {
    return url + `&page=${newPage}`;
  }
  return url.replace(regex, `page=${newPage}`);
}

async function changeTabToNextPage(url, tabid) {
  const newURL = addPageToURL(url);
  await chrome.tabs.update(tabid, { url: newURL });
}

const filterJobsByCity = (jobs) => {
  const newJobs = {};
  jobs.forEach(({ city, salary }) => {
    if (!newJobs[city]) {
      newJobs[city] = {};
    }
    if (newJobs[city][salary]) {
      newJobs[city][salary] += 1;
    } else {
      newJobs[city][salary] = 1;
    }
  });
  return newJobs;
};

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const { cmd } = params;
    if (cmd === "start") {
      jobs = [];
      start = true;
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      let port = chrome.tabs.connect(tab.id, {
        name: "backgroud-content_script",
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
          name: "backgroud-content_script",
        });
        port.postMessage({ cmd: "scrap" });
      }
    }
    if (cmd === "getInfo") {
      const { jobsInformation, nextPage } = params;
      jobs = [...jobs, ...jobsInformation];
      if (nextPage) {
        const {
          sender: {
            tab: { url, id },
          },
        } = sender;
        changeTabToNextPage(url, id);
      } else {
        start = false;
        saveObjectInlocalStorage(filterJobsByCity(jobs));
        port.postMessage({ cmd: "finish", data: filterJobsByCity(jobs) });
      }
    }
  });
});
