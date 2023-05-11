const btnStartScrap = document.getElementById("btnStartScrap");
const btnStop = document.getElementById("btnStop");
const spinner = document.getElementById("spinner");
const results = document.getElementById("results");

const backgroundPort = chrome.runtime.connect({ name: "popup-background" });

// funcion para crear elementos con texto dentro
const createElementWithText = (elementType, innerString) => {
  const element = document.createElement(elementType);
  element.innerText = innerString;
  return element;
};

// crea una nueva fila en la tabla con el elemento y la tabla que se le pasa
const addRowToTable = (element, tableBody) => {
  const tr = document.createElement("tr");
  const td = createElementWithText("td", element.salary.replace("Mensual", "")); // Rango Salarial
  const td2 = createElementWithText("td", element.count); // Cantidad de vcantes

  tr.append(td, td2);
  return tableBody.append(tr);
};

/* crea una tabla con un Head por defecto y con el Body que le pasen */
const createcontentTable = (tBody) => {
  const table = document.createElement("table");
  table.setAttribute("class", "table");
  const tHead = document.createElement("thead");
  const tr = document.createElement("tr");
  tr.append(
    createElementWithText("th", "Salario"),
    createElementWithText("th", "Vacantes")
  );

  tHead.append(tr);
  table.append(tHead, tBody);
  return table;
};

const printAnalysis = () => {
  chrome.storage.local.get("jobsAnalysis", (items) => {
    if (typeof items.jobsAnalysis !== "undefined") {
      results.innerHTML = ""; //limpia el div de resultados
      const jobsObject = JSON.parse(items.jobsAnalysis); //convierte a Json el String guardado
      const fragment = document.createDocumentFragment(); // fragment y vamos poniendo todo ahi al final solo habra un porceso para a;adir todo al dom

      // recorre el objeto
      for (const key in jobsObject.data) {
        const tBody = document.createElement("tbody");
        const localidad = document.createElement("h5");

        const localidadStr = key === "" ? "Sin especificar localidad" : key;
        localidad.innerText = ` ${localidadStr}`;

        jobsObject.data[key].forEach((el) => {
          addRowToTable(el, tBody); // crea un elemento fila (con el) en tBody
        });

        const table = createcontentTable(tBody);
        fragment.append(localidad, table);
        results.appendChild(fragment);
      }
    }
  });
};

btnStartScrap.addEventListener("click", (e) => {
  //limpia el div results
  results.innerHTML = ``;
  // manda el comando start al background
  backgroundPort.postMessage({ cmd: "start" });

  // muestra boton Stop y Spinner
  btnStop.classList.remove("d-none");
  spinner.classList.remove("d-none");
  btnStartScrap.classList.add("d-none");
});

chrome.storage.onChanged.addListener((e, a) => {
  printAnalysis();
});

printAnalysis();

btnStop.onclick = () => {
  backgroundPort.postMessage({ cmd: "stop" });
  btnStop.classList.add("d-none");
  spinner.classList.add("d-none");
  btnStartScrap.classList.remove("d-none");
};
