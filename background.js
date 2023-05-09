let jobs = []
let start = false;
let portPopUp;

function addPageToURL(url) {
    const regex = /page=(\d+)/;
    const match = url.match(regex);
    if (match && match[1]) {
        const page = match[1];
        const newPage = parseInt(page) + 1;
        return url.replace(regex, `page=${newPage}`);

    }
    return url + '&page=1';
}

async function changeTabToNextPage(url, tabid) {
    const newURL = addPageToURL(url)
    await chrome.tabs.update(tabid, { url: newURL })
}

chrome.runtime.onConnect.addListener(function (port) {
    portPopUp ||= (port.name === 'popup-background' ? port : undefined);
    port.onMessage.addListener(async function (params, sender) {
        const { cmd, tab } = params;
        if (cmd == "start") {
            start = true;
            let port = chrome.tabs.connect(tab.id, { name: "bg-content_script" });
            port.postMessage({ cmd: "scrap" });
        }
        if (cmd == "online") {
            const { sender: { tab: { id } } } = sender;
            if (start) {
                let port = chrome.tabs.connect(id, { name: "bg-content_script" });
                port.postMessage({ cmd: "scrap" });
            }
        }
        if (cmd == "getInfo") {
            const { jobsListToday, nextPage } = params;
            const jobsListTodayPerState = jobsListToday.reduce((accumulator, job) => {
                const { state, salary } = job;
                if (!accumulator[state]) {
                    accumulator[state] = {};
                }
                if (!accumulator[state][salary]) {
                    accumulator[state][salary] = 0;
                }
                accumulator[state][salary]++;
                return accumulator;
            }, {});

            if (nextPage) {
                const { sender: { tab: { url, id } } } = sender;
                changeTabToNextPage(url, id);
            } else {
                start = false;
                portPopUp.postMessage({ message: jobsListTodayPerState });
            }
        }

    });
});