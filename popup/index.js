const btnScripting = document.getElementById("btnComunicacion");
const ldnMessage = document.getElementById("loading");
const scrapInfo = document.getElementById("scrapInfo");

 chrome.storage.session.clear(function () {
  var error = chrome.runtime.lastError;
  if (error) {
    console.error(error);
  }
  // do something more
});
 

chrome.storage.session.get(["jobs"]).then((result) => {
  if (result.jobs) {
    btnScripting.disabled = true;
    generateTable(result.jobs);
    scrapInfo.style.display = "table";
  }
});

btnScripting.addEventListener("click", async () => {
  ldnMessage.style.display = "block";
  btnScripting.disabled = true;
  var port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "start" });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    ldnMessage.style.display = "none";
    generateTable(newValue);
    scrapInfo.style.display = "table";
  }
});

function generateTable(jsonJobs) {
  const tbl = document.createElement("table");
  const tblBody = document.createElement("tbody");

  for (let key1 in jsonJobs) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    const cellText = document.createTextNode(key1);
    cell.appendChild(cellText);
    cell.style.fontWeight = "bold";
    row.appendChild(cell);
    tblBody.appendChild(row);
    for (let key2 in jsonJobs[key1]) {
      const row = document.createElement("tr");
      let cell = document.createElement("td");
      let cellText = document.createTextNode(key2);
      cell.appendChild(cellText);
      row.appendChild(cell);
      cell = document.createElement("td");
      cellText = document.createTextNode(jsonJobs[key1][key2]);
      cell.appendChild(cellText);
      row.appendChild(cell);

      tblBody.appendChild(row);
    }
  }

  tbl.appendChild(tblBody);
  scrapInfo.appendChild(tbl);
}
