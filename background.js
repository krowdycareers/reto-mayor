let jobs = []
let start = false

/* const addPageToURL = (url) => {
  const regex = /page=(\d+)/
  const match = url.match(regex)
  const page = (match && match[1]) || '1'
  const nextPage = parseInt(page) + 1
  return url.replace(regex, `page=${nextPage}`)
} */

/* const changeTabToNextPage = async (url, tabId) => {
  const newURL = addPageToURL(url)
  await chrome.tabs.update(tabId, { url: newURL })
} */

/* chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (params, sender) => {
    const { cmd } = params
    if (cmd === 'start') {
      start = true
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
      let port = chrome.tabs.connect(tab.id, {
        name: 'background-content_script',
      })
      port.postMessage({ cmd: 'scrap' })
    }

    if (cmd === 'online') {
      const {
        sender: {
          tab: { id },
        },
      } = sender

      if (start) {
        let port = chrome.tabs.connect(id, {
          name: 'background-content_script',
        })

        port.postMessage({ cmd: 'scrap' })
      }
    }

    if (cmd === 'getInfo') {
      const { jobsInformation, nextPage } = params

      jobs = [...jobs, ...jobsInformation]

      console.log({ sender })

      if (nextPage) {
        const {
          sender: {
            tab: { url, id },
          },
        } = sender
        changeTabToNextPage(url, id)
      } else {
        start = false
      }
    }
  })
}) */

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup-background') {
    console.log('popup-background')

    port.onMessage.addListener(async ({ cmd }, sender) => {
      if (cmd === 'start') {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        })

        const port_BackgroundToContentScript = chrome.tabs.connect(tab.id, {
          name: 'background-content_script',
        })

        port_BackgroundToContentScript.postMessage({ cmd: 'scrap' })

        port_BackgroundToContentScript.onMessage.addListener(
          ({ cmd, data, nextPage }) => {
            if (cmd === 'getInfo') {
              console.log(data)
            }
          }
        )
      }
      // port.postMessage({
      //   cmd: 'finish',
      //   data: jobs,
      // })
    })
  }

  // if (port.name === 'content_script-background') {
  //   console.log('content_script-background')

  //   port.onMessage.addListener(({ cmd, data, nextPage }) => {
  //     if (cmd === 'getInfo') {
  //       console.log({ cmd, data, nextPage })
  //     }
  //   })
  // }
})
