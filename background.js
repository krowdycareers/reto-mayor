let jobs =[];
let start = false;
const guardarLocalStorage = async(obj) =>{
    return new Promise((resolve,reject)=>{
        try{
            chrome.storage.local.set(obj, function(){
                resolve();
            });
        }catch(ex){
            reject(ex);
        }
    })
}
const recuperarLocalStorage = (key) =>{
    return new Promise((resolve,reject)=>{
        try{
            chrome.storage.local.get(key, (value) =>{
                resolve(value);
            });
        }catch(ex){
            reject(ex);
        }
    });
}
const addPage = (url) =>{
    const regex = /page=(\d+)/;
    const match = url.match(regex);
    const page = (match && match[1]) || "1";
    const newPage = parseInt(page) +1;
    console.log(url);
    return page=="1"?url+((url[url.length -1]!= "&")?"?":"&")+`page=${newPage}` :url.replace(regex, `page=${newPage}`)
}
const changeTabToNextPage = async (url,tabid) =>{
    const newUrl = addPage(url);
    console.log(newUrl);
    await chrome.tabs.update(tabid,{url:newUrl});
}
let tabId = null;
const getCurrentTab = async()=>{
    const querryOption = {active:true,currentWindow:true};
    const [tab] = await chrome.tabs.query(querryOption);
    return tab;
}
let portPop;
chrome.runtime.onConnect.addListener((port)=>{
    console.log("BackGround",port.name)
    if(port.name == "popup-background"){
        portPop = port;
        portPop.postMessage({message:"Hola"});
    }
    port.onMessage.addListener(async (params,sender)=>{
        const {cmd} = params;
        if(cmd=="stop"){
            start = false;
        }
        if(cmd == "start"){
            start =true;
            await guardarLocalStorage({"jobs":[]});
            jobs = [];
            const querryOption = {active:true,currentWindow:true};
            const [tab] = await chrome.tabs.query(querryOption);
            console.log(tab);
            let port = chrome.tabs.connect(tab.id,{name:"content-script-bg"});
            port.postMessage({cmd:"scrap"});
        }
        if(cmd == "online" && start){
            const {sender:{tab:{id}}} = sender;
            const port = chrome.tabs.connect(id,{name: "content-script-bg"});
            port.postMessage({cmd:"scrap"});
        }
        if(cmd =="getInfo"){
            const {jobsInfo,nextPage} = params;
            jobs = [...jobs,...jobsInfo];
            //if(nextPage) changeTabToNextPage(sender);
            await guardarLocalStorage({"jobs":jobs});
            console.log(nextPage,"GetInfo-gb");
            portPop?.postMessage({message:"hola",jobs});
            if(nextPage){
                const {sender:{tab:{url,id}}} = sender;
                await changeTabToNextPage(url,id);
            }else start = false;
        }
    });
});
/**
 if(message === "startscrap"){
            const status = "start";
            
        }
        if(message == "finish"){
            port.postMessage({message:"nextpage"});
        }
 */