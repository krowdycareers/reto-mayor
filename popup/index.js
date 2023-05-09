
const btnScripting = document.getElementById("btnscript");
const btnDetener = document.getElementById("btnDetener");
const divJobsList = document.getElementById("jobs-list");
const divJobsJson = document.getElementById("jobs-json");
const divProcessing = document.getElementById('processing');
const divIntroProcessing = document.getElementById('intro-processing');
const divMensaje = document.getElementById('mensaje');
const key = 'totalJobs';
let groupedJobsForJson;

btnScripting.addEventListener("click", async () => {
    
    fornmatPopupStartProcess();

    var port = chrome.runtime.connect({ name: "popup-background" });

    port.postMessage({ cmd: "start" });

    port.onMessage.addListener(async ({cmd}) => {
        if (cmd === 'finished') {
            const totalJobs = await getObjectInLocalStorage(key);
            await removeObjectInLocalStorage(key);
            const groupedJobsByCity = groupJobsByCity(totalJobs);
            showGroupedJobs(groupedJobsByCity);
        }
    });
});

btnDetener.addEventListener("click", async () => {

    var port = chrome.runtime.connect({ name: "popup-background_detener" });

    port.postMessage({ cmd: "stop" });
});

const groupJobsByCity = (totalJobs) => {

    const allCities = [...new Set(totalJobs.map(job => job.city))];
  
    const groupedJobs = allCities.map(city => {

        const jobsByCity = totalJobs.filter(job => job.city === city);
    
        const salariesByCity = [...new Set(jobsByCity.map(job => job.salary))];

        const jobsBySalary = groupJobsbySalary(jobsByCity, salariesByCity);

        return { city, jobsBySalary };
    });

    return groupedJobs;
};

const groupJobsbySalary = (jobsByCity, salariesByCity) => {

    const jobsBySalary = salariesByCity.map(salary => { return {
        salary,
        jobs: jobsByCity.filter(job => job.salary === salary).length
    }});

    return jobsBySalary;
};

const showGroupedJobs = (groupedJobsByCity) => {

    const html = groupedJobsByCity.reduce((card, item) => {
        let content = '<div class="card text-dark bg-light mb-3">';
        content += `<div class="card-header fw-bold">${item.city}</div>`;
        content += '<div class="card-body">';

        const innerCard = item.jobsBySalary.reduce((ul, el) => {
            const txt = el.jobs > 1 ? 'jobs' : 'job';
            let innerList = `<li>${el.salary}: ${el.jobs} ${txt}</li>`;
            return ul + innerList;
        }, '');

        content += `<ul class='fs-6'>${innerCard}</ul>`
        content += '</div></div>';
        return card + content;
    }, '');

    groupedJobsForJson = JSON.stringify(groupedJobsByCity, null, 2);
    
    fornmatPopupFinishProcess(html); 
};

const fornmatPopupStartProcess = () => {
    divProcessing.classList.remove('invisible');
    divProcessing.classList.add('visible');
    btnScripting.setAttribute('disabled', 'disabled');
    btnDetener.classList.remove('invisible');
    btnDetener.classList.add('visible');
};

const fornmatPopupFinishProcess = (html) => {
    divProcessing.classList.remove('visible');
    divProcessing.classList.add('invisible');
    divIntroProcessing.classList.add('invisible');
    btnScripting.removeAttribute('disabled');
    btnJson.classList.remove('invisible');
    divJobsList.innerHTML = html;
    btnDetener.classList.remove('visible');
    btnDetener.classList.add('invisible');
};

btnJson.addEventListener("click", () => {
    divJobsList.classList.remove('d-block');
    divJobsList.classList.add('d-none');
    divJobsJson.innerHTML = createTxtJson();
    document.getElementById('txt-json').value = groupedJobsForJson;
    btnLista.classList.remove('invisible');
    btnLista.classList.remove('d-none');
    btnLista.classList.add('d-block');
    btnJson.classList.add('d-none');
});

btnLista.addEventListener("click", () => {
    divJobsList.classList.remove('d-none');
    divJobsList.classList.add('d-block');
    divJobsJson.innerHTML = '';
    btnJson.classList.remove('d-none');
    btnJson.classList.add('d-block');
    btnLista.classList.add('d-none');
 });

 const createTxtJson = () => {
    const txtJson = `<textarea readonly id='txt-json' rows='15' class='w-100'></textarea>`;
    return txtJson;
 };

//#region STORAGE

const getObjectInLocalStorage = async function (key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(key, function (value) {
                console.log(value);
                const res = value.totalJobs ?? [];
                resolve(res);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

const removeObjectInLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.remove(key, function () {
                resolve();
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

//#endregion

