let jobs = [];
let start = false;
let limitPage = 2;

// function to add page number to url
const addPageToUrl = (url) => {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || 1;
  const newPage = parseInt(page) + 1;

  return url.replace(regex, `page=${newPage}`);
};

// function to change tab to next page
const changeTabToNextPage = async (url, tabId) => {
  const newUrl = addPageToUrl(url);

  await chrome.tabs.update(tabId, {
    url: newUrl,
  });
};

// function to group job information by location and salary
const groupJobInformation = () => {
  const finalJobsInfomation = jobs.reduce((acc, obj) => {
    const { location, salary } = obj;
    let jobLocation = acc[location];

    if (!jobLocation) {
      jobLocation = {
        title: location,
        salaries: [],
      };
      acc[location] = jobLocation;
    }

    const salaryObj = jobLocation.salaries.find((el) => el.amount === salary);
    if (!salaryObj) {
      jobLocation.salaries.push({ amount: salary, count: 1 });
    } else {
      salaryObj.count += 1;
    }

    return acc;
  }, {});

  return Object.values(finalJobsInfomation);
};

// onConnect listener to listen to messages from the popup
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const { cmd } = params;

    // if message cmd is "start", set start to true and send message to content script to start scraping
    if (cmd === "start") {
      start = true;

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      let port = chrome.tabs.connect(tab.id, { name: "bg-content_script" });

      port.postMessage({ cmd: "scrap" });
    }


    // if message cmd is "getInfo", add jobs information to jobs array, and go to next page if limit is not reached
    // else group the jobs information by location and salary, set start to false and send message to popup to show jobs information 
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



        chrome.runtime.sendMessage({ cmd: "showJobsInfomation", data: data });
      }
    }


    // if message cmd is "online", send message to content script to start scraping if start is true 
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