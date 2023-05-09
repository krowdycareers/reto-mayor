//obtener la siguiente url de la paginacion
let addPageToUrl = (url) => {
  const regex = /page=(\d+)/;
  const match = url.match(regex)
  const page = (match && match[1]) || 0
  const newPage = page == 0 ? `${url}?page=2` : url.replace(regex, `page=${parseInt(page) + 1}`)
  return newPage
}

//function de cambio de page
async function changeTabToNextPage(url, tabid) {
  const newUrl = addPageToUrl(url)
  console.log(newUrl)
  await chrome.tabs.update(tabid, { url: newUrl })
}

//variables
let data = []
let start = false
let limit
let index = 0

//recibir mensajes
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function ({ message, jobsInformation, nextPage, dataLimit }, sender) {
    console.log(message)
    if (message == "online") {
      if (start) {
        let { sender: { tab: { id } } } = sender
        let port = chrome.tabs.connect(id, { name: "bg-content-script" })
        port.postMessage({ message: "scrap" })
      }
    }

    if (message === "getInfo") {

      start = nextPage ?? false
      dataLimit && (limit = dataLimit) // si hay el limite se asigna sino lo deja igual

      //si buttom esta didabled y si el index es menor que limite
      if (start && index < limit) {
        let { sender: { tab: { url, id } } } = sender
        data.push(jobsInformation)
        index++

        changeTabToNextPage(url, id)

      } else {
        //reiniciamos algunos datos
        index = 0
        start = false
        //enviamos datos al inde.js popup
        chrome.runtime.sendMessage({ message: 'finalData', datos: data.flat() });
        data = []
      }

    }
  });



});


