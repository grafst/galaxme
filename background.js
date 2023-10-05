chrome.runtime.onInstalled.addListener(async () => {
  console.log("installed");
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

const domains = [
  "www.galaxus.ch",
  "www.galaxus.be",
  "www.galaxus.at",
  "www.galaxus.fr",
  "www.galaxus.de",
  "www.digitec.ch",
];

const languages = ["de", "fr", "it", "en", "nl", undefined];

async function getBadgeText() {
  const text = await chrome.action.getBadgeText({});
  console.log("CurrentState: " + text);
  return text;
}

function isEndpoint(url, endpoint) {
  const urlSplit = url.split("/");
  const domain = urlSplit[2];
  const language = urlSplit[3];
  const page = urlSplit[4];
  console.log(language);
  if (domains.includes(domain)) {
    console.log("domain: " + domain);
    if (
      language === undefined ||
      language === "" ||
      languages.includes(language)
      ) {
        //console.log("language: " + language);
        // if page is undefined
        if (page === endpoint) {
          console.log("we are on" + endpoint);
          return true;
        }
      }
    }
    console.log("we are not on" + endpoint);
    return false;
  }
  
  async function activate(tab,changeInfo) {
    console.log("activate");
    console.log(tab.url);
    //if url undefined get it
    if (!tab.url) {
      console.log("getting url");
      tab = await chrome.tabs.get(tab.id);
    }
    console.log(tab.url);
    if (
      tab.url &&
      domains.some((domain) => tab.url.startsWith("https://" + domain))
      ) {
        console.log("we are on a supported page");
        const currentState = await getBadgeText();
        if (currentState === "ON") {
          console.log("inserting galaxme.css");
          // Insert the CSS file when the user turns the extension on
          await chrome.scripting.insertCSS({
            files: ["galaxme.css"],
            target: { tabId: tab.id },
          });

          //get hideCategories value
          let data =await chrome.storage.sync.get("hideCategories");
          hideCategories = data["hideCategories"];
            if(hideCategories){
              console.log("hiding categories");
              await chrome.scripting.insertCSS({
                files: ["categories.css"],
                target: { tabId: tab.id },
              });
            }
              console.log(tab.url);
              //if its exactly the domain aka homepage, then redirect to the orders page
              if (isEndpoint(tab.url, undefined)) {
                chrome.tabs.update(tab.id, {
                  url: tab.url + "/order",
                });
              }
              if (changeInfo && changeInfo.status === "complete" && tab.url) {
                console.log("tab has completed loading")
                if (isEndpoint(tab.url, "order")) {
                  // auto select field with name 'searchField'
                  chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                      document
                      .getElementsByName("searchField")[0]
                      .focus();
                    },
                  });
                }
              }
            } else if (currentState === "OFF") {
              // Remove the CSS file when the user turns the extension off
              console.log("removing galaxme.css");
              await chrome.scripting.removeCSS({
                files: ["galaxme.css"],
                target: { tabId: tab.id },
              });
            }
          }
        }
        
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo,  tab) => {
          console.log(tab);
          console.log("changInfo: " + changeInfo.status);
          //get url of tab
          console.log("updated");
          activate(tab,changeInfo);
        });
        
        chrome.action.onClicked.addListener(async (tab) => {
          console.log("onClicked");
          // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
          const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
          console.log("prevState: " + prevState);
          // Next state will always be the opposite
          const nextState = prevState === "ON" ? "OFF" : "ON";
          // Set the action badge to the next state
          await chrome.action.setBadgeText({
            //tabId: tab.id,
            text: nextState,
          });
          console.log(await getBadgeText(tab));
          activate(tab);
          console.log(await getBadgeText(tab));
        });
        