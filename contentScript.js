function getJobs(){
    let jobElementInformation = document.querySelectorAll("div[id*=jobcard]");
    jobElementInformation = [...jobElementInformation];
    const jobJsonInformation = jobElementInformation.map((el) => {
        const ciudad =el.querySelector("[class*=zonesLinks]").innerText;
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
        return { url, fecha, title, salary,ciudad };
    });
    return jobJsonInformation;
  }
  
    const portBackground = chrome.runtime.connect({name: 'content_script-Background'});

portBackground.postMessage({cmd: 'online'});
  chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function ({ cmd }) {
        if (cmd === "scrapt") {
            const jobsReturnJson = getJobs();
            const buttonNext = document.querySelector("[class*=next]");
            const nextPage = !buttonNext.className.includes("disable");
            portBackground.postMessage({cmd:'getInfo',jobsReturnJson,nextPage});
        }
    });
});