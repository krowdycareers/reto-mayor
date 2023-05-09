const getJobsInformation = () => {
  const jobElementInformation = document.querySelectorAll('div[id*=jobcard-]')
  const jobElementInfomationArray = Array.from(jobElementInformation)

  const jobJsonInformation = jobElementInfomationArray.map((element) => {
    const [
      { href: jobUrl },
      {
        children: [
          {
            children: [
              { innerText: jobDate },
              { innerText: jobTitle },
              { innerText: jobSalary },
            ],
          },
        ],
      },
    ] = element.children

    return {
      // jobUrl,
      jobDate: jobDate.trim().split('\n')[0],
      jobTitle: jobTitle.trim(),
      jobSalary: jobSalary.trim().split(' Mensual')[0],
    }
  })

  return jobJsonInformation
}

let portBackground = chrome.runtime.connect({
  name: 'content_script-background',
})

portBackground.postMessage({ cmd: 'online' })

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === 'scrap') {
      const jobsInformation = getJobsInformation()
      const buttonNext = document.querySelector('[class*=next]')
      const nextPage = !buttonNext.className.includes('disabled')
      portBackground.postMessage({ cmd: 'getInfo', jobsInformation, nextPage })
    }
  })
})
