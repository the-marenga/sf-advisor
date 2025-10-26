// content_script.js
// This script injects a page-level script that hooks fetch/XHR, because content scripts
// run in an isolated world and cannot overwrite page's fetch/XHR directly.

(function inject() {
  const url = chrome.runtime.getURL("injected_page_hook.js");
  const s = document.createElement("script");
  s.src = url;
  s.onload = () => { s.remove(); };
  (document.head || document.documentElement).appendChild(s);
})();

// Listen to window.postMessage events from the injected script
window.addEventListener("message", (ev) => {
  if (!ev.data || ev.data.source !== "EXT_SCRAPBOOK_PAGE_HOOK") return;
  // forward to background
  chrome.runtime.sendMessage({
    type: "SCRAPBOOK_CAPTURE",
    url: ev.data.url,
    body: ev.data.body,
    method: ev.data.method,
    headers: ev.data.headers
  });
});
