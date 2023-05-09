const btnScript = document.querySelector('#btnScript');
const btnStop = document.querySelector('#btnStop');
const btnShowData = document.querySelector('#btnShowData');
const btnClearData = document.querySelector('#btnCleanData');
const showData = document.querySelector('#showData');

btnScript.addEventListener('click', () => {
  btnScript.disabled = true;
  btnStop.disabled = false;
  const port = chrome.runtime.connect({ name: 'popup-background' });
  port.postMessage({ cmd: 'start' });
});

btnStop.addEventListener('click', () => {
  btnScript.disabled = true;
  btnStop.disabled = true;
  btnShowData.disabled = false;
  const port = chrome.runtime.connect({ name: 'popup-background' });
  port.postMessage({ cmd: 'finish' });
});

btnShowData.addEventListener('click', async () => {
  btnShowData.disabled = true;
  btnClearData.disabled = false;

  await chrome.storage.local.get(['jobs'], (result) => {
    const jobs = JSON.parse(result.jobs);

    let html = '';

    for (const ciudad in jobs) {
      let list = '';
      for (const salary in jobs[ciudad]) {
        list += `<li>${salary} <span>${jobs[ciudad][salary].length}</span></li>`;
      }

      html += `
        <div>
          <h3>${ciudad}</h3>
          <ul>
            ${list}
          </ul>
        </div>`;
    }

    showData.innerHTML = html;
  });
});

btnClearData.addEventListener('click', async () => {
  btnClearData.disabled = true;
  btnScript.disabled = false;
  chrome.storage.local.clear();
  showData.innerText = '';
});
