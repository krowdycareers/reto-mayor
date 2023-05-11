let start = false;
let jobs = [];
let counter = 1;

const addNewPageToURL = async (url) => {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = match && match[1];
  const newPage = parseInt(page) + 1;

  if (!page) {
    return url + "?page=1";
  }
  return `${url.replace(regex, `page=${newPage}`)}`;
};

const changeTabToNextPage = async (url, tabid) => {
  const newURL = await addNewPageToURL(url);
  await chrome.tabs.update(tabid, { url: newURL });
};

chrome.runtime.onConnect.addListener((port) => {

  port.onMessage.addListener(async (params, sender) => {
    const { cmd } = params;

    if (cmd == "start") {
      start = true;

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      let port = chrome.tabs.connect(tab.id, {
        name: "bg-content_script",
      });
      port.postMessage({ cmd: "scrap" });
    }

    if (cmd == "online") {
      start = true;

      const {
        sender: {
          tab: { id },
        },
      } = sender;

      if (start) {
        let port = chrome.tabs.connect(id, {
          name: "bg-content_script",
        });
        port.postMessage({ cmd: "scrap" });
      }
    }

    if (cmd == "getInfo") {
      const { jobsInformation, nextPage } = params;

      jobs = [...jobs, ...jobsInformation];

      if (nextPage && counter < 5) {
        const {
          sender: {
            tab: { url, id },
          },
        } = sender;
        changeTabToNextPage(url, id);
        counter++;

      } else {
        start = false;

        const portIndex = chrome.runtime.connect({name: "background-index"});
        portIndex.postMessage({ cmd: "end",  jobs });

        jobs = [];
        counter = 0;
      }
    }

  });
});
