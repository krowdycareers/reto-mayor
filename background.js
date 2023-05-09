import { saveObjectInLocalStorage } from "./scripts/storage.js";
import { resetObjectInLocalStorage } from "./scripts/storage.js";
import { getObjectInLocalStorage } from "./scripts/storage.js";

let jobsKey = "jobs";
let filterJobsKey = "filter_jobs";
let fstart = false;

function getGroupJobsByCityAndSalaryRange(jobs) {
    const groupJobs = {};

    console.log(jobs);
    jobs.forEach(object => {
        const city = object.city;
        const salaryRange = object.salary;
        
        if (!groupJobs[city]) {
            groupJobs[city] = {};
        }
        
        if (!groupJobs[city][salaryRange]) {
            groupJobs[city][salaryRange] = 0;
        }
        
        groupJobs[city][salaryRange]++;
    });

    return groupJobs;
}

function addPageToURL(url) {
    if (!url.includes("/page")) {
        url += 'page=1';
    }
    const regex = /page=(\d+)/;
    const match = url.match(regex);
    const page = (match && match[1]) || '1';
    const newPage = parseInt(page) + 1;
    return url.replace(regex, `page=${newPage}`);
}

async function changeTabToNextPage(url, tabid) {
    const newURL = addPageToURL(url);
    await chrome.tabs.update(tabid, { url: newURL});
}

async function processStart() {
    if (!fstart) {
        fstart = true;
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        let port = chrome.tabs.connect(tab.id, { name: 'bg-content_script'});
        port.postMessage({ cmd:"scrap"});
    }    
}

async function processOnline(sender) {    
    if (fstart) {
        const { sender: { tab: { id }}} = sender;
        let port = chrome.tabs.connect(id, { name: 'bg-content_script'});
        port.postMessage({ cmd:"scrap"});
    }
}

async function processGetInfo(params, sender) {
    const { jobsInformation, nextPage } = params;
    await saveObjectInLocalStorage(jobsKey, jobsInformation);
    if (nextPage) {
        const { sender: { tab: { url, id }}} = sender;
        changeTabToNextPage(url, id);
    } else {
        processFinish(sender);
    }
}

async function processReset() {
    await resetObjectInLocalStorage(jobsKey);
    await resetObjectInLocalStorage(filterJobsKey);
    processStop();
}

function processStop() {
    fstart = false;
}

async function processFinish(port) {
    processStop();
    await resetObjectInLocalStorage(filterJobsKey);
    const jobs = await getObjectInLocalStorage(jobsKey);
    if (jobs) {        
        const groupJops = getGroupJobsByCityAndSalaryRange(jobs);
        await saveObjectInLocalStorage(filterJobsKey, groupJops);
        await resetObjectInLocalStorage(jobsKey);    
    }    
    port.postMessage({ message: "finished" });
}

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function(params, sender ) {
        const { cmd } = params;
        switch (cmd) {
            case 'start':
                processStart();
                break;
            case 'online':
                processOnline(sender);
                break;
            case 'getInfo':                
                processGetInfo(params, sender);
                break;
            case 'reset':
                processReset();          
                break;
            case 'stop':
                processStop();
                break;
            case 'finish':
                console.log('backgroubd finish');
                processFinish(port);
                break;
            default:
                break;
        }
    });
});