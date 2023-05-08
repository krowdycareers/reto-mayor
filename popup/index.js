const btnScripting = document.getElementById("btnscript");
const pmessageElement = document.getElementById("mensaje")
btnScripting.addEventListener("click", async () => {
  var port = chrome.runtime.connect({ name: "popup-background" });
  if (port) {
    port.postMessage({ cmd: "start" });
  } else {
    console.error("El puerto no está disponible");


  }
}
);
chrome.runtime.onMessage.addListener(function(request) {
  if (request.jobs) {
    const jobs=request.jobs;
    while (pmessageElement.firstChild) {
      pmessageElement.removeChild(pmessageElement.firstChild);
    }
    for (const region in jobs) {
      const regionObj = jobs[region];
      const regionNombre = region;
      const regionElemento = document.createElement("div");
    
      const regionTitulo = document.createElement("h2");
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
      
      pmessageElement.appendChild(regionElemento);
 
    } 
 //pmessageElement.innerText=JSON.stringify(request.jobs,null,2);
  }
});
