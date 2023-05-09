const btnScripting = document.getElementById("btncomunicacion");
const btnScriptingBackground = document.getElementById("btncomunicacionbckg");
const pMessageElement = document.getElementById("message");

btnScripting.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let port = chrome.tabs.connect(tab.id, { name: "popup" });
  port.postMessage({ message: "getJobs" });
  port.onMessage.addListener(({ message, data }) => {
    if (message == "ok"){

      const groupBy = keys => array =>
      array.reduce((objectsByKeyValue, obj) => {
        const value = keys.map(key => obj[key]).join('-');
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
      }, {});

    const groupByLocation = groupBy(['location'])

    console.log(
      JSON.stringify({groupByLocation: groupByLocation(data),}, null, 2)
    );

      for (var i = 0; i < data.length; i++) {
        var div = document.createElement("div");
        div.innerHTML =
                  '<br> <strong>Lugar:</strong> ' +'<em>'+ data[i].location + '</em>' + 
                  '<br> Salario: ' + data[i].salary;
        pMessageElement.appendChild(div);
    }
    }
  }); 
});

btnScriptingBackground.addEventListener("click", async () => {
  var port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ message: "Hola BD" });
  port.onMessage.addListener(function ({ message }) {
    alert(message);
  });
});
