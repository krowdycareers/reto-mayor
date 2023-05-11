let jobs = []
let start = false
let baseURL = "https://www.occ.com.mx/empleos/?tm=0&page=1"
let valueInputPage = "0"

function nextPageToURL(url) {
  const regex = /page=(\d+)/
  const match = url.match(regex)
  const currentPage = (match && match[1]) || "1"
  const nextPage = parseInt(currentPage) + 1
  return url.replace(regex, `page=${nextPage}`)
}

async function changeTabToNextPage(url, id) {
  const nextURL = nextPageToURL(url)
  await chrome.tabs.update(id, { url: nextURL })

}

function jobsGroupBySalary(jobsArray) {
  const objectGroupBySalary = jobsArray.reduce((acc, curr) => {
    const key = curr.salary
    if (!acc[key]) acc[key] = []
    acc[key].push(curr)
    return acc
  }, {})
  for (const clave in objectGroupBySalary) {
    if (Array.isArray(objectGroupBySalary[clave])) {
      objectGroupBySalary[clave] = objectGroupBySalary[clave].length;
    }
  }
  const arrayGroupBySalary = Object.entries(objectGroupBySalary).map(([salary, cant]) => ({ salary, cant }))
  return { country: "MEXICO", rangos: arrayGroupBySalary }
}

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(async (params, sender) => {
    const { cmd } = params
    if (cmd === "start") {
      const { valueInput } = params
      valueInputPage = valueInput
      start = true
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      await chrome.tabs.update(tab.id, { url: baseURL })
      let port = chrome.tabs.connect(tab.id, { name: "background-content_script" })
      port.postMessage({ cmd: "scrap", valueInputPage })

    }
    if (cmd === "stop") {
      start = false
      chrome.storage.local.set({ jobs })
      const portToPopup = chrome.runtime.connect({
        name: "bg-popup"
      })

      portToPopup.postMessage({ cmd: "showJobs" })

    }
    if (cmd === "reset") {

      start = false
      jobs = []
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      await chrome.tabs.update(tab.id, { url: baseURL })

    }

    if (cmd === "online") {
      if (start) {
        const { sender: { tab: { id } } } = sender
        let port = chrome.tabs.connect(id, { name: "background-content_script" })
        port.postMessage({ cmd: "scrap", valueInputPage })
      }
    }


    if (cmd === "getInfo") {
      const { jobsInformation, nextPage } = params
      jobs = [...jobs, ...jobsInformation]
      if (nextPage) {
        const { sender: { tab: { url, id } } } = sender
        changeTabToNextPage(url, id)
      }
      else {
        start = false
        chrome.storage.local.set({ results: jobsGroupBySalary(jobs) })
        const portToPopup = chrome.runtime.connect({
          name: "bg-popup"
        })

        portToPopup.postMessage({ cmd: "showJobs" })
      }
    }
  })
})