const btnScriptElement = document.getElementById('btn-script')
const messageElement = document.getElementById('message')

btnScriptElement.addEventListener('click', async () => {
  const port_PopupToBackground = chrome.runtime.connect({
    name: 'popup-background',
  })

  port_PopupToBackground.postMessage({ cmd: 'start' })

  port_PopupToBackground.onMessage.addListener(({ cmd, data }) => {
    if (cmd === 'finish') {
      messageElement.innerText = JSON.stringify(data)
    }
  })
})
