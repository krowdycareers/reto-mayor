const BTN_START_SCRAP = document.getElementById("btnscript");
const SPINNER = document.getElementById("spinner");
const SUMARY = document.getElementById("sumary");

BTN_START_SCRAP.addEventListener("click", async () => {
  SPINNER.style.display = 'block';
  var port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "start" });
  BTN_START_SCRAP.disabled = true;
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request.status === 'finished') {
    SUMARY.insertAdjacentHTML('beforeend', request.template);
    SPINNER.style.display = 'none';
  }
});
