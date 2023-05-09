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
