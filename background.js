// Define una constante para el nombre del puerto
const PORT_NAME = 'bg-content_script';

// Usa una función asíncrona autoejecutable para evitar contaminar el ámbito global
(async function() {
  // Define una variable para los trabajos recolectados
  let jobs = [];

  // Define una variable para el estado de la aplicación
  let isRunning = false;

  // Define una función para añadir una página al URL
  function addPageToUrl(url) {
    const regex = /page=(\d+)/;
    const match = url.match(regex);
    const page = (match && match[1]) || '1';
    const newPage = parseInt(page) + 1;

    return url.replace(regex, `page=${newPage}`);
  }

  // Define una función para cambiar la pestaña al siguiente página
  async function changeTabToNextPage(url, tabId) {
    const newUrl = addPageToUrl(url);
    await chrome.tabs.update(tabId, { url: newUrl });
  }

  // Define una función para conectarse al puerto del contenido
  function connectToContentPort(tabId) {
    const port = chrome.tabs.connect(tabId, { name: PORT_NAME });
    port.postMessage({ cmd: 'scrape' });
  }

  // Define una función para manejar los mensajes del puerto
  function handleMessage(params, sender) {
    const { cmd } = params;
    const { tab: { url, id } } = sender;

    switch (cmd) {
      case 'start':
        isRunning = true;
        connectToContentPort(sender.tab.id);
        break;
      case 'online':
        if (isRunning) {
          connectToContentPort(sender.tab.id);
        }
        break;
      case 'getInfo':
        const { jobsInformation, nextPage } = params;
        jobs = [...jobs, ...jobsInformation];

        if (nextPage) {
          changeTabToNextPage(url, id);
        } else {
          chrome.storage.local.set({ jobs });
          isRunning = false;
        }
        break;
    }
  }

  // Registra el listener del puerto
  chrome.runtime.onConnect.addListener(port => {
    port.onMessage.addListener(params => handleMessage(params, port.sender));
  });
})();
