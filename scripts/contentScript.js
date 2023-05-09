function scrapNow() {
  let jobElsInfo = document.querySelectorAll("div[id*=jobcard]");
  jobElsInfo = [...jobElsInfo];

  const jobJsonInfo = jobElsInfo.map((jobEl) => {
    const [
      { href: url },
      {
        children: [
          {
            children: [
              { innerText: date },
              { innerText: title },
              { innerText: salary },
            ],
          },
        ],
      },
    ] = jobEl.children;

    const locality = jobEl.querySelector("p[class*=zonesLinks] > a");
    const zone = locality ? locality.innerText : "not founded";

    return {
      url,
      date,
      title,
      salary,
      zone,
    };
  });
  return jobJsonInfo;
}

/* chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    const data = scrapNow();
    const search = document.getElementById("search-box-keyword").value;
    sendResponse({data, search});
    }
) */ //antes

const portBackground = chrome.runtime.connect({
  name: "content_script-background",
});

portBackground.postMessage({ cmd: "online" });

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(({ cmd }) => {
    if (cmd == "scrap") {
      const jobsInfo = scrapNow();
      const btnNext = document.querySelector("[class*=next]");
      const nextPage = !btnNext.className.includes("disabled");
      portBackground.postMessage({ cmd: "getInfo", jobsInfo, nextPage });
    }
  });
});
