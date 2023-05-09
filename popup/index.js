const btnScripting = document.getElementById("btnScript");
const btnScriptingClear = document.getElementById("btnScriptClear");

const jobsList = document.getElementById("jobs-list");

const selectPage = document.getElementById('select-page');


btnScripting.addEventListener("click", async () => {
  chrome.storage.local.remove("jobs");
  jobsList.innerText = "Procesando...";

  var port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "start" });
});


btnScriptingClear.addEventListener("click", async () => {
    chrome.storage.local.clear();
    chrome.storage.local.remove("jobs");
    jobsList.innerText = 'No se encuentran trabajos';
});


selectPage.addEventListener('change', () => {
    const selectedValue = selectPage.value;
    chrome.runtime.sendMessage({ selectedValue });
});

// creacion de elementos
const createJobElement = (job) => {
    const jobElement = document.createElement('div');
    jobElement.classList.add('job-element');
  
    //creacion del campo ciudad
    const jobCity = document.createElement('p');
    jobCity.classList.add('job-city');
    jobCity.innerText = job.city;
    jobElement.appendChild(jobCity);
  
    //optencion de rango salarial y cantidad de trabajos
    job.rango.forEach(rango => {
      const jobSalary = document.createElement('p');
      jobSalary.classList.add('job-salary');
      jobSalary.innerHTML = "<span style='font-weight: bold;color: black;'>Rango Salario:</span>&nbsp;" + rango.salario;
      // creacion de parrafo de cantidad de puestos de trabajo
      const jobAmount = document.createElement('p');
      jobAmount.classList.add('job-amount');
      jobAmount.innerHTML = "<span style='font-weight: bold;'>Empl-Disponibles:</span>&nbsp;" + rango.cantidad;
      jobElement.appendChild(jobSalary);
      jobElement.appendChild(jobAmount);
    });
  
    return jobElement;
}

const showJobs = (jobs) => {
    
  if (!jobs || jobs.length === 0) {
    jobsList.innerText = 'No se encuentran trabajos';
    return;
  }

  jobsList.innerHTML = '';

  const jobElements = jobs.map(job => createJobElement(job));
  jobsList.append(...jobElements);
}


chrome.runtime.onMessage.addListener(function (message) {
  const { cmd, jobs } = message;

  if (cmd === "submitJobs" && jobs) {
    showJobs(jobs);
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }
});

document.addEventListener("DOMContentLoaded", function() {
  const savedJobs = localStorage.getItem("jobs");
  if (savedJobs) {
    const jobs = JSON.parse(savedJobs);
    showJobs(jobs);
  }
});