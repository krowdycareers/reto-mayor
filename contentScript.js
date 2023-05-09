const CMD_ONLINE = 'online';
const CMD_SCRAP = 'scrap';
const CMD_GET_INFO = 'getInfo';
const CLASS_JOB_CARD = 'div[id*=jobcard]';
const CLASS_ZONES_LINKS = '[class*=zonesLinks]';
const CLASS_NEXT = '[class*=next]';
const STATUS_DISABLED = 'disabled';

function getJobsInformation() {
  const jobsElementInformation = [...document.querySelectorAll(CLASS_JOB_CARD)];

  const jobsJSONInformation = jobsElementInformation.map(e => {
    const location = e.querySelector(CLASS_ZONES_LINKS).innerText;
    const [{ href: url }, { children: [{ children: [{ innerText: fecha }, { innerText: title }, { innerText: salary }] }] }] = e.children;

    return { url, fecha, title, salary, location };
  });

  return [...jobsJSONInformation];
}

function communicateWithBackgroundScript() {
  const portBackground = chrome.runtime.connect({ name: 'content_script-background' });

  portBackground.postMessage({ cmd: CMD_ONLINE });

  chrome.runtime.onConnect.addListener(port => {
    port.onMessage.addListener(({ cmd }) => {
      if (cmd === CMD_SCRAP) {
        const jobsInformation = getJobsInformation();
        const btnNext = document.querySelector(CLASS_NEXT);
        const nextPage = !btnNext.className.includes(STATUS_DISABLED);
        portBackground.postMessage({ cmd: CMD_GET_INFO, jobsInformation, nextPage });
      }
    });
  });
}

console.log('Injecting script...');
communicateWithBackgroundScript();
