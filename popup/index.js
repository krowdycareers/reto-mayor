const btnScripting = document.getElementById('btnscript')
const tableID = document.getElementById('table')
const procesandoID = document.getElementById('procesandoID')
const btnStop = document.getElementById('btnStop')

btnStop.disabled = true
procesandoID.style.display = 'none'

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
      const fragment = document.createDocumentFragment()
      const HTMLDate = document.createElement('h4')
      HTMLDate.setAttribute('data-label', 'Fecha de obtencion de Datos: ')

      HTMLDate.textContent = `${jobsObject.date}`
      fragment.append(HTMLDate)

      for (const key in jobsObject.data) {
        const tBody = document.createElement('tbody')
        const titleHubicacion = document.createElement('h5')

        const hubicacionStr = key === '' ? 'Sin especificar' : key
        titleHubicacion.innerText = ` ${hubicacionStr}`
        titleHubicacion.setAttribute('data-label', 'Hubicacion')

        jobsObject.data[key].forEach((el) => {
          createContentBody(el, tBody)
        })

        const table = createcontentTable(tBody)
        fragment.append(titleHubicacion, table)
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
})

printJobs()

btnStop.onclick = () => {
  port.postMessage({ cmd: 'stop' })

  btnStop.disabled = true
}
