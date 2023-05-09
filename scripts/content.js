function getCity(country, otherCountry) {
    let cityText = '',
        city = country.querySelector('p'),
        otherCity = otherCountry.querySelector('p');

    if (city) {
        cityText = city.innerText;
    } else if (otherCity) {
        cityText = otherCity.innerText;
    }

    return cityText;
}

function getSalaryRange(salary) {
    let salaryRange = [],
        range = salary.match(/\d+(,\d+)?/g);
    if (!range || range.length === 0) {
        salaryRange = [0,0];
    } else if (range.length === 1) {
        salaryRange = [range[0], range[0]];
    } else {
        salaryRange = range;
    }
    return salaryRange.join('-');
}

function getJobsInformation() {
    let jobsElementInformation = document.querySelectorAll("div[id*=jobcard]");
    jobsElementInformation = [...jobsElementInformation];

    const jobJsonInformation = jobsElementInformation.map((el) => {
        const [
            { href: url},
            {
                children: [ 
                    {
                        children: [
                            { innerText: fecha },
                            { innerText: title },
                            { innerText: aSalary },
                            {},
                            country,
                            otherCountry,
                        ],
                    },               
                ],
            },
        ] = el.children;

        let city = getCity(country, otherCountry),
            salary = getSalaryRange(aSalary);
        
        return { url, fecha, title, salary, city};
    }).filter(job => {
        const fecha = job.fecha.toLowerCase();
        return fecha.includes('hoy');
    });


    return jobJsonInformation;
}

async function initPortListener()  {
    chrome.runtime.onConnect.addListener(function (port) {    
        port.onMessage.addListener(({ cmd }) => {
            //alert('scraping in conten js: ' + cmd);
            if (cmd == "scrap") {
                const jobsInformation = getJobsInformation();
                const buttonNext = document.querySelector("[class*=next]");
                const nextPage = !buttonNext.className.includes('disabled');    
                portBackground.postMessage({ cmd: "getInfo", jobsInformation, nextPage });
            }
        });
    });
}

const portBackground = chrome.runtime.connect({
    name: "content_script-background"
});

portBackground.postMessage({ cmd: "online" });

initPortListener();