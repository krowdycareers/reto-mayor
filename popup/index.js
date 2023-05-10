const btnScripting = document.getElementById("btnscript");
const parrafo = document.getElementById("mensaje");
const txtJobs = document.getElementById("jobs");
const btnStop = document.getElementById("btnStop");
/*chrome.storage.local.get("jobs", (res) =>{
  console.log(res);
})*/
const transformJobs = (jobs) =>{
  const jobsSalary = jobs.reduce((prev,curr)=>{
    if(prev[curr.salary]){
      prev[curr.salary] +=1;
      return prev;
    }
    prev[curr.salary] = 1;
    return prev;
  },{});
  const arraySalary = Object.entries(jobsSalary);
  const htmlSalary = arraySalary.reduce((prev,curr)=>{
    return prev + `<div class="ctn-sueldos"><p>${curr[0]}</p><p> ${curr[1]}</p></div>`;
  },"");
  return htmlSalary;
}
chrome.storage.local.get("jobs", (res) =>{
  if(!res) return;
  console.log(res.jobs);
  res = res.jobs;
  txtJobs.innerText = `Jobs: ${res.length}`;
  parrafo.innerHTML = transformJobs(res);
})
btnScripting.addEventListener("click", async () => {
  var port = chrome.runtime.connect({name: "popup-background"});
  port.postMessage({cmd:"start"});
  port.onMessage.addListener(({jobs})=>{
    //alert(message);
    //JSON.stringify(transformJobs(jobs))
    txtJobs.innerText = `Jobs: ${jobs.length}`;
    parrafo.innerHTML = transformJobs(jobs);
  });

});
btnStop.addEventListener("click", () =>{
  const portStop = chrome.runtime.connect({name:"popup-bg-stop"});
  portStop.postMessage({cmd:"stop"});
});


function alertHelloWorld() {
  alert("Hello World");
}
//const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  //chrome.scripting.executeScript({
  //  target: { tabId: tab.id },
  //  func: getJob,
  //});
  //const portTabActive = chrome.tabs.connect(tab.id,{name:"popup"});
  
  //portTabActive.onMessage.addListener(({message})=>{
  //  parrafo.innerText = JSON.stringify(message,null,2); 
  //});
  //portTabActive.postMessage({cmd:"scrap"});