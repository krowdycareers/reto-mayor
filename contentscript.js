// Obtiene la información de cada trabajo
function getJobsInformation() {
  // Selecciona todos los elementos del DOM cuyo id contenga "jobcard"
  const jobsCardElements = [...document.querySelectorAll('div[id*=jobcard]')];

  // Mapea cada elemento del DOM para extraer la información del trabajo
  return jobsCardElements.map((jobCard) => {
    // Obtiene la información básica del trabajo (URL, fecha de publicación, título y salario)
    const [{ href: url }, { children: [info] }] = jobCard.children;
    const [fecha, title, salary] = info.children;

    // Obtiene la ubicación del trabajo (estado y ciudad)
    const locationJobs = [...jobCard.querySelectorAll('a[title*=Empleos]')].reverse();
    let [{ title: state } = { title: '' }, { title: city } = { title: '' }] = locationJobs;
    state = state.slice(11);
    city = city.slice(10);

    // Retorna un objeto con la información extraída del trabajo
    return { title: title.innerText, salary: salary.innerText, location: state };
  });
}

// Conecta con el background script
const portBackground = chrome.runtime.connect({
  name: 'content_script-background'
});

// Obtiene el botón de "Siguiente"
function getNextButton() {
  return document.querySelector('*[class*=next]');
}

let mutation = null;
// Escucha la conexión con la extensión
chrome.runtime.onConnect.addListener(function (port) {
  // Escucha los mensajes que envía la extensión
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === 'scrap') {
      // Detecta cambios en el contenedor de trabajos para que cuando se cargue el botón se ejecute evento onClick, 
      // sólo si no está desactivado. De esta forma no se recarga la página completa, simulando el uso de usuario.
      mutation = new MutationObserver(() => {
        // Obtiene el botón "Siguiente"
        const nextButton = getNextButton();

        if (nextButton) {
          // Verifica si el botón "Siguiente" está desactivado
          const nextPage = nextButton.className.includes('disabled');

          if (!nextPage) {
            // Obtiene la información de los trabajos y envía el mensaje a la extensión
            const jobsInformation = getJobsInformation();
            portBackground.postMessage({ cmd: 'getInfo', jobsInformation });
            
            // Simula el click del botón "Siguiente"
            nextButton.click();
          } else {
            // Detiene la observación de mutaciones y envía el mensaje a la extensión para guardar la información en el almacenamiento local
            mutation && mutation.disconnect();
            portBackground.postMessage({ cmd: 'sendLocalStorage' });
          }
        }
      });

      // Observa los cambios en el contenedor de trabajos
      mutation.observe(element, { subtree: true, childList: true });

      // Obtiene la información de los trabajos y envía el mensaje a la extensión
      const jobsInformation = getJobsInformation();
      portBackground.postMessage({ cmd: 'getInfo', jobsInformation });
      
      // Simula el click del botón "Siguiente"
      getNextButton().click();
    }

    if (cmd === 'stop') {
      // Detiene la observación de mutaciones y envía el mensaje a la extensión para guardar la información en el almacenamiento local
      mutation && mutation.disconnect();
      portBackground.postMessage({ cmd: 'sendLocalStorage' });
    }
  });
});
