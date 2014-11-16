// if (window.chrome && window.chrome.app && window.chrome.app.isInstalled) {
/*
if (window.chrome && window.chrome.app) {
  window.open("tasker.html", "bg", "background");
}
*/
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // chrome.tabs.create({url :chrome.extension.getURL('tasker.html')});
  chrome.tabs.create({'url' :'tasker.html'});
});
