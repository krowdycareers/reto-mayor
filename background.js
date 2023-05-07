let jobs = [];
let start = false;
const saveObjectInLocalStorage = async function (obj) {
    return new Promise((resolve, reject) => {
        try {
            console.log(chrome);
            chrome.storage.local.set(obj, function () {
                resolve();
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

const getObjectInLocalStorage = async function (key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(key, function (value) {
                resolve(value);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};
function addPageToURL(url) {
    const regex = /page=(\d+)/;
    const match = url.match(regex);
    const page = (match && match[1]) || "1";
    const newPage = parseInt(page) + 1;

    return `${url.replace(regex, `page=${newPage}`)}`;
}
async function changeTabToNextPage(url, tapid) {
    const newURL = addPageToURL(url);
    await chrome.tabs.update(tapid, { url: newURL });
}
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function (params, sender) {
        const { cmd } = params;
        if (cmd == "start") {
            start = true;
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            let port = chrome.tabs.connect(tab.id, {
                name: "bg-content_script",
            });
            port.postMessage({ cmd: "scrapt" });
        }
        if (cmd === "online") {
            const {
                sender: {
                    tab: { id },
                },
            } = sender;
            if (start) {
                let port = chrome.tabs.connect(id, {
                    name: "bg-content_script",
                });
                port.postMessage({ cmd: "scrapt" });
            }
        }

        if (cmd === "getInfo") {
            let { jobsInformation, nextPage } = params;
            jobs = [...jobs, ...jobsInformation];

            if (nextPage) {
                const {
                    sender: {
                        tab: { url, id },
                    },
                } = sender;
                changeTabToNextPage(url, id);
            } else {
                await saveObjectInLocalStorage({
                    scrapingJobs: JSON.stringify(jobs),
                });
                jobs = [];
                start = false;
            }
        }
    });
});
