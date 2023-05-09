const PORT_BACKGROUND = chrome.runtime.connect({
  name: 'content_script-background',
});
const TEMPLATE_HEADER = '<div class="sumary__titles" id="sumary__titles"><h3>Lugar</h3><h3>Salario</h3><h3># de' +
  ' trabajos encontrados</h3></div>';

function getJobsInformation() {
  let jobs = document.querySelectorAll("div[id*=jobcard]");
  jobs = [...jobs];

  const jobsJson = jobs.map(el => {
    const location = el.querySelector("p[class*=zonesLinks-]").innerText;
    const [
      {href: url},
      {
        children: [
          {
            children: [
              {innerText: date},
              {innerText: title},
              {innerText: salary},
            ]
          }]
      }] = el.children;
    return {url, date, title, salary, location}
  });
  return jobsJson;
}

PORT_BACKGROUND.postMessage({cmd: 'online'});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({cmd, allJobsInformation}) => {
    if (cmd === 'scrap') {
      let jobsInformation = getJobsInformation();
      const buttonNext = document.querySelector("[class*=next]");
      const isLastPage = !buttonNext.className.includes('disabled');
      PORT_BACKGROUND.postMessage({cmd: "getInfo", jobsInformation, isLastPage});
    }
    if (cmd === 'saveLocal') {
      localStorage.setItem('filteredJobs', JSON.stringify(allJobsInformation));
    }
    if (cmd === 'finished') {
      const SUMARY = JSON.parse(localStorage.getItem('filteredJobs'));
      let sumaryTemplate = TEMPLATE_HEADER;
      SUMARY.forEach(sumary => {
        let emptyLocationReplace = sumary.location === '' ? 'No especificado' : sumary.location;
        sumaryTemplate += '<div class="sumary__info">';
        sumaryTemplate += `<div class="information__info__location">${emptyLocationReplace}</div>`;
        sumaryTemplate += '<div class="information__info__range">';
        sumary.salaryRange.forEach(range => {
          sumaryTemplate += `<div><span>${range.salary}</span>`;
          sumaryTemplate += `<span>${range.jobsCount}</span></div>`;
        });
        sumaryTemplate += '</div></div>';
      });
      chrome.runtime.sendMessage({ status: 'finished', template: sumaryTemplate });
    }
  })
});

