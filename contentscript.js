console.log("Se esta ejecutando el javascript");

function getJobsInformation() {
  const jobsElementsInformation = [
    ...document.querySelectorAll("div[id^=jobcard]"),
  ];

  const jobsInformation = jobsElementsInformation.map((jobElement) => {
    const [
      {},
      {
        children: [
          {
            children: [
              { innerText: date },
              { innerText: title },
              { innerText: salary },
            ],
          },
        ],
      },
    ] = jobElement.children;

    const city = jobElement.querySelector('p[class*=zonesLinks]').innerText;

    return { title, salary: salary.replace("\n", " "), date: date.split("\n")[0], city };
  });

  const todayJobsInformation = jobsInformation.filter((job) => job.date === 'Hoy' && job.city !== '');

  return todayJobsInformation;
}

const portBackground = chrome.runtime.connect({name: 'content_script-background'});

portBackground.postMessage({ cmd: 'online'});

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(({cmd}) => {
        if (cmd === 'scrap')  {
            // Obtenemos el resultado del scraping
            const jobsInformation = getJobsInformation();

            const nextButton = document.querySelector('[class*=next]');

            const existsNextPage = !nextButton.className.includes('disabled')

            portBackground.postMessage({cmd: 'storeInfo', jobsInformation, existsNextPage});

            console.log(jobsInformation);
        }
    });
});