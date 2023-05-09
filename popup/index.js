const btnGetSummaryDOM = document.getElementById("btn-get-summary");
const btnRemoveDataDOM = document.getElementById("btn-remove-data");
const inforContainerDOM = document.getElementById("information-container");
const loaderDOM = document.getElementById("loader-container");

const drawJobsInformation = (jobs) => {
  let result = jobs.map((el) => {
    const title = `<h2 class="header">${el.title}</h2>`;
    const salaries = el.salaries.map((elem) => {
      const subTitle = `<p>${elem.amount}</p>`;
      const count = `<span>${elem.count}</span>`;

      return `<li>${subTitle} ${count}</li>`;
    });

    return `
      <li class="card">
        ${title} 
        <div class="body">
          <h3>
            <span>Rango</span>
            <span>Cantidad</span>
          </h3> 
          <ul>
            ${salaries.join("")}
          </ul>
        </div>
      </li>`;
  });

  inforContainerDOM.innerHTML = result.join("");
};

btnRemoveDataDOM.addEventListener("click", () => {
  // chrome.storage.local.remove(["jobsInformation"]);

  localStorage.removeItem("jobsInformation");

  drawJobsInformation([]);
});

btnGetSummaryDOM.addEventListener("click", async () => {
  loaderDOM.style.opacity = "1";
  loaderDOM.style.display = "block";

  var port = chrome.runtime.connect({ name: "popup-background" });

  port.postMessage({ cmd: "start" });
});

chrome.runtime.onMessage.addListener((message) => {
  const { cmd, data } = message;

  if (cmd === "showJobsInfomation") {
    localStorage.setItem("jobsInformation", JSON.stringify(data));

    loaderDOM.style.opacity = "0";

    setTimeout(() => {
      loaderDOM.style.display = "none";
    }, 500);
    drawJobsInformation(data);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // chrome.storage.local.get(["jobsInformation"],  (resultado) => {
  //   drawJobsInformation(resultado.jobsInformation);
  // });

  const jobsInformation = localStorage.getItem("jobsInformation");

  if (jobsInformation) {
    drawJobsInformation(JSON.parse(jobsInformation));
  }
});
