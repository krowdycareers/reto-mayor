// Selecting necessary elements from the DOM
const buttonSummary = document.querySelector("#button-summary");
const buttonRemove = document.querySelector("#button-remove");
const jobInformationContainer = document.querySelector("#job-information-container");
const loadingIndicator = document.querySelector("#loading-indicator");

// Function to draw job information on the webpage
const drawJobsInformation = (jobs) => {
  const jobCards = jobs.map((job) => {
    const title = `<h2 class="header">${job.title}</h2>`;
    const salaryItems = job.salaries.map((salary) => {
      const subtitle = `<p>${salary.amount}</p>`;
      const count = `<span>${salary.count}</span>`;
      return `<li>${subtitle} ${count}</li>`;
    }).join('');

    return `
      <li class="card">
        ${title} 
        <div class="body">
          <h3>
            <span>Rango</span>
            <span>Cantidad</span>
          </h3> 
          <ul>
            ${salaryItems}
          </ul>
        </div>
      </li>`;
  }).join('');

  jobInformationContainer.innerHTML = jobCards;
};

// Function to remove job information from localStorage and webpage
buttonRemove.addEventListener("click", () => {
  localStorage.removeItem("jobsInformation");

  drawJobsInformation([]);
});

// Function to retrieve job information from the server and display it on the webpage
buttonSummary.addEventListener("click", async () => {
  loadingIndicator.style.opacity = "1";
  loadingIndicator.style.display = "block";

  var port = chrome.runtime.connect({ name: "popup-background" });

  port.postMessage({ cmd: "start" });
});

// Function to listen for messages from the server and update the webpage accordingly
chrome.runtime.onMessage.addListener((message) => {
  const { cmd, data } = message;

  if (cmd === "showJobsInfomation") {
    localStorage.setItem("jobsInformation", JSON.stringify(data));

    loadingIndicator.style.opacity = "0";

    setTimeout(() => {
      loadingIndicator.style.display = "none";
    }, 500);
    drawJobsInformation(data);
  }
});

// Function to display job information on the webpage if it exists in localStorage
document.addEventListener("DOMContentLoaded", () => {
  const jobsInformation = localStorage.getItem("jobsInformation");

  if (jobsInformation) {
    drawJobsInformation(JSON.parse(jobsInformation));
  }
});