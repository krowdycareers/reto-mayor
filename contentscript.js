// nos devuelve un array de objetos con la info importante de cada aviso
function jobCardsInfo() {
  //obtiene todos los elementos cuyos id comienzan con "jobcard"
  // los recibe como nodos y con el spread operator convertimos el array de Nodes a un array de Elements
  const jobCards = [...document.querySelectorAll("div[id*=jobcard]")];

  // extraemos solo la informacion que queremos
  return jobCards.map((card) => {
    // Del cardJob extraemos: fecha, titulo del trabajo, salario
    const [{ innerText: date }, { innerText: title }, { innerText: salary }] =
      card.children[1].children[0].children; // card.children me da 2 elementos, pero la info esta en el 2do. Y de ese 2do elemento necesito su primer hijo. Y finalmente los hijos de este ultimo

    // Del cardJob extramos: localidad
    const locations = [...card.querySelectorAll("a[title*=Empleos]")];
    // locations me devuelve un array de 2 elementos. La localidad y el estado
    // pero hay cards que no tienen localidad, solamente estado

    // por ello pongo el reverse()[0]
    let [{ title: location } = { title: "" }] =
      locations.reverse();

    // si el card no tiene location le asignamos "" y luego al imprimir en el front le pondremos "Sin especificar localidad"
    if (location === "") {
      return { title, salary, location };
    }
    //location = location.slice(11); // le quitamos el "empleos en "
    return { title, salary, location: location.slice(11) };
  });
}

// establece una conexion con el background
//const buttonNext = () => document.querySelector("li[class*=next]"); //
const element = document.querySelector("div[class*=jobCardContainer]");
const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

let mutation = null;
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === "scrap") {
      console.log("scrapeando");
      mutation = new MutationObserver(() => {
        const buttonNext = document.querySelector("li[class*=next]");
        console.log("buttonNext", buttonNext);
        if (buttonNext) {
          console.log("existe el button next ");
          const nextPage = buttonNext.className.includes("disabled");

          //si es que no tiene la clase disabled
          if (nextPage === false) {
            const jobsInfo = jobCardsInfo();

            //envia la info al background para que la vaya sumando
            portBackground.postMessage({
              cmd: "saveInfo",
              jobsInfo,
            });
            buttonNext.click();
          } else {
            mutation && mutation.disconnect();
            portBackground.postMessage({ cmd: "saveInLocalStorage" });
          }
        }
        //alertar que no hubo boton (por implementar)
      });

      mutation.observe(element, { subtree: true, childList: true });

      const jobsInfo = jobCardsInfo();

      portBackground.postMessage({
        cmd: "saveInfo",
        jobsInfo,
      });

      document.querySelector("li[class*=next]").click();
    }

    if (cmd === "stop") {
      mutation && mutation.disconnect();
      portBackground.postMessage({ cmd: "saveInLocalStorage" });
    }
  });
});
