// Inicializamos un objeto vacío para almacenar los trabajos extraídos
let jobs = {}

// Escuchamos a cualquier puerto que se conecte al evento onConnect del runtime de Chrome
chrome.runtime.onConnect.addListener(function (port) {
  // Escuchamos a cualquier mensaje enviado por el puerto
  port.onMessage.addListener(async function (params, sender) {
    // Consultamos las pestañas de Chrome que estén activas y en la ventana actual
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    // Si no se encontró una pestaña activa, imprimimos un mensaje de error en la consola y salimos de la función
    if (!tab) {
      console.log('error con tabs query')
      return
    }

    // Creamos un nuevo puerto de conexión con la pestaña actual y lo nombramos 'bg-content_script'
    let port = chrome.tabs.connect(tab.id, { name: 'bg-content_script' })

    // Si el comando recibido es 'start', enviamos el mensaje 'scrap' al puerto de la pestaña actual para iniciar la extracción de datos
    if (params.cmd === 'start') {
      port.postMessage({ cmd: 'scrap' })
    }

    // Si el comando recibido es 'stop', enviamos el mensaje 'stop' al puerto de la pestaña actual para detener la extracción de datos
    if (params.cmd === 'stop') {
      port.postMessage({ cmd: 'stop' })
    }

    // Si el comando recibido es 'getInfo', extraemos la información de los trabajos y la almacenamos en el objeto 'jobs'
    if (params.cmd === 'getInfo') {
      const { jobsInformation } = params

      jobsInformation.forEach((job) => {
        const { location, salary: salaryToAdd } = job

        if (!jobs[location]) {
          jobs[location] = [{ salary: salaryToAdd, count: 1 }]
        } else {
          let bool = false
          jobs[location].forEach((u) => {
            if (u.salary == salaryToAdd) {
              bool = true
              u.count++
            }
          })

          if (!bool) jobs[location].push({ salary: salaryToAdd, count: 1 })
        }
      })

      console.log(jobs)
    }

    // Obtenemos la fecha y hora actual como una cadena legible para humanos
    const newDate = new Date().toLocaleString()

    // Si el comando recibido es 'sendLocalStorage', almacenamos el objeto 'jobs' en el almacenamiento local de Chrome
    if (params.cmd === 'sendLocalStorage') {
      chrome.storage.local.set({
        scrapperJobs: JSON.stringify({ date: newDate, data: jobs })
      })

      // Reiniciamos el objeto 'jobs'
      jobs = {}
    }
  })
})
