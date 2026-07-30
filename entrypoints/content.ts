import { defineContentScript } from "wxt/utils/define-content-script";
import { injectScript } from "wxt/utils/inject-script";

export default defineContentScript({
  matches: ["*://sfgame.net/*", "*://*.sfgame.net/*"],
  runAt: "document_start",

  main() {
    // Inject the page-level hook script that intercepts fetch/XHR
    injectScript("/injected_page_hook.js", {
      keepInDom: false,
    });

    // Listen to window.postMessage events from the injected script
    window.addEventListener("message", (ev: MessageEvent) => {
      if (!ev.data || ev.data.source !== "EXT_SF_PAGE_HOOK") return;
      try {
        browser.runtime.sendMessage({
          type: "SF_CAPTURE",
          url: ev.data.url,
          body: ev.data.body,
        });
      } catch {
        // background may not be ready
      }
    });
  },
});
