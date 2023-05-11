let start = false;

function addPageToUrl(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || "1";
  const newPage = parseInt(page) + 1;

  return url.replace(regex, `page=${newPage}`);
}

async function changeTabToNextPage(url, tabId) {
  const newURL = addPageToUrl(url);
  await chrome.tabs.update(tabId, { url: newURL });
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const { command } = params;
    if (command === "start") {
      start = true;
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      let port = chrome.tabs.connect(tab.id, { name: "background-content_script" });
      port.postMessage({ cmd: "scrap" });
    }
    if (command === "online") {
      const {
        sender: {
          tab: { id },
        },
      } = sender;

      let port = chrome.tabs.connect(id, { name: "background-content_script" });

      port.postMessage({ cmd: "scrap" });
    }
    if (command === "getInfo") {
      const { getListenerWithJobsInformation, nextPage } = params;

      if (nextPage) {
        const {
          sender: {
            tab: { url, id },
          },
        } = sender;

        changeTabToNextPage(url, id);
      } else chrome.runtime.sendMessage({ command: "endScrap", result: getListenerWithJobsInformation });
    } else start = false;
  });
});