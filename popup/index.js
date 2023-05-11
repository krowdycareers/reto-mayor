const btnScripting = document.getElementById("btnscript");
const pMessageElement = document.getElementById("mensaje");
const tbodyElement = document.getElementById("tbody");
const container = document.getElementById("container");

btnScripting.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });
    const portTabActive = chrome.tabs.connect(tab.id, { name: "popup" });

    portTabActive.onMessage.addListener( function( {message} ) {

        console.log(message);
         // Obtener los datos del mensaje
        const sortedJobs = message;

        // Construir la cadena de texto para mostrar
        let textToShow = "";
        sortedJobs.forEach(job => {
            textToShow += `Fecha: ${job.fecha}\n`;
            textToShow += `Ciudad: ${job.ciudad}\n`;
            textToShow += `Sueldo: ${job.salario}\n`;
            textToShow += `Registros: ${job.registros}\n`;
            textToShow += '-------------------------\n';
        });

        // Mostrar la cadena de texto en la etiqueta p
        // pMessageElement.textContent = textToShow;

        // Crear un elemento <p> para cada línea de texto
        const lines = textToShow.split('\n');
        const paragraphs = lines.map(line => {
            const paragraph = document.createElement('p');
            paragraph.textContent = line;
            return paragraph;
        });

        // Agregar los elementos <p> al elemento pMessageElement
        paragraphs.forEach(paragraph => {
            pMessageElement.appendChild(paragraph);
        });


    });
    portTabActive.postMessage({ cmd: "scrap" });
});



