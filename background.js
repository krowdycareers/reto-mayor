import * as storage from './util.js';

let startScraping = false;
let portPopupBackground;
const key = 'totalJobs';

function addPageToUrl(url) {
    const regex = /page=(\d+)/;
    const match = url.match(regex);
    const page = (match && match[1]) || '1'; 
    const newPage = parseInt(page) + 1;
    const newUrl = (url.includes('page=')) 
                   ? url.replace(regex, `page=${newPage}`) 
                   : url.concat(`?page=${newPage}`);
    
    return newUrl;
}

async function changeToNextPage(url, tabId) {
    const newUrl = addPageToUrl(url);
    await chrome.tabs.update(tabId, {url: newUrl});
}

function probarConCincoPaginas(sender) {
    const {sender: {tab: { url }}} = sender;
    const regex = /page=(\d+)/;
    const match = url.match(regex);
    const page = (match && match[1]) || '1'; 
    return !(parseInt(page) >= 7) 
}

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function (args, sender) {

        const { cmd } = args;

        if (cmd === "start") {
            // Eliminando data del storage al iniciar
            await storage.removeObjectInLocalStorage(key);

            // Alamacenamos el puerto con el que popup se comunicó con background
            portPopupBackground = port;

            startScraping = true;

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            const portTabActive = chrome.tabs.connect(tab.id, {name: 'background-content_script'});

            portTabActive.postMessage({cmd: 'scrap'});
        }

        if (cmd === "online") {

            const {sender: {tab: { url, id }}} = sender;

            if (startScraping) {
                const portTabActive = chrome.tabs.connect(id, {name: 'background-content_script'});
                portTabActive.postMessage({cmd: 'scrap'});
            }
        }

        if (cmd === 'storeInfo') {

            let { jobsInformation, existsNextPage } = args;

            // Storage *********************************************************
            const jobsInStorage = await storage.gatObjectInLocalStorage(key);

            const totalJobs = (jobsInStorage.length === 0) 
                              ? [...jobsInformation]
                              : [...jobsInformation, ...jobsInStorage];

            await storage.saveObjectInLocalStorage({'totalJobs': totalJobs});
            // ******************************************************************

            // Descomentar para probar solo con 7 paginas ***********************
            // existsNextPage = probarConCincoPaginas(sender);
            // ******************************************************************

            if (existsNextPage) {
                const {sender: {tab: { url, id }}} = sender; 
                changeToNextPage(url, id);
            } 
            else {
                startScraping = false; // No hay más páginas para escrapear
                portPopupBackground.postMessage({cmd: 'finished'});
            }             
        }

        if (cmd === "stop") {

            startScraping = false;

            portPopupBackground.postMessage({cmd: 'finished'});
        }
    });
});



