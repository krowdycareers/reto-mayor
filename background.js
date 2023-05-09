let jobs = [];
let start = false;
let limitPage = 2;

const addPageToUrl = (url) => {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || 1;
  const newPage = parseInt(page) + 1;

  return url.replace(regex, `page=${newPage}`);
};

const changeTabToNextPage = async (url, tabId) => {
  const newUrl = addPageToUrl(url);

  await chrome.tabs.update(tabId, {
    url: newUrl,
  });
};

const groupJobInformation = () => {
  let finalJobsInfomation = jobs.reduce((acc, obj) => {
    if (!acc[obj.location]) {
      acc[obj.location] = {
        title: obj.location,
        salaries: [],
      };
    }

    if (!acc[obj.location].salaries.some((el) => el.amount === obj.salary)) {
      !acc[obj.location].salaries.push({ amount: obj.salary, count: 0 });
    }

    acc[obj.location].salaries[
      acc[obj.location].salaries.findIndex((el) => el.amount === obj.salary)
    ].count += 1;

    return acc;
  }, {});

  let array = Object.values(finalJobsInfomation);

  return array;
};

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

    if (cmd === "getInfo") {
      const { jobsInformation, nextPage } = params;

      jobs = [...jobs, ...jobsInformation];

      if (nextPage && limitPage > 0) {
        const {
          sender: {
            tab: { url, id },
          },
        } = sender;

        changeTabToNextPage(url, id);
        limitPage--;
      } else {
        start = false;
        const data = groupJobInformation();

        // chrome.storage.local.set({ jobsInformation: data });

        chrome.runtime.sendMessage({ cmd: "showJobsInfomation", data: data });
      }
    }

    if (cmd === "online") {
      const {
        sender: {
          tab: { id },
        },
      } = sender;

      if (start) {
        let port = chrome.tabs.connect(id, { name: "bg-content_script" });

        port.postMessage({ cmd: "scrap" });
      }
    }
  });
});
