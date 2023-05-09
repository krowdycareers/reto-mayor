const btnScripting = document.getElementById("btncomunicacion");
const pMensaje = document.getElementById("mensajes");
const jobsDiv = document.getElementById("jobs");

btnScripting.addEventListener("click", async () => {
  const port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "start" });
});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd, data }) => {
    if (cmd === "finish") {
      jobsDiv.removeChild(pMensaje);
      let child = document.createElement("p");
      child.innerHTML = getString(data);
      jobsDiv.appendChild(child);
    }
  });
});

function getString(data) {
  text = "";
  cities = Object.keys(data);
  cities.forEach((city) => {
    this.text += `<strong>Pais/Ciudad</strong>: ${city}<br>`;
    Object.keys(data[city]).forEach((salary) => {
      this.text += `<strong>Salario :</strong> ${salary} <strong>Cantidad : </strong>${data[city][salary]}<br>`;
    });
    this.text += "<br>";
  });
  return this.text;
}
