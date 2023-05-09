const btnScripting = document.getElementById("btnscript");
const btnClearLocalStorage = document.getElementById("clearLocalStorage");
const mainContainer = document.querySelector("main");
let ObjectGeneral = {};
const output = {};

const ranges = [
  { name: "3000 - 5000", min: 3000, max: 5000 },
  { name: "5000 - 7000", min: 5000, max: 7000 },
  { name: "7000 - 9000", min: 7000, max: 9000 },
  { name: "10000 - 13000", min: 10000, max: 13000 },
  { name: "13000 - 16000", min: 13000, max: 16000 },
  { name: "16000 - 2000", min: 16000, max: 20000 },
  { name: "20000 - 25000", min: 20000, max: 25000 },
];

const convertAll = (jobs) => {
  let jobsFilter = jobs.filter(
    (job) =>
      job.city.length > 0 &&
      (job.salary.primeraParteInt > 0 || job.salary.segundaParteInt > 0) &&
      job
  );

  for (const obj of jobsFilter) {
    const cityName = obj.city;
    const salaryRange = getRange(obj.salary);

    if (!output[cityName]) {
      output[cityName] = {};
    }

    if (!output[cityName][salaryRange]) {
      output[cityName][salaryRange] = {};
    }

    const count = Object.keys(output[cityName][salaryRange]).length + 1;

    output[cityName][salaryRange][count] = obj;
  }

  function getRange(salary) {
    const { primeraParteInt, segundaParteInt } = salary;
    const salarySum = primeraParteInt + segundaParteInt;

    for (const range of ranges) {
      if (salarySum >= range.min && salarySum <= range.max) {
        return range.name;
      }
    }

    return "";
  }

  for (const key in output) {
    for (const iterator in output[key]) {
      table = `
      <table>
        <thead>
          <tr>
            <th colspan="2">${key}</th>
          </tr>
          <tr>
            <th>Rango salarial</th>
            <th>Conteo</th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <td>${iterator}</td>
              <td>${Object.keys(output[key][iterator]).length}</td>
            </tr>
        </tbody>
      </table>
    `;

      mainContainer.insertAdjacentHTML("beforeend", table);
    }

  }
};

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(({ cmd, jobs }) => {
    if (cmd === "end") {
      convertAll(jobs);

      chrome.storage.local.set({ jobs }, () => {
        console.log("Información guardada en el almacenamiento local");
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["jobs"], ({ jobs }) => {
    //Si existen datos en el ls, entonces se imprimen
    if (jobs) {
      convertAll(jobs);
    }
  });
});

btnScripting.addEventListener("click", () => {
  // chrome.storage.local.get(["jobs"], ({ jobs }) => {
  // if(jobs === undefined) {
  const port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "start" });
  // }
  // });
  // messageElement.textContent = 'Cargando...'
});

btnClearLocalStorage.addEventListener("click", () => {
  chrome.storage.local.remove("jobs", () => {
    console.log("Información eliminada del almacenamiento local");
  });
});
