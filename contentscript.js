console.log("Se esta ejecutando el javascript");
let jobsElementInformation = document.querySelectorAll("div[id*=jobcard]");

function getJobsInformation() {
    jobsElementInformation = [...jobsElementInformation];

    const jobsJsonInformation = jobsElementInformation.map((el) => {
        const ciudad=el.querySelector("[class*=zonesLinks]").innerText;
    
        const [
            { href: url },
            {
                children: [
                    {
                        children: [
                            { innerText: fecha },
                            { innerText: title },
                            { innerText: salario },
                        
                        ],
                        
                  
                    },
                ],
            },
        ] = el.children;
        
        
        return { fecha, title, salario,ciudad };
    });
    return jobsJsonInformation;

}

const  portBackground=chrome.runtime.connect({
    name:"content_script-background",
})
portBackground.postMessage({cmd:'online'})

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(({ cmd }) => {
        if (cmd === "scrap") {
            
            const existingJobsInformationJson = localStorage.getItem('jobsInformation');
            let existingJobsInformation = [];
            if (existingJobsInformationJson) {
                existingJobsInformation = JSON.parse(existingJobsInformationJson);
              }
            const jobsInformation = [...existingJobsInformation, ...getJobsInformation()];
            const jobsInformationJson = JSON.stringify(jobsInformation);
            localStorage.setItem('jobsInformation', jobsInformationJson);

            const portBackground = chrome.runtime.connect({
                name: 'content_script-background',
            });

            const buttonNext = document.querySelector("[class*=next]")
            const nextPage = !buttonNext.className.includes("disabled");

            portBackground.postMessage({ cmd: 'getInfo', jobsInformation, nextPage });
        }
    });
});

