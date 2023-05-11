const btnScripting = document.getElementById("btnscript");
const pMessageElement = document.getElementById("mensaje");
const divJobsElement = document.getElementById("container");

btnScripting.addEventListener("click", async () => {
  const port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "start" });
});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd, data }) => {
    if (cmd === "finish") {
      divJobsElement.removeChild(pMessageElement);
      let child = document.createElement("p");
      child.innerHTML = JSON.stringify(data);
      divJobsElement.appendChild(child);
    }
  });
});