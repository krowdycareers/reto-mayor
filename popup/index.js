function groupJobsJSON(jobsJson) {
    const groupingByLocationSalary = jobsJson.reduce((result, job) => {
        const splitLocation = job.location.split("\n");
        const location = splitLocation[2] ?? [0];
        const salary = job.salary;

        if (!result[location]) {
            result[location] = {};
        }

        if (!result[location][salary]) {
            result[location][salary] = [];
        }

        result[location][salary].push(job);

        return result;
    }, {});
    return groupingByLocationSalary;
}
function generateTemplateToPrint(groupingJobs) {
    let template = ``;
    for (const location in groupingJobs) {
        if (Object.hasOwnProperty.call(groupingJobs, location)) {
            const item = groupingJobs[location];
            template += `
                <table class="table-jobs">
                    <thead>
                        <tr>
                            <th colspan="2">Localización: ${location} </th>
                        </tr>
                    </thead>
                    <tbody> 
            `;
            for (const k in item) {
                if (Object.hasOwnProperty.call(item, k)) {
                    const salary = item[k];
                    template += `
                            <tr>
                                <td>${k}</td>
                                <td>${salary.length}</td>
                            </tr>`;
                }
            }
            template += `</tbody> </table>`;
        }
    }
    return template;
}
const btnScripting = document.getElementById("btnscript");
const pMessageElement = document.getElementById("message");

btnScripting.addEventListener("click", async () => {
    var port = chrome.runtime.connect({ name: "popup-background" });
    port.postMessage({ cmd: "start" });
    setInterval(function () {
        chrome.storage.local.get("scrapingJobs", function ({ scrapingJobs }) {
            console.log(scrapingJobs);
            if (scrapingJobs) {
                scrapingJobs = JSON.parse(scrapingJobs);
                pMessageElement.innerHTML = generateTemplateToPrint(
                    groupJobsJSON(scrapingJobs)
                );
            }
        });
    }, 2000);
});
