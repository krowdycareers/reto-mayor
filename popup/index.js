const btnScripting = document.getElementById("btnscript");
const pMessageElement = document.getElementById("mensaje");

btnScripting.addEventListener("click", async () => {
    var port = chrome.runtime.connect({ name: "popup-background" });
    chrome.storage.local.remove("jobs");
    port.postMessage({ cmd: "start" });

});

function groupJobsByLocationAndSalary(jobs) {
    return jobs.reduce((grouped, job) => {
        const { location, salary } = job;

        const city = location.trim();
        const salaryRange = salary.trim();

        if (!grouped[city]) {
            grouped[city] = {};
        }

        if (!grouped[city][salaryRange]) {
            grouped[city][salaryRange] = 0;
        }

        grouped[city][salaryRange]++;

        return grouped;
    }, {});
}

function displayGroupedJobs(groupedJobs) {
    const jobListElement = document.querySelector(".job-list");

    Object.entries(groupedJobs).forEach(([city, salaries]) => {
        const cityElement = document.createElement("div");
        cityElement.innerHTML = `
        <h3><strong>Ciudad: ${city}</strong></h3>
        <hr>`;
        jobListElement.appendChild(cityElement);

        Object.entries(salaries).forEach(([salaryRange, count]) => {
            const salaryElement = document.createElement("div");
            salaryElement.innerHTML = `
          <div class="salary">${salaryRange}</div>
          <div class="count">${count}</div>
        `;
            salaryElement.classList.add("salaries");
            cityElement.appendChild(salaryElement);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get("jobs", function (result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            const jobs = result.jobs || [];

            const groupedJobs = groupJobsByLocationAndSalary(jobs);

            displayGroupedJobs(groupedJobs);
        }
    });
});



