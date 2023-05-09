const btnScripting = document.getElementById("btnscript");
const jobsList = document.getElementById("jobs-list");

btnScripting.addEventListener("click", async () => {
  chrome.storage.local.remove("jobs");
  var port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "inicio" });
});

function displayJobs(jobs) {
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    jobsList.innerText = 'No se encontraron resultados';
    return;
  }

  jobsList.innerHTML = '';

  jobs.forEach(job => {
    const jobElement = document.createElement('div');
    jobElement.classList.add('job-element');

    const jobCity = document.createElement('p');
    jobCity.classList.add('job-city');
    jobCity.innerText = "Ciudad: " + job.city;

    jobElement.appendChild(jobCity);

    job.rango.forEach(rango => {
      const jobSalary = document.createElement('p');
      jobSalary.classList.add('job-salary');
      jobSalary.innerText = "Rango Salarial: " + rango.salario;

      const jobList = document.createElement('ul');
      jobList.classList.add('job-list');

      const jobListItem = document.createElement('li');
      jobListItem.innerText = "Trabajos: " + rango.cantidad;

      jobList.appendChild(jobListItem);

      jobElement.appendChild(jobSalary);
      jobElement.appendChild(jobList);
    });

    jobsList.appendChild(jobElement);
  });
}

chrome.runtime.onMessage.addListener(function (message) {
  const { cmd, jobs } = message;

  if (cmd === "sendJobs" && jobs) {
    displayJobs(jobs);
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }
});

document.addEventListener("DOMContentLoaded", function() {
  const savedJobs = localStorage.getItem("jobs");
  if (savedJobs) {
    const jobs = JSON.parse(savedJobs);
    displayJobs(jobs);
  }
});