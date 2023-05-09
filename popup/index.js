const btnGetInformation = document.getElementById('btn-get-information')
const btnClean = document.getElementById('btn-clean')
const information = document.getElementById('information')
const loader = document.getElementById('loader')

const drawGroupJobsInformation = groupJobsInformation => {
    const resultHtml = groupJobsInformation.map(groupCity => {
        const titleCity = `<h2 class="titleCity">${groupCity.city}</h2>`
        const salaries = groupCity.salaries.map(
            ({ amount, count }) =>
                `<li><p>${amount}</p> <span>${count}</span></li>`
        )

        return `
      <li class="cardGroup">
        ${titleCity} 
        <div class="bodyInfo">
          <h3>
            <span>Rangos</span>
            <span>Cantidades</span>
          </h3> 
          <ul>
            ${salaries.join('')}
          </ul>
        </div>
      </li>`
    })

    information.innerHTML = resultHtml.join('')
}

btnGetInformation.addEventListener('click', async () => {
    loader.style.opacity = '1'
    loader.style.display = 'block'

    var port = chrome.runtime.connect({ name: 'popup-background' })

    port.postMessage({ cmd: 'start' })
})

btnClean.addEventListener('click', () => {
    localStorage.removeItem('groupJobsInformation')
    drawGroupJobsInformation([])
})

document.addEventListener('DOMContentLoaded', () => {
    const jobsInformation = localStorage.getItem('groupJobsInformation')

    if (jobsInformation) {
        drawGroupJobsInformation(JSON.parse(jobsInformation))
    }
})

chrome.runtime.onMessage.addListener(message => {
    const { cmd, data } = message

    if (cmd === 'showInformation') {
        localStorage.setItem('groupJobsInformation', JSON.stringify(data))
        loader.style.opacity = '0'
        loader.style.display = 'none'

        drawGroupJobsInformation(data)
    }
})
