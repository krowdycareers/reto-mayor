const ports = {}
let jobs = []
let start = false
let counter = 1

const addPageToURL = (url) => {
  const regex = /page=(\d+)/
  const match = url.match(regex)
  const page = (match && match[1]) || '1'
  const nextPage = parseInt(page) + 1
  return url.replace(regex, `page=${nextPage}`)
}

const changeTabToNextPage = async (url, tabId) => {
  const newURL = addPageToURL(url)
  await chrome.tabs.update(tabId, { url: newURL })
}

function formatJobInfo(jobs) {
  // Crear un objeto para almacenar la información formateada
  const formattedInfo = {}

  // Iterar sobre cada objeto en el JSON
  jobs.forEach((job) => {
    // Obtener la fecha de los trabajos
    const jobDate = job.jobsDate

    // Crear un objeto para almacenar la información salarial
    const salaryInfo = {}

    // Iterar sobre cada objeto salaryRange
    job.jobsSalaryRange.forEach((range) => {
      // Obtener la descripción del rango salarial
      const salaryRange = range.salaryRange

      // Contar la cantidad de trabajos en este rango salarial
      const jobCount = range.jobsDetails.length

      // Agregar la información salarial al objeto salaryInfo
      salaryInfo[salaryRange] = jobCount
    })

    // Agregar la información de salario formateada para la fecha dada
    formattedInfo[jobDate] = salaryInfo
  })

  // Devolver el objeto con la información formateada
  return formattedInfo
}

const summarizeJobInformation = (jobsToFormat) => {
  const uniqueJobDate = [...new Set(jobsToFormat.map((item) => item.jobDate))]

  const jobsInfo = uniqueJobDate.map((date) => {
    const jobsByDate = jobsToFormat.filter((job) => job.jobDate === date)

    const uniqueJobSalaryRange = [
      ...new Set(jobsByDate.map((item) => item.jobSalary)),
    ]

    const jobsSalaryRangeDetails = uniqueJobSalaryRange.map((salary) => {
      const jobsDetails = jobsByDate.filter((job) => job.jobSalary === salary)

      return {
        salaryRange: salary,
        jobsDetails,
      }
    })

    return {
      jobsDate: date,
      jobsSalaryRange: jobsSalaryRangeDetails,
    }
  })

  const jobsInfo2 = formatJobInfo(jobsInfo)

  return jobsInfo2
}

chrome.runtime.onConnect.addListener((port) => {
  ports[port.name] = port
  port.onMessage.addListener(
    async ({ cmd, jobsInformation, nextPage }, sender) => {
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
        jobs = [...jobs, ...jobsInformation]

        if (nextPage && counter < 5) {
          const {
            sender: {
              tab: { url, id },
            },
          } = sender
          changeTabToNextPage(url, id)
          counter++
        } else {
          start = false

          const jobsInfoFormatted = summarizeJobInformation(jobs)

          ports['popup-background'].postMessage({
            cmd: 'end',
            data: jobsInfoFormatted,
          })
        }
      }
    }
  )
})
