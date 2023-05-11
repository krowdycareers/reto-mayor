console.log("se esta ejecutando el javascript")

function getJobInformation() {

  let jobElementInformation = document.querySelectorAll('div[id*=jobcard]')
  jobElementInformation = [...jobElementInformation]

  const jobJsonInformation = jobElementInformation.map(el => {
    const [{ href: url }, { children: [{ children: [{ innerText: fecha }, { innerText: title }, { innerText: salary }] }] }] = el.children
    return { url, fecha, title, salary }
  })
  return jobJsonInformation

}

const portBackground = chrome.runtime.connect({
  name: "content_script-background"
})

portBackground.postMessage({ cmd: "online" })

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(params => {
    const { cmd } = params

    if (cmd === "scrap") {
      const { valueInputPage } = params
      const jobsInformation = getJobInformation()
      const buttonNext = document.querySelector("[class*=next]")
      const url = window.location.href
      const regex = /page=(\d+)/
      const page = url.match(regex)[1]
      const nextPage = !buttonNext.className.includes("disabled") && !(parseInt(valueInputPage) === parseInt(page))
      portBackground.postMessage({ cmd: "getInfo", jobsInformation, nextPage })
    }
  })
})
