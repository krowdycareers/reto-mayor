const btnStartElement = document.getElementById('btnStart');
const messageElement = document.getElementById('message');

btnStartElement.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const port = chrome.tabs.connect(tab.id, { name: "popup" });
  port.postMessage({ message: "getJobs" });

  const { message, data } = await new Promise(resolve => {
    chrome.runtime.onMessage.addListener(resolve);
  });

  if (message === "ok") {
    const groupByLocation = groupBy(['location']);
    const groupedData = groupByLocation(data);
    console.log(JSON.stringify({ groupByLocation: groupedData }, null, 2));

    displayData(groupedData);
  }
});

function groupBy(keys) {
  return array =>
    array.reduce((objectsByKeyValue, obj) => {
      const value = keys.map(key => obj[key]).join('-');
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {});
}

function displayData(data) {
  for (const location in data) {
    const jobGroup = data[location];
    jobGroup.forEach(job => {
      const div = document.createElement("div");
      div.innerHTML = `<br> <strong>Lugar:</strong> <em>${job.location}</em> <br> Salario: ${job.salary}`;
      messageElement.appendChild(div);
    });
  }
}