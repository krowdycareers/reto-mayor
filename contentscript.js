function getJobInformation() {
    let jobElementInformation = document.querySelectorAll("div[id*=jobcard]");
    jobElementInformation = [...jobElementInformation];
    const jobJsonInformation = jobElementInformation.map((el) => {
        const [
            { href: url },
            {
                children: [
                    {
                        children: [
                            { innerText: fecha },
                            { innerText: title },
                            { innerText: salary },
                            { innerText: description },
                            { innerText: location },
                        ],
                    },
                ],
            },
        ] = el.children;
        return { url, fecha, title, salary, location, description };
    });
    const jsonJobsGrouping = jobJsonInformation;
    return jsonJobsGrouping;
}
const portBackground = chrome.runtime.connect({
    name: "content_script-background",
});
portBackground.postMessage({ cmd: "online" });
const portPopup = chrome.runtime.connect({
    name: "content_script-Popup",
});
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (params) {
        const { cmd } = params;
        if (cmd === "scrapt") {
            let jobsInformation = getJobInformation();
            const buttonNext = document.querySelector("[class*=next]");
            const nextPage = !buttonNext.className.includes("disabled");
            portBackground.postMessage({
                cmd: "getInfo",
                jobsInformation,
                nextPage,
            });
        }
        if (cmd === "sendInfo") {
            console.log("send Info");
            portPopup.postMessage({
                cmd: "showInfo",
            });
        }
    });
});
