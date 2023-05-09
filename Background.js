let jobs = [];
let start = false;

function addPageToURL(url){
    const regex = /page=(\d+)/;
    const match = url.match(regex);
    if(match){
    const page = match[1]
    const newPage = parseInt(page) + 1;
    return url.replace(regex, `page=${newPage}`);
    }
    if(match == undefined){
    const page = '0';
    const newPage = parseInt(page) + 1;
    return url.concat('',`&page=${newPage}`);
    }
}

function classifyingJobs(jobsJson){
    const jobsCualified = {
    };

    jobsJson.forEach(element => {
        if(jobsCualified[`Ciudad: ${element.ciudad}`]){
            // jobsCualified[`Ciudad: ${element.ciudad}`].push(element);

            if (jobsCualified[`Ciudad: ${element.ciudad}`][element.salary]) {
                jobsCualified[`Ciudad: ${element.ciudad}`][element.salary].push(element);
            } else {
                jobsCualified[`Ciudad: ${element.ciudad}`][element.salary] = [];
                jobsCualified[`Ciudad: ${element.ciudad}`][element.salary].push(element);
            }

        }else if(!jobsCualified[`Ciudad: ${element.ciudad}`]){
            // jobsCualified[`Ciudad: ${element.ciudad}`] = [];
            // jobsCualified[`Ciudad: ${element.ciudad}`].push(element);

            jobsCualified[`Ciudad: ${element.ciudad}`] = {};
            jobsCualified[`Ciudad: ${element.ciudad}`][element.salary] = [];
            jobsCualified[`Ciudad: ${element.ciudad}`][element.salary].push(element);
        }

    });

    return jobsCualified;
}


async function changeTabToNextPage(url,tabid){
    const newURL = addPageToURL(url);
    await chrome.tabs.update(tabid, {url: newURL});
}


chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function (params,sender) {
        const {cmd} = params;
        if(cmd === "start"){
            start = true;
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            let port = chrome.tabs.connect(tab.id, {name:"bg-content_script"});
            port.postMessage({cmd:"scrapt"});
        }
        if(cmd === "online"){
            const {sender:{tab: {url,id}}} = sender;
            if(start){
            let port = chrome.tabs.connect(id, {name:"bg-content_script"});
            port.postMessage({cmd:"scrapt"});
            }
        }
        if(cmd === "getInfo"){
            const {jobsReturnJson,nextPage} = params;
            jobs = [...jobs,...jobsReturnJson];
            if(nextPage){
                const {sender:{tab: {url,id}}} = sender;
                changeTabToNextPage(url,id);
            }else{
                start = false;
                const result = classifyingJobs(jobs);
                console.log(result);
                chrome.runtime.sendMessage({message: result });
            }
        }
    });
});