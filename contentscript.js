console.log("Content Script");
function getJobInformation(){
    let jobElementInformation = document.querySelectorAll('div[id*=jobcard]');
    jobElementInformation = [...jobElementInformation];
    const jobJsonInformation=jobElementInformation.map((el)=>{
        const [{href:url},{children:[{children:[
        {innerText: fecha},
        {innerText:tittle},
        {innerText:salary}
        ]}]}] = el.children;
        return {salary};
    });
    console.log(jobJsonInformation);
    return jobJsonInformation;
}
//getJobInformation();
const portBg = chrome.runtime.connect({name:"content-script-bg"});
portBg.postMessage({cmd:"online"});
chrome.runtime.onConnect.addListener((port) =>{
    port.onMessage.addListener(({cmd})=>{
        if(cmd == "scrap") {
            const jobs = getJobInformation();
            const buttonNext = document.querySelector("[class*=next]");
            const nextPage = !buttonNext.className.includes('disabled');
            console.log(nextPage);
            portBg.postMessage({cmd: 'getInfo',jobsInfo:jobs,nextPage});
            
        }
    })
})
/**
 const jobJsonInformation=jobElementInformation.map((el)=>{
        const [{href:url},{children:[{children:[
        {innerText: fecha},
        {innerText:tittle},
        {innerText:salary}
        ]}]}] = el.children;
        return {url,fecha,tittle,salary};
    });
 */