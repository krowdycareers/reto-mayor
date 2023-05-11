const btnScripting = document.getElementById('btnscript')
const tableID = document.getElementById('table')
const procesandoID = document.getElementById('procesandoID')
const btnStop = document.getElementById('btnStop')
const exportBtn = document.getElementById('export-btn');

btnStop.disabled = true
procesandoID.style.display = 'none'
exportBtn.style.display = 'none'

const createTR = () => document.createElement('tr')

const createTD = (str) => {
  const td = document.createElement('td')
  td.innerText = str
  return td
}

const createTH = (str) => {
  const th = document.createElement('tH')
  th.innerText = str
  return th
}

function createContentBody(element, tableBody) {
  const tr = createTR()
  const td = createTD(element.salary.replace('Mensual', ''))
  const td2 = createTD(element.count)

  tr.append(td, td2)
  return tableBody.append(tr)
}

function createcontentTable(tBody) {
  const table = document.createElement('table')
  const tHead = document.createElement('thead')
  const tr = createTR()
  tr.append(createTH('Rango salarial'), createTH('Cantidad de Vacantes'))

  tHead.append(tr)
  table.append(tHead, tBody)
  return table
}

function printJobs() {
  chrome.storage.local.get('scrapperJobs', (items) => {
    if (typeof items.scrapperJobs !== 'undefined') {
      const jobsObject = JSON.parse(items.scrapperJobs)

      for (const key in jobsObject.data) {
        const fragment = document.createDocumentFragment()
        const tBody = document.createElement('tbody')
        const titleUbicacion = document.createElement('h5')

        const ubicacionStr = key === '' ? 'Sin especificar' : key
        titleUbicacion.innerText = ` ${ubicacionStr}`
        titleUbicacion.setAttribute('data-label', 'Ciudad')

        jobsObject.data[key].forEach((el) => {
          createContentBody(el, tBody)
        })

        const table = createcontentTable(tBody)
        fragment.append(titleUbicacion, table)
        tableID.appendChild(fragment)
      }
    }
  })
}

// start scrapping
const port = chrome.runtime.connect({ name: 'popup-background' })

btnScripting.addEventListener('click', async () => {
  procesandoID.style.display = 'block'
  btnStop.disabled = false

  while (tableID.firstChild) {
    tableID.removeChild(tableID.firstChild)
  }

  port.postMessage({ cmd: 'start' })
})

chrome.storage.onChanged.addListener((e, a) => {
  printJobs()
  procesandoID.style.display = 'none'
  btnStop.disabled = true
  exportBtn.style.display = 'block';//
})

printJobs()

btnStop.onclick = () => {
  port.postMessage({ cmd: 'stop' })

  btnStop.disabled = true
}

function exportToCSV() {
  const tables = document.querySelectorAll('table');
  const csvData = [];

  tables.forEach((table) => {
    const rows = table.querySelectorAll('tr');
    const tableData = [];

    // Obtener el nombre de la ciudad desde el título de la tabla
    const cityName = table.previousSibling.textContent.trim();
    tableData.push(`Ciudad: ${cityName}`);

    rows.forEach((row) => {
      const cols = row.querySelectorAll('td, th');
      const rowData = [];

      cols.forEach((col) => {
        rowData.push(col.textContent.trim());
      });

      tableData.push(rowData.map((value) => `"${value}"`).join(','));
    });

    csvData.push(tableData.join('\n'));
  });

  const csv = csvData.join('\n\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + '\uFEFF' + encodeURI(csv);
  a.target = '_blank';
  a.download = 'tablas.csv';
  document.body.appendChild(a);
  a.click();
}

exportBtn.addEventListener('click', exportToCSV);
