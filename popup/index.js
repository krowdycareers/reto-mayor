//function que agrupa deacuerdo a la ciudad
let agrupar=(jobs)=> {
  const grupos = [];
  jobs.forEach(job => {
    const grupo = grupos.find(g => g.ciudad === job.ciudad);
    if (grupo) {
      grupo.jobs.push(job);
    } else {
      grupos.push({ ciudad: job.ciudad, jobs: [job] });
    }
  });
  return grupos.map(grupo => grupo.jobs);
}


//ordena los datos y listos para injectar en html
let sortData = (arrayData) => {

  let getMaxSalary = (text) => text.replace(/,/g, "").match(/\d+(?=[^0-9]*$)/)
  let index = arrayData.findIndex((element) => element[0].ciudad == undefined)
  if (index >= 0) {
    const [object] = arrayData.splice(index, 1);
    arrayData.push(object);
  }
  return arrayData.map((df) => {
    // console.log(df)
    let ordenado = df.sort((a, b) => {
      if (a.salario === "Sueldo no mostrado por la empresa") {
        return 1;
      } else if (b.salario === "Sueldo no mostrado por la empresa") {
        return -1;
      } else {
        return getMaxSalary(a.salario) - getMaxSalary(b.salario)
      }
    })

    return dropDownF(df[0].ciudad, ordenado)
  }).join(' ')
}



//asignamiento de datos guardados , evita el borrado al salir de la extension
chrome.storage.local.get(['arrayJobs'], (r) => {
  if (r.arrayJobs) {
    let jobs = r.arrayJobs || []

    containerCard.innerHTML = jobs
  } else {
    containerCard.innerHTML = template()
  }
  console.log(r.arrayJobs)
  console.log(r)
})


//variables
const btnScripting = document.getElementById("btncomunicacion");
const btnScriptingBackground = document.getElementById("btncomunicacionbckg");
const pMensaje = document.getElementById("mensajes");
const containerCard = document.querySelector('.container-dropDown')
inputMaxJobs.value = 3


//event button para traer los datos
btnScripting.addEventListener("click", async () => {
  let numberJobs = inputMaxJobs.value == '' ? 0 : inputMaxJobs.value
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  //envio la señal inicio de scrapear
  let port = chrome.tabs.connect(tab.id, { name: "popup" });
  port.postMessage({ message: "scrap", dataLimit: parseInt(numberJobs) });

  let loader = document.querySelector('.loader')
  loader ? loader.style.display = 'block' : ''

});


//event click para borra arrayJobs del local storage
deleteData.addEventListener('click', () => {
  chrome.storage.local.remove('arrayJobs', function () {
    console.log('Variable eliminada');
    containerCard.innerHTML = template()

  });
})



//respuesta del Background con Todos los jobs de todas las paginaciones
chrome.runtime.onMessage.addListener(function ({ message, datos }, sender, sendResponse) {

  if (message == 'finalData') {
    //agrupamos lo datos
    let data = agrupar(datos)
    let sortedData=sortData(data)
    containerCard.innerHTML = sortedData

    chrome.storage.local.set({ arrayJobs: sortedData })
  }
});


//component card
let card = (d) => {
  return `<div class="card">
            <div class="card__title">title : ${d.title}</div>
            <div class="card__categoria">date : ${d.fecha}</div>
            <div class="card__categoria">salary : ${d.salario}</div>
            <div class="card__categoria">lugar : ${d.ciudad}</div>
          </div>`
}


//component dropDown
let dropDownF = (view, list) => {

  return `<div class="dropDown">
            <div class="dropDown__view"><span>${view}</span><span>(${list.length})</span></div>
            <div class="dropDown__list">${list.map(e => card(e)).join(' ')}</div>
          </div>`
}


//solo muestra el template de inicio
let template = () => {
  return `<div class="template">
            <div class="loader">...cargando</div>
          </div>`
}