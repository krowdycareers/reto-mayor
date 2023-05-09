const btnScriptElement = document.getElementById('btn-script')
const messageElement = document.getElementById('message')

const backgroundPort = chrome.runtime.connect({ name: 'popup-background' })

backgroundPort.onMessage.addListener(({ cmd, data }) => {
  if (cmd === 'end') {
    createTable(data)
  }
})

btnScriptElement.addEventListener('click', () => {
  backgroundPort.postMessage({ cmd: 'start' })
  messageElement.textContent = 'Cargando...'
})

function createTable(data) {
  messageElement.textContent = ''

  for (let date in data) {
    let table = document.createElement('table')
    let thead = document.createElement('thead')
    let tbody = document.createElement('tbody')

    let dateRow = document.createElement('tr')
    let dateHeader = document.createElement('th')
    dateHeader.setAttribute('colspan', 2)
    dateHeader.textContent = date
    dateRow.appendChild(dateHeader)

    thead.appendChild(dateRow)

    let rangeCount = data[date]
    let rangeCountKeys = Object.keys(rangeCount)

    let rangeHeaderRow = document.createElement('tr')
    let rangeHeader = document.createElement('th')
    rangeHeader.textContent = 'Rango salarial'
    rangeHeaderRow.appendChild(rangeHeader)

    let countHeader = document.createElement('th')
    countHeader.textContent = 'Conteo'
    rangeHeaderRow.appendChild(countHeader)

    thead.appendChild(rangeHeaderRow)

    for (let i = 0; i < rangeCountKeys.length; i++) {
      let rangeCountRow = document.createElement('tr')

      let rangeCell = document.createElement('td')
      rangeCell.textContent = rangeCountKeys[i]
      rangeCountRow.appendChild(rangeCell)

      let countCell = document.createElement('td')
      countCell.textContent = rangeCount[rangeCountKeys[i]]
      rangeCountRow.appendChild(countCell)

      tbody.appendChild(rangeCountRow)
    }

    table.appendChild(thead)
    table.appendChild(tbody)

    messageElement.appendChild(table)
  }
}

// Formato de la tabla:
{
  /* <table>
  <thead>
    <tr>
      <th>Hoy</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <table>
          <thead>
            <tr>
              <th>Rango salarial</th>
              <th>Conteo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1000 - 2000</td>
              <td>3</td>
            </tr>
            <tr>
              <td>2000 - 3000</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>

<hr>

<table>
  <thead>
    <tr>
      <th>Hace 1 día</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <table>
          <thead>
            <tr>
              <th>Rango salarial</th>
              <th>Conteo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1000 - 2000</td>
              <td>3</td>
            </tr>
            <tr>
              <td>2000 - 3000</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table> */
}

// function createTable() {
//   // Crear una tabla HTML
//   const table = document.createElement('table')

//   // Recorrer cada fecha en el objeto JSON
//   for (const fecha in data) {
//     // Crear una fila para cada fecha
//     const row = document.createElement('tr')

//     // Crear una celda para la fecha
//     const fechaCell = document.createElement('td')
//     fechaCell.textContent = fecha
//     row.appendChild(fechaCell)

//     // Crear una celda para la información de salarios
//     const infoCell = document.createElement('td')
//     const salarioInfo = data[fecha]

//     // Recorrer cada salario en la información de salarios
//     for (const salario in salarioInfo) {
//       // Crear una lista para cada salario
//       const salarioList = document.createElement('ul')

//       // Crear un elemento de lista para el salario y la cantidad
//       const salarioItem = document.createElement('li')
//       salarioItem.textContent = `${salario}: ${salarioInfo[salario]}`

//       // Agregar el elemento de lista a la lista de salarios
//       salarioList.appendChild(salarioItem)

//       // Agregar la lista de salarios a la celda de información
//       infoCell.appendChild(salarioList)
//     }

//     // Agregar la celda de información a la fila
//     row.appendChild(infoCell)

//     // Agregar la fila a la tabla
//     table.appendChild(row)
//   }

//   // Agregar la tabla al documento
//   messageElement.appendChild(table)
// }

// const createTable = (data) => {
//   // Crear una tabla HTML
//   const table = document.createElement('table')

//   // Crear la cabecera de la tabla
//   const headerRow = document.createElement('tr')
//   const headerCell1 = document.createElement('th')
//   headerCell1.textContent = 'Fecha'
//   const headerCell2 = document.createElement('th')
//   headerCell2.textContent = 'Información de Salarios'
//   headerRow.appendChild(headerCell1)
//   headerRow.appendChild(headerCell2)
//   table.appendChild(headerRow)

//   // Recorrer cada fecha en el objeto JSON
//   for (const fecha in data) {
//     // Crear una fila para cada fecha
//     const row = document.createElement('tr')

//     // Crear una celda para la fecha
//     const fechaCell = document.createElement('td')
//     fechaCell.textContent = fecha
//     row.appendChild(fechaCell)

//     // Crear una celda para la información de salarios
//     const infoCell = document.createElement('td')
//     const salarioInfo = data[fecha]

//     // Recorrer cada salario en la información de salarios
//     for (const salario in salarioInfo) {
//       // Crear una lista para cada salario
//       const salarioList = document.createElement('ul')

//       // Crear un elemento de lista para el salario y la cantidad
//       const salarioItem = document.createElement('li')
//       salarioItem.textContent = `${salario}: ${salarioInfo[salario]}`

//       // Agregar el elemento de lista a la lista de salarios
//       salarioList.appendChild(salarioItem)

//       // Agregar la lista de salarios a la celda de información
//       infoCell.appendChild(salarioList)
//     }

//     // Agregar la celda de información a la fila
//     row.appendChild(infoCell)

//     // Agregar la fila a la tabla
//     table.appendChild(row)
//   }

//   // Agregar la tabla al documento
//   messageElement.appendChild(table)
// }
