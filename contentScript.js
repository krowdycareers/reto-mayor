console.log("inyecting script..")

function getJobsInformation() {
    let jobsElementInformation = document.querySelectorAll('div[id*=jobcard]');
    jobsElementInformation = [...jobsElementInformation];

    const jobsJSONInformation = jobsElementInformation.map(e => {

        const location = e.querySelector("[class*=zonesLinks]").innerText;
        const [
            { href: url },
            { children: [
                {
                    children: [
                        { innerText: fecha },
                        { innerText: title },
                        { innerText: salary },
                    ]
                },
            ] }
        ] = e.children;

        return { url, fecha, title, salary, location }
    })

    return jobsJSONInformation;
}

const portBackground = chrome.runtime.connect({
    name: "content_script-background",
})

portBackground.postMessage({ cmd: "online" });
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(({ cmd }) => {
        if (cmd == "scrap") {
            const jobsInformation = getJobsInformation();
            const btnNext = document.querySelector('[class*=next]');
            const nextPage = !btnNext.className.includes('disabled');
            portBackground.postMessage({ cmd: "getInfo", jobsInformation, nextPage });
        }
    })
})