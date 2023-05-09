import { getObjectInLocalStorage } from "../scripts/storage.js";

const btnStartScrapting = document.getElementById("btn-start-scraping");
const btnStopScrapting = document.getElementById("btn-stop-scraping");
const btnResetScrapting = document.getElementById("btn-reset-scraping");
const btnFinishScrapting = document.getElementById("btn-finish-scraping");
const textAreaScraping = document.getElementById("ta-data-scraping");
const textScraping = document.getElementById("div-data-scraping");
const alertScraping = document.getElementById("alert-success-scraping");

var portBackground = chrome.runtime.connect({
  name: "popup-backgroud"
});

function changeViewStatus(textArea, textalert, classListAlert, displayAlert, remove = false) {
  textAreaScraping.value = textArea;
  textScraping.innerHTML = textArea;
  alertScraping.innerHTML = textalert;
  alertScraping.className = "";
  classListAlert.forEach(element => alertScraping.classList.add(element));
  alertScraping.style.display = displayAlert;
  if (remove) {
    setTimeout(() => {    
      alertScraping.style.display = "none";
    }, 2000);
  }  
}

function showResult() {
  getObjectInLocalStorage("filter_jobs").then((data) => {    
    const groupJobs = JSON.stringify(data, null, 3);
    if (groupJobs) {
      textAreaScraping.value = groupJobs;
      let innerHTML = '<div class="jobs">';      
      let jHtml = Object.entries(data).map(([city, ranges]) => {
        let cHtml = '<div class="job">';
        cHtml += '<div class="city"><h3>' + city + '</h3></div>';
        cHtml += '<div class="ranges">';
        let salaryRanges = Object.entries(ranges).map(([salary, count]) => {
          let sHtml = '<div class="range-salary"><p class="salary">';
          sHtml += salary + '</p><p class="count">   '+ count +'</p></div>';
          return sHtml;
        });
        salaryRanges = salaryRanges.join('');        
        return cHtml + salaryRanges+ '</div></div>';
      });
      console.log('salary jHtml', jHtml);
      innerHTML += jHtml.join('') + '</div>';
      textScraping.innerHTML = innerHTML;
    }    
  }).catch((error) => {    
    changeViewStatus("", error, ["alert", "alert-danger"], "block", true);
  });
}

function addEvents() {
  btnStartScrapting.addEventListener("click", async () => {
    changeViewStatus("", "Scraping...", ["alert", "alert-primary"], "block");
    portBackground.postMessage({ cmd: "start" });
  });
  
  btnStopScrapting.addEventListener("click", async () => {
    changeViewStatus("", "Process scraping stop", ["alert", "alert-primary"], "block");
    portBackground.postMessage({ cmd: "stop" });
  });
  
  btnResetScrapting.addEventListener("click", async () => {
    changeViewStatus("", "Process scraping reset", ["alert", "alert-primary"], "block", true);
    portBackground.postMessage({ cmd: "reset" });
  });

  btnFinishScrapting.addEventListener("click", async () => {
    changeViewStatus("", "Processs scraping Finished", ["alert", "alert-success"], "block", true);
    portBackground.postMessage({ cmd: "finish" });
  });

  portBackground.onMessage.addListener(async ({ message }) => {    
    if (message === "finished") {
      showResult();
    }
  });

}

showResult();
addEvents();