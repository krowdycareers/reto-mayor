function getJobsInformation() {
  const jobsCardElementns = [...document.querySelectorAll('div[id*=jobcard]')]

  return jobsCardElementns.map((jobCard) => {
    const [
      { href: url },
      {
        children: [
          {
            children: [
              { innerText: fecha },
              { innerText: title },
              { innerText: salary }
            ]
          }
        ]
      }
    ] = jobCard.children

    // uso ol atributo title porque las hubicaciones estan escritas sin abreviaciones, permitiendo como en mi caso que no conozco mexico mayor entendimiento.

    const locationJobs = [
      ...jobCard.querySelectorAll('a[title*=Empleos]')
    ].reverse()
    // dejo el city auque no lo utilice para en un futura poder usarlo para afinar mas la locacion.
    let [{ title: state } = { title: '' }, { title: city } = { title: '' }] =
      locationJobs
    state = state.slice(11)
    city = city.slice(10)

    return { title, salary, location: state }
  })
}

const portBackground = chrome.runtime.connect({
  name: 'content_script-background'
})

const element = document.querySelector('div[class*=jobCardContainer]')

const getButtonNext = () => {
  return document.querySelector('*[class*=next]')
}

let mutation = null
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === 'scrap') {
      // detecta cambios en el container de trabajos para que cuando se cargue el boton se ejecute evento onClick, solo si no tiene disabled. De esta forma no se recarga la pagina completa, simulando el uso de usuario.
      mutation = new MutationObserver(() => {
        const buttonNext = getButtonNext()
        if (buttonNext) {
          const nextPage = buttonNext.className.includes('disabled')

          if (nextPage === false) {
            const jobsInformation = getJobsInformation()
            portBackground.postMessage({
              cmd: 'getInfo',
              jobsInformation
            })
            buttonNext.click()
          } else {
            mutation && mutation.disconnect()
            portBackground.postMessage({ cmd: 'sendLocalStorage' })
          }
        }
      })

      mutation.observe(element, { subtree: true, childList: true })

      const jobsInformation = getJobsInformation()
      portBackground.postMessage({
        cmd: 'getInfo',
        jobsInformation
      })
      getButtonNext().click()
    }
    if (cmd === 'stop') {
      mutation && mutation.disconnect()
      portBackground.postMessage({ cmd: 'sendLocalStorage' })
    }
  })
})
