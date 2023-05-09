//aqui vamos a injestar el codigo javascriptS
function getJobsInformation() {
    let jobElementInformation = document.querySelectorAll('div[id*=jobcard]');
    jobElementInformation = [...jobElementInformation];

    const jobJsonInformation = jobElementInformation.map(el => {
        let ChildrenElement = el.children[1].children[0].children.length;
        if (ChildrenElement > 6) {
            const [
                { href: url },
                { children:
                    [{ children: [
                        { innerText: Fecha },
                        { innerText: title },
                        { innerText: salary },
                        ,
                        ,
                        { children: [
                            { children: [
                                { children: [
                                    { children: [
                                        { children: [
                                            ,
                                            { innerText: state }
                                        ] }
                                    ] }
                                ] }
                            ] }
                        ] },
                    ]
                    }]
                }] = el.children;
            return { url, Fecha, title, salary, state };
        } else {
            const [
                { href: url },
                { children:
                    [{ children: [
                        { innerText: Fecha },
                        { innerText: title },
                        { innerText: salary },
                        ,
                        { children: [
                            { children: [
                                { children: [
                                    { children: [
                                        { children: [
                                            ,
                                            { innerText: state }
                                        ] }
                                    ] }
                                ] }
                            ] }
                        ] },
                    ]
                    }]
                }] = el.children;
            return { url, Fecha, title, salary, state };
        }
    });
    // }).reduce((collector, item) => {
    //     if (!collector[item.Fecha]) {
    //         collector[item.Fecha] = [];
    //     }
    //     const existingJob = collector[item.Fecha].find(job => job.salary === item.salary);
    //     console.log(existingJob)
    //     if (existingJob) {
    //         existingJob.jobs.push({ title: item.title, url: item.url });
    //     } else {
    //         collector[item.Fecha].push({ salary: item.salary, jobs: [{ title: item.title, url: item.url }] });
    //     }
    //     return collector;
    // }, {});

    return jobJsonInformation
}

// getJobsInformation()

const portBackground = chrome.runtime.connect({
    name: 'content_script-background',
})

portBackground.postMessage({ cmd: 'online' });

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function ({ cmd }) {
        if (cmd == "scrap") {
            const jobsInformation = getJobsInformation();
            const jobsListString = window.localStorage.getItem('JobsListToday');
            const jobList = jobsListString ? JSON.parse(jobsListString) : [];
            const newJobsList = JSON.stringify([...jobList, ...jobsInformation]);
            window.localStorage.setItem('JobsListToday', newJobsList);
            const buttonNext = document.querySelector("[class*=next]");
            const nextPage = !buttonNext.className.includes('disabled');
            let jobsListToday = JSON.parse(window.localStorage.getItem('JobsListToday'));
            portBackground.postMessage({ cmd: 'getInfo', jobsListToday, nextPage });
        }
    })
})