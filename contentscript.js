function getJobs() {
  const DOMelements = [...document.querySelectorAll("div[id*=jobcard]")];

  const jobs = DOMelements.map((e) => {
    const cardElements = e.children[1].children[0].children;
    const count = cardElements.length;
    const title = cardElements[1].innerText;
    const salary = cardElements[2].innerText;
    const location =
      cardElements[count - 2].children[0].children[0].children[0].children[0]
        .children[1].innerText;
    return {
      title,
      salary,
      location,
    };
  });
  return jobs;
}

const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

portBackground.postMessage({ cmd: "online" });

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(function ({ cmd }) {
    if (cmd === "scrap") {
      const jobsInformation = getJobs();

      const nextBtn = document.querySelector("[class*=next]");
      const nextPageExists = !nextBtn.className.includes("disabled");

      portBackground.postMessage({
        cmd: "getInfo",
        jobsInformation,
        nextPageExists,
      });
    }
  });
});
