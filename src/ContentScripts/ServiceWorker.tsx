import { ConfigurationDefaults } from "../Configuration/ConfigurationList";

//default config on install
chrome.runtime.onInstalled.addListener(function (details) {
    if (
        details.reason == "install"
    ) {
        chrome.storage.sync.set(ConfigurationDefaults);
    }
});

//listen for 'open settings' button click
chrome.runtime.onMessage.addListener((request) => {
    if (request === "showOptions") chrome.runtime.openOptionsPage();
});
