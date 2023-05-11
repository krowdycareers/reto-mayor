let jobs = [];
let start = false;

function addPageToURL(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || "1";
  const newPage = parseInt(page) + 1;

  return url.replace(regex, `page=${newPage}`);
}

async function changeTabtoNextPage(url, tabid) {
  const newURL = addPageToURL(url);
  await chrome.tabs.update(tabid, { url: newURL });
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params) {
    const { cmd } = params;
    if (cmd === "start") {
      start = true;
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab) {
        let port = chrome.tabs.connect(tab.id, { name: "bg-content_script" });
        port.postMessage({ cmd: "scrap" });
      }
    }

    if (cmd === "getInfo") {
      const { jobsInformation} = params;
      jobs = [...jobsInformation];

      const jobsJSON = jobs;
    
      chrome.storage.local.set({ jobs }, () => {
        console.log("Data saved to local storage", jobs);
      });

      start = false;

      chrome.runtime.sendMessage({ cmd: "dataJobs", jobs: jobsJSON });
    }
  });
});
