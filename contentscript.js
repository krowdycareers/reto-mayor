console.log("Se está ejecutando el content script");

function getJobsInformation() {
  let jobsElementInformation = document.querySelectorAll("div[id*=jobcard]");
  jobsElementInformation = [...jobsElementInformation];

  const jobInformation = jobsElementInformation.map((el) => {
    const [
      { href: url },
      {
        children: [
          {
            children: [
              { innerText: date },
              {}, // title
              { innerText: salary },
              {}, // description
              {},
              {
                children: [elementEmpresaCiudad],
              },
            ],
          },
        ],
      },
    ] = el.children;

    const enterprise = elementEmpresaCiudad?.querySelector("label")?.innerText;
    const country = elementEmpresaCiudad?.querySelector("p")?.innerText;

    // const location = enterpriseLocation.replace(/^.*\n+/gm, "");

    return { date, salary, country };
  });

  const jobsToday = jobInformation.filter((e) => e.date === "Hoy");
  const jobsForCountry = jobsToday.filter((value, index, array) => {
    return (
      array.findIndex(
        (e) => e.country === value.country && e.salary === value.salary
      ) === index
    );
  });

  return jobsForCountry;
}

const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd == "scrap") {
      const jobsInformation = getJobsInformation();
      const buttonNext = document.querySelector("[class*=next-]");
      const nextPage = !buttonNext.className.includes("disabled");
      portBackground.postMessage({ cmd: "getInfo", jobsInformation, nextPage });
    }
  });
});
