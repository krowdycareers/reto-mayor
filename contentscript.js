console.log('Se esta ejecutando el javascript')

function getJobsInformation() {
    const [...jobsElementInformation] =
        document.querySelectorAll('div[id*=jobcard]')

    const jobJsonInformation = jobsElementInformation.map(info => {
        const location = info.querySelector('[class*=zonesLinks]').innerText
        const company = info.querySelector('[class*=companyLink]')
            ? info.querySelector('[class*=companyLink]').innerText
            : info.querySelector('[class*=linkContainer]').innerText
        console.log(info)
        const [
            {},
            {
                children: [
                    {
                        children: [
                            {},
                            { innerText: job },
                            { innerText: salary }
                        ]
                    }
                ]
            }
        ] = info.children

        const salaryRange = /\d/.test(salary)
            ? salary.replace(/[^\d-]/g, '')
            : 'Sueldo Omitido'

        return { job, salary: salaryRange, company, location }
    })

    return jobJsonInformation
}
const portBackground = chrome.runtime.connect({
    name: 'content_script-background'
})

portBackground.postMessage({ cmd: 'online' })

chrome.runtime.onConnect.addListener(port => {
    port.onMessage.addListener(({ cmd }) => {
        if (cmd === 'scrap') {
            const jobsInformation = getJobsInformation()
            const buttonNext = document.querySelector('[class*=next]')
            const nextPage = !buttonNext.className.includes('disabled')
            portBackground.postMessage({
                cmd: 'getInfo',
                jobsInformation,
                nextPage
            })
        }
    })
})
