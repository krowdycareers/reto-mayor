console.log("se esta ejecutando el JS");

function getJobsInformation() {
    let jobElementInformation = document.querySelectorAll('div[id*=jobcard]');
    jobElementInformation=[...jobElementInformation];
    const jobsJsonInformation = jobElementInformation.map((el)=>{
      const[
        {href: url },
        {
          children: [
            {
              children: [
                {innerText:fecha},
                {innerText:title},
                {innerText:salary},
                {innerText:det},
                {innerText:zona},
              ],
            },
          ],
        },
      ] = el.children;
      return {url, fecha, title, salary,det,zona}
    }); 
    return jobsJsonInformation
  };
  const portBackground=chrome.runtime.connect({
    name:"content_script-background",
  });
  const portIndex = chrome.runtime.connect({
    name: "content_script-index"
  });
  portBackground.postMessage({cmd:'online'});
  //getJobsInformation();
  chrome.runtime.onConnect.addListener(function(port){
    port.onMessage.addListener(function(params){
      const {cmd, jobs}=params;
        if(cmd=="scrap"){
            const jobsInformation = getJobsInformation();
            const buttonNext = document.querySelector("[class*=next]");
            const nextPage = !buttonNext.className.includes('disabled');
            portBackground.postMessage({cmd:"getInfo", jobsInformation, nextPage});
            portIndex.postMessage({cmd:"procesing"});
        };
        if(cmd=="stop"){
            portIndex.postMessage({cmd:"stop",jobs});
        };
    })
  })

  //index




// Escuchar mensajes del archivo de index
chrome.runtime.onMessage.addListener(function(mensaje, sender, sendResponse) {
  if (mensaje.respuesta === "Hola, contenido!") {
    // Actualizar el contenido de la página en consecuencia
    document.getElementById("mensaje").innerText = "Recibí un mensaje del index!";
  }
});
