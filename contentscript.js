console.log("Ejecutando ContentScript");

function getJobsInformation() {
  let listCardJob = document.querySelectorAll("div[id*=jobcard-]>a");
  listCardJob = [...listCardJob];

  const jobLink = listCardJob.map((el) => el.href);
  let doc;
  return jobLink.map((urlJob) => {
    return fetch(urlJob)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        doc = parser.parseFromString(html, "text/html");

        let jobContainer = doc.querySelector("div[class*=card-][class*=flat-]");
        const [
          {
            children: [
              {
                children: [
                  { innerText: date },
                  { innerText: title },
                  { innerText: range },
                  { innerText: workPlace },
                ],
              },
            ],
          },
          ,
          {
            children: [
              ,
              {
                children: [
                  {
                    children: [
                      ,
                      {
                        children: [
                          {
                            children: [, { innerText: category }]
                          },
                          {
                            children: [, { innerText: subCategory }]
                          },
                        ],
                      },
                    ],
                  },
                  ,
                  ,
                  { innerText: contract },
                  { innerText: detail1 },
                  { innerText: detail2 },
                  { innerText: detail3 },
                ],
              },
            ],
          },
        ] = jobContainer.children;
        const details = [contract,detail1, detail2, detail3];
        const jsonJobsReturn = {
          Fecha: date,
          Titulo: title,
          Salario: range,
          Lugar: workPlace,
          Categoria: category,
          Subcategoria: subCategory,
          Detalles: Object.values(details),
        };
        console.log(jsonJobsReturn);
        return jsonJobsReturn
      })
      .catch((error) => console.log(error));
  });
}


const portBackground = chrome.runtime.connect({
  name: "content_script-background",
})

chrome.runtime.onConnect.addListener(async function (port) {
  await port.onMessage.addListener(({ cmd }) => {
    if (cmd == "scrap") {

      let jobInfo = getJobsInformation()
      Promise.all(jobInfo)
      .then(jobsSorted => {
        // console.log(jobsSorted);
        const buttonNext = document.querySelector('[class*=next]');
        const nextPage = !buttonNext.className.includes("disabled")
        
        return portBackground.postMessage({cmd:'getInfo',jobsSorted, nextPage})
      })
      .catch((err)=>console.log(err))

      
    }
  });
});



