const getJobsInformation = () => {
  const jobsInfo = [...document.querySelectorAll('div[id^="jobcard"]')];

  const jobJsonInfo = jobsInfo.map((job) => ({
    title: job.querySelector('h2[class*="subheading"]').innerText,
    date: job.querySelector('label[class*="highEmphasis"]').innerText,
    url: job.querySelector('a').href,
    location: job.querySelector('p[class*="zonesLinks"]').innerText,
    salary: job.querySelector('span[class*="salary"]').innerText,
  }));

  return jobJsonInfo;
};

const portBackground = chrome.runtime.connect({
  name: 'content_script-background',
});

portBackground.postMessage({ cmd: 'online' });

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function ({ cmd }) {
    if (cmd === 'scrap') {
      console.log('scraping');
      const jobsInformation = getJobsInformation();
      const btnNext = document.querySelector('[class*="next"]');
      const nextPage = !btnNext.className.includes('disabled');
      portBackground.postMessage({
        cmd: 'getInfo',
        jobs: jobsInformation,
        nextPage,
      });
    }
  });
});
