console.log("se está ejecutando el javascript");

function getJobsInformation() {
    let jobElementInformation = document.querySelectorAll('div[id*=jobcard]');
    jobElementInformation = [...jobElementInformation];
    const jobJsonInformation = jobElementInformation.map(el => {
        const city = el.querySelector("[class*=zonesLinks]").innerText;
        const [
            { href: url },
            {
                children: [
                    {
                        children: [
                            { innerText: fecha },
                            { innerText: title },
                            { innerText: salary },
                        ],
                    },
                ],
            },
        ] = el.children;
        return { url, fecha, title, salary, city };
    })
    // let keys = Object.keys(jobJsonInformation[0])
    // return dates.map( date => ({
    //         [date] : jobJsonInformation.filter(row => {
    //             return Boolean(
    //                 keys.find( key => Boolean(row[key].includes(date)) )
    //             )
    //         })
    //     }) 
    // )

    return jobJsonInformation;
    // return [jobJsonInformation.length , filtered.length]
}

//getJobsInformation();

const portBackground = chrome.runtime.connect({
    name: "content_script-background"
})
portBackground.postMessage({ cmd: "online" });
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(({ cmd }) => {
        if (cmd === "scrap") {
            const jobsInformation = getJobsInformation();
            const buttonNext = document.querySelector("[class*=next]");
            const nextPage = !buttonNext.className.includes("disable");
            portBackground.postMessage({ cmd: 'getInfo', jobsInformation: jobsInformation, nextPage });
        }
    });
});

const port = chrome.runtime.connect({ name: "contenct_script-popup" });
portBackground.onMessage.addListener(async ({ cmd, data }) => {
    if (cmd === "finish") {
        port.postMessage({ cmd, data });
    }
});