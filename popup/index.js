const btnScripting = document.getElementById("btnscript");
const divMessage = document.getElementById("mensaje");
const btnClear = document.getElementById("btnClear");
btnScripting.addEventListener("click", async () => {
  var port = chrome.runtime.connect({ name: "popup-background" });
  if (port) {
    port.postMessage({ cmd: "start" });
    btnScripting.disabled = true;
    btnClear.disabled = false;
  } else {
    console.error("El puerto no está disponible");
  }
});

btnClear.addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { cmd: "clearStorage" });
  });
  divMessage.innerHTML = "";
  btnScripting.disabled = false;
  btnClear.disabled = true;
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request.jobs) {
    const jobs = request.jobs;
    while (divMessage.firstChild) {
      divMessage.removeChild(divMessage.firstChild);
    }
    for (const region in jobs) {
      const regionObj = jobs[region];
      const regionNombre = "Ubicacion: " + region;
      const regionElemento = document.createElement("div");

      const regionTitulo = document.createElement("h3");
      regionTitulo.textContent = regionNombre;

      regionElemento.appendChild(regionTitulo);

      const regionLista = document.createElement("ul");
      regionElemento.appendChild(regionLista);

      for (const salario in regionObj) {
        const salarioValor = regionObj[salario];
        const salarioTexto = salario + ": " + salarioValor;
        const salarioElemento = document.createElement("li");
        salarioElemento.textContent = salarioTexto;
        regionLista.appendChild(salarioElemento);
      }

      divMessage.appendChild(regionElemento);
    }
  }
});
