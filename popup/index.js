const btnScripting = document.getElementById("btnscript");
const btnStorage = document.getElementById("btnstorage");
const btnReset = document.getElementById("btnreset");
const paragraph = document.getElementById("message");
const count = document.getElementById("count");

const locations = document.getElementById("locations");

async function updateData() {
  await chrome.storage.local.get(["jobs"], (res) => {
    if (!res.jobs) {
      locations.innerText = "No hay resultados";
    } else {
      const jobs = JSON.parse(res.jobs);
      locations.innerText = "";
      jobs.forEach((j) => {
        locations.insertAdjacentHTML("beforeend", `<h3>${j.location}</h3>`);
        j.salaryRanges.forEach((sr) => {
          locations.insertAdjacentHTML(
            "beforeend",
            `<p>${sr.salaryRange} - ${sr.jobCount}</p>`
          );
        });
      });
    }
  });
}

btnScripting.addEventListener("click", async () => {
  var port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "start" });
  locations.innerText = "Scrapeando...";
});

btnStorage.addEventListener("click", () => updateData());

btnReset.addEventListener("click", () => {
  chrome.storage.local.clear();
  locations.innerText = "";
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.msg == "end") {
    updateData();
  }
});
