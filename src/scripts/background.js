function getNewRule(id, blockedDomain){
     return {
        id : id,
        priority: 1,
        action : { type : "block" },
        condition : {
            urlFilter: blockedDomain,
            resourceTypes: ["main_frame", "sub_frame"]
        }
    }
}

async function declarativeRequestSetRules() {
    chrome.storage.onChanged.addListener(() => {
        chrome.storage.local.get(["blockedUrls"], async (result) => {
            let blockedUrls = result.blockedUrls || [];
            if (!blockedUrls) return;

            const oldRules = await chrome.declarativeNetRequest.getDynamicRules();

            let rules = [];
            let ruleId = 1;
            for (let index in blockedUrls) {
                const newRule = getNewRule(ruleId, blockedUrls[index]);
                rules.push(newRule);
                ruleId++;
            }

            const oldRuleIds = oldRules.map(rule => rule.id);
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: oldRuleIds,
                addRules: rules
            });
        });
    });
}

declarativeRequestSetRules().then(() => {});
