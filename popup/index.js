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
      (job.salary.min > 0 || job.salary.max > 0) &&
      job
  );

  const result = {};

  jobsFilter.forEach((item) => {
    const city = item.city;
    const salary = item.salary;

    const range = ranges.find((range) => {
      return salary.min >= range.min && salary.max <= range.max;
    });

    if (!range) {
      return;
    }

    const rangeName = range.name;
    const rangeIndex = Object.keys(result[city] || {}).length;

    if (!result[city]) {
      result[city] = {};
    }

    if (!result[city][rangeName]) {
      result[city][rangeName] = {};
    }

    result[city][rangeName][rangeIndex] = item;
  });

    for (const key in result) {
      for (const iterator in result[key]) {
        table = `
        <div class="container">
    <table class="table table-bordered">
      <thead>
        <tr>
          <th colspan="2" class="text-center">${key}</th>
        </tr>
        <tr>
          <th>Rango salarial</th>
          <th>Conteo</th>
        </tr>
      </thead>
      <tbody>
          <tr>
            <td>${iterator}</td>
            <td>${Object.keys(result[key][iterator]).length}</td>
          </tr>
      </tbody>
    </table>
  </div>
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
    if (jobs) {
      convertAll(jobs);
    }
  });
});

btnScripting.addEventListener("click", () => {
  const port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "start" });
});

btnClearLocalStorage.addEventListener("click", () => {
  chrome.storage.local.remove("jobs", () => {
    console.log("Información eliminada del almacenamiento local");
  });
});
