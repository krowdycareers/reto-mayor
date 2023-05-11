console.log("background run");
let jobs = {};

// Establece una conexion para escuchar los comandos entrantes
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function (params, sender) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    //no encontro la tab
    if (!tab) {
      console.log("error al conseguir la tab");
      return;
    }
    console.log("tab found");

    //establece un puerto con el content script
    let portContentScript = chrome.tabs.connect(tab.id, {
      name: "bg-content_script",
    });

    // si el comando que llega  es "start" ... (desde indexjs)
    if (params.cmd === "start") {
      //envia el comando 'scrap' al contentscript
      console.log("envia scrap a contetn");
      portContentScript.postMessage({ cmd: "scrap" });
    }

    // si el comando que esta recibiendo es stop (indexjs)
    if (params.cmd === "stop") {
      //envia el comando stop al contentscript
      portContentScript.postMessage({ cmd: "stop" });
    }

    // si el comando que recibe es saveInfo (contentscript)
    if (params.cmd === "saveInfo") {
      // guarda la info entrante en la variable global jobs
      const { jobsInfo } = params;

      //acomoda el nuevo conjunto de jobsInformation a lo que ya se tiene ?
      jobsInfo.forEach((job) => {
        const { location, salary } = job;

        // si no existe esa localidad en jobs
        if (!jobs[location]) {
          //crea la localidad y le asigna un nuevo arreglo con el salario y la cantidad 1
          jobs[location] = [{ salary, count: 1 }];
        } else {
          //ya existe esa localidad
          let bool = false;

          jobs[location].forEach((u) => {
            //si ese salario ya existe
            if (u.salary == salary) {
              bool = true;
              u.count++; //aumenta el contador
            }
          });

          //en caso no existia ese salario
          if (!bool) {
            //pushea el nuevo salario con count en 1
            jobs[location].push({ salary, count: 1 });
          }
        }
      });
    }

    // si el comando que recbie es saveInLocalStorage ((contentscript))
    if (params.cmd === "saveInLocalStorage") {
      //guarda jobs en el localStorage
      chrome.storage.local.set({
        jobsAnalysis: JSON.stringify({ data: jobs }),
      });

      //resetea la variable donde estaba guardando los trabajos
      jobs = {};
    }
  });
});
