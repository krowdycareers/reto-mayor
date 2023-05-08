let jobs = [];
let start = false;
let pageCount = 5;

function addPageToURL(url){
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = match && match[1] || "1";
  const newPage = parseInt(page) + 1;

  return url.replace(regex,`page=${newPage}`);
}

async function changeTabtoNextPage(url, tabid){
  const newURL = addPageToURL(url);
  await chrome.tabs.update(tabid, { url: newURL });
}

function transformedJSONData(transformedData){
  const filteredData = [];

  transformedData.forEach(item => {
    const existingCity = filteredData.find(city => city.city === item.city);

    if (existingCity) {
      const existingSalaryRange = existingCity.rango.find(range => range.salario === item.salaryRange);

      if (existingSalaryRange) {
        existingSalaryRange.cantidad++;
      } else {
        existingCity.rango.push({
          salario: item.salaryRange,
          cantidad: 1
        });
      }
    } else {
      filteredData.push({
        city: item.city,
        rango: [
          {
            salario: item.salaryRange,
            cantidad: 1
          }
        ]
      });
    }
  });

  return filteredData;
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const { cmd } = params;
    if (cmd === "start") {
      start = true;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        let port = chrome.tabs.connect(tab.id, { name: "bg-content_script" });
        port.postMessage({ cmd: "scrap" });
      } else {
        console.log("No se encontró una pestaña activa.");
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

    if (cmd === "getInfo") {
      const { jobsTransformed, nextPage } = params;
      jobs = [...jobs, ...jobsTransformed];

      if (nextPage && pageCount > 0) {
        const {
          sender: {
            tab: { url, id },
          },
        } = sender;
        changeTabtoNextPage(url, id);
        pageCount--;
      } else {
        start = false;
        const jobsJSON = transformedJSONData(jobs);
        chrome.storage.local.set({ jobs: jobsJSON });
        chrome.runtime.sendMessage({ cmd: "sendJobs", jobs: jobsJSON });
        jobs = [];
        start = false;
        pageCount = 5;
      }
    }
  });
});

