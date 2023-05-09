let start = false;
function addPageToURL(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || "1";
  const newPage = parseInt(page) + 1;
  return url.replace(regex, `page=${newPage}`);
}
async function changeTabToNextPage(url, tabid) {
  const newURL = addPageToURL(url);
  await chrome.tabs.update(tabid, { url: newURL });
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
          tab: { id },
        },
      } = sender;

      if (start) {
        let port = chrome.tabs.connect(id, { name: "bg-content_script" });
        port.postMessage({ cmd: "scrap" });
      }
    }
    if (cmd === "getInfo") {
      const { jobsInformation, nextPage } = params;

      if (nextPage) {
        const {
          sender: {
            tab: { url, id: tabid },
          },
        } = sender;
        changeTabToNextPage(url, tabid);
      } else {
        start = false;

        function obtenerCiudadesTexto(ciudad) {
          if (ciudad.includes(",")) {
            let partes = ciudad.split(",");
            let ciudadFinal = partes[1].trim();
            return ciudadFinal;
          }
          if (ciudad == "") {
            ciudad = "Ubicacion no mostrada";
          }
          return ciudad;
        }

        const JobsCitySalaryGroups = jobsInformation.reduce(
          (cityGroups, job) => {
            const ciudad = obtenerCiudadesTexto(job.ciudad);
            const salario = job.salario
              .replace("Mensual", "")
              .replace("\n+ comisiones", "")
              .replace("Por Hora", "");

            if (!cityGroups[ciudad]) {
              cityGroups[ciudad] = {};
            }

            if (!cityGroups[ciudad][salario]) {
              cityGroups[ciudad][salario] = [];
            }

            cityGroups[ciudad][salario].push(job);

            return cityGroups;
          },
          {}
        );
        const jobCountByCitySalary = Object.keys(JobsCitySalaryGroups).reduce(
          (acc, city) => {
            acc[city] = Object.keys(JobsCitySalaryGroups[city]).reduce(
              (acc2, salary) => {
                acc2[salary] = JobsCitySalaryGroups[city][salary].length;
                return acc2;
              },
              {}
            );
            return acc;
          },
          {}
        );

        chrome.runtime.sendMessage({ jobs: jobCountByCitySalary });
      }
    }
  });
});