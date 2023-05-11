const btnScripting = document.getElementById("btnscript");
const showMessageInElementP = document.getElementById("message");

function replaceLines(key, value) {
  if (typeof value === "string") {
    return value.replace(/\n/g, "<br>");
  }
  return value;
}

btnScripting.addEventListener("click", async () => {
  var port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ command: "start" });

  chrome.runtime.onMessage.addListener(({ command, result }) => {
    if (command === "endScrap") {
      let parseResultToShow = "";
      for (const property in result) {
        let parseSalaryAndAmountByUbication = "";
        for (const salary in result[property]) {
          parseSalaryAndAmountByUbication = `${parseSalaryAndAmountByUbication} 
          ${salary}: ${result[property][salary]["amountOfJobs"]}`;
        }

        parseResultToShow =
          parseResultToShow +
          `${property}:
        ${parseSalaryAndAmountByUbication}
        -----------------------------------------
        `;
      }

      showMessageInElementP.innerHTML = JSON.stringify(parseResultToShow, replaceLines, 3);
    }
  });
});