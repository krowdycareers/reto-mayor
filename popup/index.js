// Se obtienen los elementos HTML por su ID
const btnScripting = document.getElementById('btnscript')
const tableID = document.getElementById('table')
const procesandoID = document.getElementById('procesandoID')
const btnStop = document.getElementById('btnStop')
const exportBtn = document.getElementById('export-btn');

// Se deshabilita el botón de parar, se oculta el mensaje de "procesando" y el botón de exportar
btnStop.disabled = true
procesandoID.style.display = 'none'
exportBtn.style.display = 'none'

// Función para crear un elemento 'tr' (fila de tabla)
const createTR = () => document.createElement('tr')

// Función para crear un elemento 'td' (celda de tabla) con el texto especificado
const createTD = (str) => {
  const td = document.createElement('td')
  td.innerText = str
  return td
}

// Función para crear un elemento 'th' (celda de encabezado de tabla) con el texto especificado
const createTH = (str) => {
  const th = document.createElement('tH')
  th.innerText = str
  return th
}

// Función para crear el contenido de una fila de tabla, utilizando los datos de un objeto 'element', y agregarlo al elemento 'tableBody'
function createContentBody(element, tableBody) {
  const tr = createTR()
  const td = createTD(element.salary.replace('Mensual', ''))
  const td2 = createTD(element.count)

  tr.append(td, td2)
  return tableBody.append(tr)
}

// Función para crear la tabla a partir del cuerpo de la tabla y agregar el encabezado
function createcontentTable(tBody) {
  const table = document.createElement('table')
  const tHead = document.createElement('thead')
  const tr = createTR()
  tr.append(createTH('Rango salarial'), createTH('Cantidad de Vacantes'))

  tHead.append(tr)
  table.append(tHead, tBody)
  return table
}

/**
 * Función que obtiene los trabajos guardados en el almacenamiento local de Chrome,
 * los organiza por ubicación y los muestra en una tabla en el DOM.
 * También se encarga de iniciar y detener el proceso de scraping a través del puerto de conexión
 * con la extensión de Chrome, y se activa cuando se detectan cambios en el almacenamiento local.
 */
function printJobs() {
  // Obtenemos los trabajos desde el almacenamiento local de Chrome
  chrome.storage.local.get('scrapperJobs', (items) => {
    // Si encontramos trabajos en el almacenamiento
    if (typeof items.scrapperJobs !== 'undefined') {
      // Parseamos los datos del objeto almacenado como JSON
      const jobsObject = JSON.parse(items.scrapperJobs)

      // Iteramos sobre cada ciudad en los trabajos obtenidos
      for (const key in jobsObject.data) {
        // Creamos un fragmento de documento para almacenar temporalmente elementos del DOM
        const fragment = document.createDocumentFragment()
        // Creamos un elemento tbody para la tabla de trabajos de cada ciudad
        const tBody = document.createElement('tbody')
        // Creamos un encabezado para la ciudad
        const titleUbicacion = document.createElement('h5')

        // Convertimos la clave vacía a "Sin especificar" para mostrar en la interfaz
        const ubicacionStr = key === '' ? 'Sin especificar' : key
        titleUbicacion.innerText = ` ${ubicacionStr}`
        // Agregamos un atributo "data-label" a titleUbicacion
        titleUbicacion.setAttribute('data-label', 'Ciudad')

        // Para cada trabajo en la ciudad actual
        jobsObject.data[key].forEach((el) => {
          // Creamos un elemento tr para la fila de la tabla
          // y un td para el salario y otro td para el número de vacantes
          createContentBody(el, tBody)
        })

        // Creamos una tabla y la agregamos al fragmento de documento
        const table = createcontentTable(tBody)
        fragment.append(titleUbicacion, table)
        // Agregamos el fragmento de documento al elemento de la tabla en la interfaz
        tableID.appendChild(fragment)
      }
    }
  })
}

// Iniciamos el proceso de scrapping cuando hacemos clic en el botón de "Scripting"
const port = chrome.runtime.connect({ name: 'popup-background' })

btnScripting.addEventListener('click', async () => {
  procesandoID.style.display = 'block'
  btnStop.disabled = false

  // Removemos todos los elementos hijos de la tabla
  while (tableID.firstChild) {
    tableID.removeChild(tableID.firstChild)
  }
  // Enviamos un mensaje al script de fondo para iniciar el proceso de scrapping
  port.postMessage({ cmd: 'start' })
})

// Agregamos un listener para los cambios en el almacenamiento local de Chrome
chrome.storage.onChanged.addListener((e, a) => {
  // Actualizamos la tabla de trabajos en la interfaz
  printJobs()
  procesandoID.style.display = 'none'
  btnStop.disabled = true
  exportBtn.style.display = 'block';//
})

// Imprimimos los trabajos al cargar la página
printJobs()

// Detenemos el proceso de scrapping cuando hacemos clic en el botón de "Stop"
btnStop.onclick = () => {
  port.postMessage({ cmd: 'stop' })

  btnStop.disabled = true
}

//Función que exporta las tablas a formato CSV para su descarga
function exportToCSV() {
  // Selecionar todas las tablas presentes en la página
  const tables = document.querySelectorAll('table');
  const csvData = [];

  // Iterar sobre cada tabla encontrada
  tables.forEach((table) => {
    // Selecionar todas las filas presentes en la tabla
    const rows = table.querySelectorAll('tr');
    const tableData = [];

    // Obtener el nombre de la ciudad desde el título de la tabla
    const cityName = table.previousSibling.textContent.trim();
    tableData.push(`Ciudad: ${cityName}`);

    // Iterar sobre cada fila encontrada en la tabla
    rows.forEach((row) => {
      // Selecionar todas las celdas presentes en la fila
      const cols = row.querySelectorAll('td, th');
      const rowData = [];

      // Iterar sobre cada celda encontrada en la fila
      cols.forEach((col) => {
        // Añadir el contenido de la celda a rowData
        rowData.push(col.textContent.trim());
      });

      // Unir las celdas en una sola fila y agregarlas a tableData
      tableData.push(rowData.map((value) => `"${value}"`).join(','));
    });

    // Unir las filas en una sola tabla y agregarlas a csvData
    csvData.push(tableData.join('\n'));
  });

  // Unir todas las tablas en una sola cadena y crear un enlace de descarga
  const csv = csvData.join('\n\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + '\uFEFF' + encodeURI(csv);
  a.target = '_blank';
  a.download = 'tablas.csv';
  document.body.appendChild(a);
  a.click();
}

// Agregar un evento click al botón de exportar
exportBtn.addEventListener('click', exportToCSV);
