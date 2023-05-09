const textArea = document.getElementById("textScrap");
const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");


btnStart.addEventListener("click", async () => {
 let port = chrome.runtime.connect({name: "popup-background"});
 port.postMessage({cmd: "start"});
 chrome.runtime.onMessage.addListener(function ({message}) {
        textArea.innerText = JSON.stringify(message);
 })
});


