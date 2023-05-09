const btnScripting = document.getElementById("btnscript");
const pMessageElement = document.getElementById("mensaje")

btnScripting.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const port = chrome.runtime.connect({ name: "popup-background" });
  port.onMessage.addListener(function ({ message }) {
    pMessageElement.innerText = JSON.stringify(message, null, 2);
  })
  port.postMessage({ cmd: "start", tab: tab });
});


