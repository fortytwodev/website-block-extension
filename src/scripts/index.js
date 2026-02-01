function getHostname(url) {
    let re = /^(?:https?:\/\/)?(?:[^@\\n]+@)?(?:www\\.)?([^:\\/\n?]+)/g

    return re.exec(url)[1];
}

async function blockWebsite() {
    let inputEl = document.getElementById("inputUrl");
    if (!inputEl) return;

    let hostname = inputEl.value;
    hostname = getHostname(hostname);

    await chrome.storage.local.get(["blockedUrls"], async (result) => {
        let blockedUrls = result.blockedUrls || [];
        let alertDiv = document.getElementsByClassName("duplicate-alert-div");
        if (blockedUrls.includes(hostname))
        {
            alertDiv[0].style.display = 'inline-block';
            return;
        }
        inputEl.value = '';
        blockedUrls.push(hostname);
        alertDiv[0].style.display = 'none';

        await chrome.storage.local.set({blockedUrls: blockedUrls});
    });
}

async function unblockWebsite(event) {
    const buttonId = event.currentTarget.id.split("_");

    const liId = buttonId[buttonId.length - 1];
    let liElement = document.getElementById("url_" + liId);
    if (!liElement) return;

    const domainName = liElement.innerHTML;
    chrome.storage.local.get(["blockedUrls"], async (result) => {
        let blockedUrls = result.blockedUrls || [];
        if (!blockedUrls.includes(domainName)) return;

        const index = blockedUrls.indexOf(domainName);
        if (index > -1) {
            blockedUrls.splice(index, 1);
        }

        await chrome.storage.local.set({blockedUrls: blockedUrls});
    })
}

async function printBlockedUrls() {
    const blockedUrlsList = document.getElementById("blockedUrlsList");
    if (!blockedUrlsList) return;

    blockedUrlsList.innerHTML = "";

    chrome.storage.local.get(["blockedUrls"], (result) => {
        let blockedUrls = result.blockedUrls.reverse() || [];

        let index = 1;
        for (const url of blockedUrls) {
            const li = document.createElement("li");
            li.className = "blocked-item";

            const spanEl = document.createElement("span");
            spanEl.id = "url_" + index;
            spanEl.textContent = url;
            li.appendChild(spanEl);

            const removeButton = document.createElement("button");
            removeButton.id = "removeButton_" + index;
            removeButton.innerHTML = "&#x2715;";
            removeButton.className = "remove-btn";
            removeButton.title = "Remove";
            removeButton.addEventListener("click", unblockWebsite);

            li.appendChild(removeButton);

            blockedUrlsList.appendChild(li);
            index++;
        }
    });
}

chrome.storage.onChanged.addListener(() => {
    printBlockedUrls().then();
});

const addButton = document.getElementById("currentWebsiteAddButton");
if (addButton) {
    addButton.addEventListener("click", blockWebsite);
}

const blockedUrlsList = document.getElementById("blockedUrlsList");
if (blockedUrlsList) {
    printBlockedUrls(blockedUrlsList).then();
}
