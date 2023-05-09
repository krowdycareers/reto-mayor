const btnScripting = document.getElementById("btnscript");
const jobListElement = document.querySelector(".job-list");

btnScripting.addEventListener("click", async () => {
  const port = chrome.runtime.connect({ name: "popup-background" });

  // Se utiliza async/await para asegurarse de que se haya eliminado el valor de "jobs" antes de ejecutar el siguiente comando
  await chrome.storage.local.remove("jobs");

  port.postMessage({ cmd: "start" });
});

function groupJobsByLocationAndSalary(jobs) {
  // Se utiliza destructuración de objetos para obtener los valores de location y salary
  return jobs.reduce((grouped, { location, salary }) => {
    const city = location.trim();
    const salaryRange = salary.trim();

    // Se utiliza operador ternario para simplificar la creación de las propiedades si no existen
    grouped[city] = grouped[city] ? grouped[city] : {};
    grouped[city][salaryRange] = grouped[city][salaryRange] ? grouped[city][salaryRange] + 1 : 1;

    return grouped;
  }, {});
}

function displayGroupedJobs(groupedJobs) {
  // Se utiliza const en lugar de let para declarar las variables que no se les reasigna un valor
  const jobFragment = document.createDocumentFragment();

  Object.entries(groupedJobs).forEach(([city, salaries]) => {
    const cityElement = document.createElement("div");
    cityElement.innerHTML = `
      <h3><strong>Ciudad: ${city}</strong></h3>
      <hr>
    `;

    const salariesFragment = document.createDocumentFragment();

    Object.entries(salaries).forEach(([salaryRange, count]) => {
      const salaryElement = document.createElement("div");
      salaryElement.innerHTML = `
        <div class="salary">${salaryRange}</div>
        <div class="count">${count}</div>
      `;
      salaryElement.classList.add("salaries");
      salariesFragment.appendChild(salaryElement);
    });

    cityElement.appendChild(salariesFragment);
    jobFragment.appendChild(cityElement);
  });

  // Se utiliza replaceChildren en lugar de innerHTML para asegurarse de que los elementos antiguos se eliminen antes de agregar los nuevos
  jobListElement.replaceChildren(jobFragment);
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("jobs", function ({ jobs }) {
    // Se utiliza destructuración de objetos para obtener el valor de jobs
    const groupedJobs = groupJobsByLocationAndSalary(jobs || []);
    displayGroupedJobs(groupedJobs);
  });
});