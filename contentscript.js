function getJobsInformation() {
  const jobElementInformation = document.querySelectorAll("div[id*=jobcard]");
  const jobsInformation = [...jobElementInformation];

  const jobsJsonInformation = jobsInformation.map((element) => {
    const [
      { href: url },
      {
        children: [
          {
            children: [
              { innerText: fecha },
              { innerText: title },
              { innerText: salary },
              { innerText: description },
              { innerText: city },
            ],
          },
        ],
      },
    ] = element.children;

    let number = salary.replace("\n", " ").trim().replace(/\D/g, '')
    let index = number.match(/^(\d*?0)([1-9]\d*)$/)
    let primeraParte = index && index[1] || null
    let min = parseInt(primeraParte)

    let segundaParte = index && index[2] || null
    let max = parseInt(segundaParte)

    return {
      salary: {
        min,
        max,
      },
      city: city.substring(city.indexOf("\n\n") + 2)
    };
  });

  return jobsJsonInformation;
}

let portBackground;

//Conexion al background
(() => {
  portBackground = chrome.runtime.connect({
    name: "content_script-background",
  });
})();
//

portBackground.postMessage({ cmd: "online" });

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd === "scrap") {
      const jobsInformation = getJobsInformation();
      const buttonNext = document.querySelector("[class*=next]");
      const nextPage = !buttonNext.className.includes("disabled");
      portBackground.postMessage({ cmd: "getInfo", jobsInformation, nextPage });
    }
  });
});
