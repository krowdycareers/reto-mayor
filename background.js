let jobs = {}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    if (!tab) {
      console.log('error con tabs query')
      return
    }
    let port = chrome.tabs.connect(tab.id, { name: 'bg-content_script' })

    if (params.cmd === 'start') {
      port.postMessage({ cmd: 'scrap' })
    }

    if (params.cmd === 'stop') {
      port.postMessage({ cmd: 'stop' })
    }

    if (params.cmd === 'getInfo') {
      const { jobsInformation } = params

      jobsInformation.forEach((job) => {
        const { location, salary: salaryToAdd } = job

        if (!jobs[location]) {
          jobs[location] = [{ salary: salaryToAdd, count: 1 }]
        } else {
          let bool = false
          jobs[location].forEach((u) => {
            if (u.salary == salaryToAdd) {
              bool = true
              u.count++
            }
          })

          if (!bool) jobs[location].push({ salary: salaryToAdd, count: 1 })
        }
      })

      console.log(jobs)
    }

    const newDate = new Date().toLocaleString()
    if (params.cmd === 'sendLocalStorage') {
      chrome.storage.local.set({
        scrapperJobs: JSON.stringify({ date: newDate, data: jobs })
      })
      jobs = {}
    }
  })
})
