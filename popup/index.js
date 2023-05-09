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
    
  }
});

let card = (d) => {
  return `<div class="card">
            <div class="card__title">Titulo : ${d.Titulo}</div>
            <div class="card__categoria">Fecha : ${d.Fecha}</div>
            <div class="card__categoria">Lugar : ${d.Lugar}</div>
            <div class="card__categoria">Categoria : ${d.Categoria}</div>
            <div class="card__categoria">SubCategoria : ${d.Subcategoria}</div>
          </div>`;
};

function setDataInHTML(jobsSorted) {
  const eleDiv = document.createElement("div");

  

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

  pMessageElement.innerHTML = "";
  pMessageElement.appendChild(eleDiv);
}

//Funcion sorted
function sortBySalary(jobList) {
  
  const arrayFiltrado = jobList.filter((elemento) => elemento !== null);
  
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


function obtenerDatos() {
  const datos = JSON.parse(localStorage.getItem("datos")) || [];
  return datos;
}


function saveListJobs(nuevoDato) {
  const datos = obtenerDatos();
  datos.push(nuevoDato);
  localStorage.setItem("datos", JSON.stringify(datos));
}

