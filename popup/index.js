const btnScriptElement = document.getElementById('btn-script')
const btnDeleteElement = document.getElementById('btn-delete')
const messageElement = document.getElementById('message')

// Función para crear la tabla con la información y mostrarla en el DOM
const createTable = (data) => {
  messageElement.textContent = ''

  for (let date in data) {
    let table = `
      <table>
        <thead>
          <tr>
            <th colspan="2">${date}</th>
          </tr>
          <tr>
            <th>Rango salarial</th>
            <th>Conteo</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(data[date])
            .map(
              (range) => `
            <tr>
              <td>${range}</td>
              <td>${data[date][range]}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
    messageElement.insertAdjacentHTML('beforeend', table)
  }
}

// Conexión con el background
const backgroundPort = chrome.runtime.connect({ name: 'popup-background' })

backgroundPort.onMessage.addListener(({ cmd, data }) => {
  if (cmd === 'end') {
    createTable(data)

    chrome.storage.local.set({ data: data }, () => {
      console.log('Información guardada en el almacenamiento local')
    })
  }
})

// Listeners para los eventos del DOM
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['data'], (result) => {
    if (result.data) {
      createTable(result.data)
    }
  })
})

btnScriptElement.addEventListener('click', () => {
  chrome.storage.local.remove('data', () => {
    console.log('Información eliminada del almacenamiento local')
    backgroundPort.postMessage({ cmd: 'start' })
    messageElement.textContent = 'Cargando...'
  })
})

btnDeleteElement.addEventListener('click', () => {
  chrome.storage.local.remove('data', () => {
    console.log('Información eliminada del almacenamiento local')
    messageElement.textContent = ''
  })
})
