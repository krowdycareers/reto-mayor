let jobs = []
let start = false
let pageLimit = 5

const addPageToURL = url => {
    const regex = /page=(\d+)/
    const match = url.match(regex)
    const page = (match && match[1]) || '1'
    const newPage = parseInt(page) + 1

    return url.replace(regex, `page=${newPage}`)
}

const changeTabToNextPage = async (url, tabid) => {
    const newURL = addPageToURL(url)
    await chrome.tabs.update(tabid, { url: newURL })
}

const groupJobInformationByCities = () => {
    const groupedJobs = jobs.reduce((acc, job) => {
        const city = job.location
        const salary = job.salary
        const jobName = job.job

        if (!acc[city]) {
            acc[city] = {}
        }

        if (!acc[city][salary]) {
            acc[city][salary] = { count: 0, jobs: [] }
        }

        acc[city][salary].jobs.push(jobName)

        acc[city][salary].count++

        return acc
    }, {})

    const finalOutput = Object.entries(groupedJobs).map(([city, salaries]) => {
        const formattedSalaries = Object.entries(salaries).map(
            ([amount, data]) => {
                return {
                    amount: amount,
                    count: data.count,
                    jobs: data.jobs
                }
            }
        )

        return {
            city: city,
            salaries: formattedSalaries
        }
    })

    return finalOutput
}

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function (params, sender) {
        const { cmd } = params
        if (cmd === 'start') {
            start = true
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true
            })

            let port = chrome.tabs.connect(tab.id, {
                name: 'bg-content_script'
            })

            port.postMessage({ cmd: 'scrap' })
        }

        if (cmd === 'online') {
            const {
                sender: {
                    tab: { id }
                }
            } = sender

            if (start) {
                let port = chrome.tabs.connect(id, {
                    name: 'bg-content_script'
                })
                port.postMessage({ cmd: 'scrap' })
            }
        }

        if (cmd === 'getInfo') {
            const { jobsInformation, nextPage } = params
            jobs = [...jobs, ...jobsInformation]

            console.log(jobs)

            if (nextPage && pageLimit > 0) {
                const {
                    sender: {
                        tab: { url, id }
                    }
                } = sender
                changeTabToNextPage(url, id)
                pageLimit--
            } else {
                start = false
                const data = groupJobInformationByCities()

                chrome.runtime.sendMessage({
                    cmd: 'showInformation',
                    data
                })
            }
        }
    })
})
