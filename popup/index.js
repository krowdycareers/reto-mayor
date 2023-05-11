const btnScripting = document.getElementById("btnscript");
const btnStop = document.getElementById("btnstop");
const btnReset = document.getElementById("btnreset");
const pMessageElement = document.getElementById("mensaje")
const checkbox = document.getElementById("allpages");
const input = document.getElementById("numberpages");
const resultContainer = document.getElementById("result");

checkbox.addEventListener("change", () => {

  checkbox.checked == true ? input.disabled = true : input.disabled = false
})


btnScripting.addEventListener("click", async () => {
  const port = chrome.runtime.connect({ name: "popup-background" })
  const valueInput = input.value
  console.log(valueInput);
  if (checkbox.checked) {

    port.postMessage({ cmd: "start", valueInput: "0" })
    pMessageElement.innerText = "Procesando..."
  }
  else if (valueInput != "") {
    const valueNumber = parseInt(valueInput)
    if (isNaN(valueNumber) || valueNumber < 1)
      alert("Debes ingresar numeros validos ")
    else {
      port.postMessage({ cmd: "start", valueInput })
      pMessageElement.innerText = "Procesando..."
    }
  }
  else {
    alert("Debes de escribir el numero de paginas o marcar 'Todas las paginas'")
  }
});
btnStop.addEventListener("click", async () => {
  const port = chrome.runtime.connect({ name: "popup-background" })
  port.postMessage({ cmd: "stop" })
});
btnReset.addEventListener("click", async () => {
  const port = chrome.runtime.connect({ name: "popup-background" })
  port.postMessage({ cmd: "reset" })
  input.value = ""
  input.disabled = false
  checkbox.checked = false
  pMessageElement.innerText = "No hay Resultados"
  resultContainer.innerHTML = ''
});

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === "showJobs") {
      chrome.storage.local.get("results", result => {
        pMessageElement.innerText = result.results.country
        const salaryRange = result.results.rangos.map(item => {
          const div = document.createElement('div')
          const p1 = document.createElement('p');
          const p2 = document.createElement('p');
          p1.textContent = item.salary;
          p1.classList.add("salary")
          p2.textContent = item.cant;
          div.appendChild(p1)
          div.appendChild(p2)
          return div

        })

        salaryRange.forEach(p => resultContainer.appendChild(p));
      })
    }
  })
})