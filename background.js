let jobs = [];
let start = false;
let pageCount = 1;
let selectedValue;

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

const formattingJSONData = (transformedData) => {
  let filteredData = [];

  filteredData = transformedData.reduce((acc, item) => {
    const existingCity = acc.find(city => city.city === item.city);
    if (existingCity) {
        const rangeIndex = existingCity.rango.findIndex(range => range.salario === item.salaryRange);

        if (rangeIndex >= 0) {
          existingCity.rango[rangeIndex].cantidad++;
        } else {
          existingCity.rango.push({
            salario: item.salaryRange,
            cantidad: 1
          });
        }
    } else {
      acc.push({
        city: item.city,
        rango: [
          {
            salario: item.salaryRange,
            cantidad: 1
          }
        ]
      });
    }
  
    return acc;
  }, []);

  return filteredData;
}

chrome.runtime.onMessage.addListener((message) => {
  selectedValue = message.selectedValue;
  pageCount=selectedValue;
  console.log(`Valor seleccionado: ${selectedValue}`);
});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const { cmd } = params;
    if (cmd === "start") {
      start = true;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      let port = chrome.tabs.connect(tab.id, { name: "bg-content_script" });
      port.postMessage({ cmd: "scrap" });
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
      const { jobsFormatings, nextPage } = params;
      jobs = [...jobs, ...jobsFormatings];

      if (nextPage && pageCount > 0) {
        const {sender:{tab:{url,id}}}=sender;
        changeTabtoNextPage(url, id);
        pageCount--;
      } else {
        start = false;
        const jobsJSON = formattingJSONData(jobs);
        chrome.storage.local.set({ jobs: jobsJSON });
        chrome.runtime.sendMessage({ cmd: "submitJobs", jobs: jobsJSON });
        jobs = [];
        start = false;
        pageCount = selectedValue;
      }
    }
  });
});