// Service Worker for Chrome Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Workflow Studio installed');
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'popup.html' });
});
