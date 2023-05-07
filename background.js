let jobs = {};
let start = false;

function addPageToURL(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || "1";
  const newPage = parseInt(page) + 1;

  return url.replace(regex, `page=${newPage}`);
}

function unifiedJobs(filteredJobs) {
  for (let key1 in filteredJobs) {
    if (jobs.hasOwnProperty(key1)) {
      for (let key2 in filteredJobs[key1]) {
        if (jobs[key1].hasOwnProperty(key2)) {
          jobs[key1][key2] += filteredJobs[key1][key2];
        } else {
          jobs[key1][key2] = filteredJobs[key1][key2];
        }
      }
    } else {
      jobs[key1] = filteredJobs[key1];
    }
  }
}

async function changeTabToNextPage(url, id) {
  const newUrl = addPageToURL(url);
  await chrome.tabs.update(id, { url: newUrl });
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const { cmd } = params;
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
        sender: {
          tab: { url, id },
        },
      } = sender;
      if (start) {
        let port = chrome.tabs.connect(id, { name: "bg-content_script" });
        port.postMessage({ cmd: "scrap" });
      }
    }
    if (cmd === "getInfo") {
      const { filteredJobs, pageNext } = params;
      unifiedJobs(filteredJobs);
      if (pageNext) {
        const {
          sender: {
            tab: { url, id },
          },
        } = sender;
        changeTabToNextPage(url, id);
      } else {
        start = false;
        chrome.storage.session.set({ jobs: jobs }).then(() => {
          console.log("Value is set to ", jobs);
        });
      }
    }
  });
});
