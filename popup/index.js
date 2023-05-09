//Conexion a "Background"
const btnScripting = document.getElementById("btnscript");
const pMessageElement = document.getElementById("mensaje");

btnScripting.addEventListener("click", async () => {
  var port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ cmd: "start" });
});

chrome.runtime.onMessage.addListener(function ({ message, datos }) {
  if (message == "getAccumJobs") {
    let saveInLocal = saveListJobs(datos);
    let getSavedData = obtenerDatos();
    let dataJobsSorted = sortBySalary(getSavedData.flat());
    console.log(dataJobsSorted);
    setDataInHTML(dataJobsSorted);
    //  pMessageElement.innerText = JSON.stringify(dataJobsSorted, null, 3)
  }
});

let card = (d) => {
  return `<div class="card">
            <div class="card__title">title : ${d.Titulo}</div>
            <div class="card__categoria">date : ${d.Fecha}</div>
            <div class="card__categoria">salary : ${d.Lugar}</div>
            <div class="card__categoria">salary : ${d.Categoria}</div>
            <div class="card__categoria">lugar : ${d.SubCategoria}</div>
          </div>`;
};

function setDataInHTML(jobsSorted) {
  const eleDiv = document.createElement("div");

  // Crea las filas de datos

  let dinosaurio = `
    <div class="accordion accordion-flush" id="accordionFlushExample">

        ${jobsSorted
          .map((item, i) => {
            return `
              <div class="accordion-item">

                <h2 class="accordion-header">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${i}collap" aria-expanded="true" aria-controls="flush-collapseOne">
                    ${item.Salarios}
                  </button>
                </h2>

                <div id="${i}collap" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                  <div class="accordion-body">
                    ${item.Trabajos.map((t) => {
                      return card(t);
                    }).join(" ")}
                  </div>
                </div>

              </div>`;
          })
          .join(" ")}
      </div>`;

  eleDiv.innerHTML = dinosaurio;

  // Agrega la tabla al elemento contenedor en el HTML
  // const contenedor = document.getElementById("contenedor");
  pMessageElement.innerHTML = "";
  pMessageElement.appendChild(eleDiv);
}

//Funcion sorted
function sortBySalary(jobList) {
  // console.log('Desde function',jobList);
  const arrayFiltrado = jobList.filter((elemento) => elemento !== null);
  // console.log('Desde function sin null',arrayFiltrado);
  let jobsInfoArray = arrayFiltrado.map((el) => {
    return el.Salario;
  });

  let groupBySalary = jobsInfoArray.filter((v, i, a) => {
    return a.indexOf(v) == i;
  });
  let salaryFilterResult = groupBySalary.map((salary) => {
    let filteredJob = arrayFiltrado.filter((result) =>
      result.Salario.includes(salary)
    );
    return {
      maxAmount: salary.replace(/,/g, "").match(/\d+(?=[^0-9]*$)/)
        ? parseInt(salary.replace(/,/g, "").match(/\d+(?=[^0-9]*$)/)[0])
        : "Salario no mostrado por compañía.",
      Salarios: salary,
      Trabajos: filteredJob,
    };
  });
  let validateString = "Salario no mostrado por compañía.";
  let sortedJobsBySalaryAmount = salaryFilterResult
    .filter((objJob) => objJob.maxAmount !== validateString)
    .sort((a, b) => b.maxAmount - a.maxAmount);

  let concatJobsObject = [
    ...sortedJobsBySalaryAmount,
    ...salaryFilterResult.filter(
      (objJob) => objJob.maxAmount == validateString
    ),
  ];

  let resultJsonJobs = concatJobsObject.map((t) => {
    return { Salarios: t.Salarios, Trabajos: t.Trabajos };
  });
  return resultJsonJobs;
}

//Read
function obtenerDatos() {
  const datos = JSON.parse(localStorage.getItem("datos")) || [];
  return datos;
}

//Create
function saveListJobs(nuevoDato) {
  const datos = obtenerDatos();
  datos.push(nuevoDato);
  localStorage.setItem("datos", JSON.stringify(datos));
}
// //Update
// function actualizarDato(indice, nuevoDato) {
//   const datos = obtenerDatos();
//   if (indice >= 0 && indice < datos.length) {
//     datos[indice] = nuevoDato;
//     localStorage.setItem('datos', JSON.stringify(datos));
//     return true;
//   }
//   return false;
// }
// //Delete
// function eliminarDato(indice) {
//   const datos = obtenerDatos();
//   if (indice >= 0 && indice < datos.length) {
//     datos.splice(indice, 1);
//     localStorage.setItem('datos', JSON.stringify(datos));
//     return true;
//   }
//   return false;
// }
