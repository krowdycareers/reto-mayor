let jobs = [];
let start = false;

function addPageToURL(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || "1";
  const nextPage = parseInt(page) + 1;

  return url.replace(regex, `page=${nextPage}`);
}

async function changeTabToNextPage(url, tabid) {
  const newURL = addPageToURL(url);
  await chrome.tabs.update(tabid, { url: newURL });
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const { cmd } = params;
    if (cmd == "start") {
      start = true;
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab) {
        let port = chrome.tabs.connect(tab.id, { name: "bg-content_script" });
        port.postMessage({ cmd: "scrap" });
      } else {
        console.log("No se encontró el tab activo");
        return;
      }
    }
    if (cmd == "getInfo") {
      const { jobsInformation, nextPage } = params;
      jobs = [...jobs, ...jobsInformation];

      const dataJobs = jobs;

      chrome.storage.local.set({ jobs }, () => {
        console.log("La data ha sido guardada", jobs);
      });

      if (nextPage) {
        const {
          sender: {
            tab: { url, id },
          },
        } = sender;
        changeTabToNextPage(url, id);
      }

      chrome.runtime.sendMessage({ cmd: "dataJobs", jobs: dataJobs });
      start = false;
    }
  });
});
