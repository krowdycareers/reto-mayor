const btnScriptElement = document.getElementById('btn-script')
const pMessageElement = document.getElementById('p-message')

btnScriptElement.addEventListener('click', async () => {
  let port = chrome.runtime.connect({ name: 'popup-background' })

  port.postMessage({ cmd: 'start' })
})
