let jobs = [];
let start = false;

function addPageToUrl(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || "1";
  const newPage = parseInt(page) + 1;

  return url.replace(regex, `page=${newPage}`);
}

async function changeTabToNextPage(url, tabId) {
  const newUrl = addPageToUrl(url);
  await chrome.tabs.update(tabId, { url: newUrl });
}

// Converts string salary into key based of the min number in the range
function convertMinSalary(salaryRange) {
  const [inicioSalario] = salaryRange.split(" ");
  if (inicioSalario == "Sueldo") return "noMostrado";
  else {
    const valorSinSigno = inicioSalario.replace(/\$|,/g, "");
    const valorEntero = parseInt(valorSinSigno);
    if (valorEntero <= 15000) return "menos15";
    if (valorEntero > 15000 && valorEntero <= 50000) return "entre15y50";
    if (valorEntero > 50000) return "mas50";
  }
}

function convertData() {
  let newOrderByZone = [];

  jobs.forEach((job) => {
    let minSalary = convertMinSalary(job.salary);

    let index = -1;
    let zoneObj = newOrderByZone.find((orderedZone, i) => {
      if (job.zone == orderedZone.zone) {
        index = i;
        return true;
      }
    });

    if (index == -1) {
      // no existe esa zona, creo una nueva
      let newZone = {
        zone: job.zone,
        menos15: 0,
        entre15y50: 0,
        mas50: 0,
        noMostrado: 0,
      };
      newZone = { ...newZone, [minSalary]: 1 };
      newOrderByZone.push(newZone);
    } else {
      // Si existe, agregar + 1 a su contador
      const count = zoneObj[minSalary];
      newOrderByZone[index] = {
        ...zoneObj,
        [minSalary]: count + 1,
      };
    }
  });

  chrome.storage.local.set({ data: newOrderByZone }).then(() => {
    console.log("Value is set to", newOrderByZone);
  });
  // Para obtenerlo
  /* chrome.storage.local.get(["data"]).then((result) => {
    console.log(`Value currently is ${result.data}`);
  }); */
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender, response) {
    const { cmd } = params;
    if (cmd == "start") {
      start = true;
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      let port = chrome.tabs.connect(tab.id, { name: "bg-content_script" });
      port.postMessage({ cmd: "scrap" });
    }
    if (cmd == "online") {
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

    if (cmd == "getInfo") {
      const { jobsInfo, nextPage } = params;
      jobs = [...jobs, ...jobsInfo];

      if (nextPage) {
        const {
          sender: {
            tab: { url, id },
          },
        } = sender;
        changeTabToNextPage(url, id);
      } else {
        start = false;
        convertData();
      }
    }
  });
});
