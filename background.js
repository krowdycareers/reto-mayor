console.log("Background init!!")
let jobs = [];
let start = false;
let limit;
let index = 0;


let addPageToUrl = (url) => {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = (match && match[1]) || 0;
  const newPage = page == 0 ? `${url}?page=2` : url.replace(regex, `page=${parseInt(page)+1}`);
  return newPage;
}

async function changeTabToNextPage(url, tabid){
    const newUrl = addPageToUrl(url);
    await chrome.tabs.update(tabid, {url: newUrl});
}


chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function( params, sender ){
      const {cmd, dataLimit, nextPage, jobsSorted} = params;

      // if (cmd == 'start') {
      //   start = true;
      //   const [tab] = await chrome.tabs.query({
      //       active: true,
      //       currentWindow: true
      //   })
      //   let portA = chrome.tabs.connect(tab.id,{name:'bg-content_script'})
      //   portA.postMessage({cmd:'scrap'})
      // }
      if (cmd == 'online') {
        if (start) {

          let { sender: { tab: { id } } } = sender
          let port = chrome.tabs.connect(id, { name: "bg-content-script2" });
          port.postMessage({ cmd: "scrap" });
        }
      }
      
      if (cmd == 'getInfo') {
        start = nextPage ?? false;
        dataLimit && (limit = dataLimit);
        if(start && index<limit){
          const {sender:{tab:{url, id},}} = sender;
          jobs.push(jobsSorted);
          
          index++;
          changeTabToNextPage(url, id);
        }else {
          start = false;
          index = 0;
          chrome.runtime.sendMessage({ message: 'getAccumJobs', datos: jobs.flat() });
          jobs = [];
        }

        // const {jobsSorted, nextPage} = params        
        
        // jobs = [...jobs, ...jobsSorted]
        // chrome.runtime.sendMessage({message:'getAccumJobs', datos: jobs });
        // if(nextPage){
        //     const {
        //         sender:{
        //             tab:{url, id},
        //         }
        //     } = sender;
        //     changeTabToNextPage(url, id)
        // }
        
        
      }//else start = false;
    });
  });

