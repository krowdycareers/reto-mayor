const btnScripting = document.getElementById("btnscript");
const pMessageElement = document.getElementById("mensaje");

btnScripting.addEventListener("click", async () => {
  var port= chrome.runtime.connect({name:"popup-background"});
  port.postMessage({cmd:"start"});
});

// En el archivo de index
chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "content_script-index") {
    // Escuchar mensajes del content script
    port.onMessage.addListener(function(params) {
      const {cmd, jobs}=params;
      if(cmd=="procesing"){
        pMessageElement.textContent = "procesando...";
      };
      if(cmd=="stop"){
        //const salaries = [...new Set(jobs.map(objeto => objeto.salary))];
        const jobsBySalaryAndZone = {};
        jobs.forEach(objeto => {
          const salario = objeto.salary;
          const zona = objeto.zona.replace(/^.+\n\n/, '');
          if (jobsBySalaryAndZone[zona]) {
            if (jobsBySalaryAndZone[zona][salario]) {
              jobsBySalaryAndZone[zona][salario]++;
            } else {
              jobsBySalaryAndZone[zona][salario] = 1;
            }
          } else {
            jobsBySalaryAndZone[zona] = {};
            jobsBySalaryAndZone[zona][salario] = 1;
          }
        });
        pMessageElement.textContent = JSON.stringify(jobsBySalaryAndZone, null, 2);
      };
    });
  }
});



