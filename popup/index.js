const btnScripting = document.getElementById("btnscript");

const jobCard = document.getElementById("jobCard");

btnScripting.addEventListener("click", async () => {
  chrome.storage.local.remove(["jobs"]);
  jobCard.textContent = "Procesando...";
  setTimeout(() => {
    jobCard.textContent = "";
    let port = chrome.runtime.connect({ name: "popup-background" });
    port.postMessage({ cmd: "start" });
  }, 3000);

  btnScripting.innerText = "Next Page ➡️";
});

chrome.runtime.onMessage.addListener(function (params) {
  const { cmd, jobs } = params;
  let data = "";
  if (cmd == "dataJobs" && jobs) {
    jobs.forEach((e) => {
      const { salary, country } = e;
      data += `<tr>
                <td>${salary}</td>
                <td>${country}</td>
              </tr>`;
    });
    jobCard.innerHTML = data;
  }
});
