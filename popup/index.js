const btnScripting = document.getElementById("btnScript");
const btnClearStorage = document.getElementById("btnClearStorage");

const jobCard = document.getElementById("jobCard");


btnScripting.addEventListener("click", async () => {
  chrome.storage.local.remove(["jobs"]);
  jobCard.textContent = "Procesando...";
  setTimeout(() => {
    jobCard.textContent = "";
    var port = chrome.runtime.connect({ name: "popup-background" });
    port.postMessage({ cmd: "start" });
  }, 3000);

});


chrome.runtime.onMessage.addListener(function (message) {
  const { cmd, jobs } = message;
  let html = "";
  if (cmd === "dataJobs" && jobs) {
    jobs.forEach((e) => {
      html += `
      <div class="card">
        <h2> ${e.country}</h2>
        <p> ${e.salaryRange} </p>
      </div>
      `;
    });
    jobCard.innerHTML = html;

  }
});


