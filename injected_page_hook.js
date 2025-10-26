// injected_page_hook.js
// Runs in page context so it can intercept window.fetch and XMLHttpRequest responses.
// Posts captured responses to the content script via window.postMessage.

(function () {
  const ORIG = {
    fetch: window.fetch,
    XMLHttpRequest: window.XMLHttpRequest
  };

  function trySend(url, body, method = "GET", headers = null) {
    try {
      window.postMessage({
        source: "EXT_SCRAPBOOK_PAGE_HOOK",
        url,
        body,
        method,
        headers
      }, "*");
    } catch (e) {
      // ignore
      console.warn("postMessage fail", e);
    }
  }

  // Hook fetch
  if (ORIG.fetch) {
    window.fetch = async function (...args) {
      try {
        const resp = await ORIG.fetch.apply(this, args);
        // clone response to be able to read body without interfering
        const cloned = resp.clone();

        // read text if response seems textual or application/json
        cloned.text().then(text => {
          try {
            if (/scrapbook/i.test(String(args[0]) || "")) {
              trySend(String(args[0]), text, (args[1] && args[1].method) || "GET", (args[1] && args[1].headers) || null);
            } else {
              // also attempt to detect 'scrapbook' within url of response (resp.url)
              if (/scrapbook/i.test(cloned.url || "")) {
                trySend(cloned.url, text, (args[1] && args[1].method) || "GET", (args[1] && args[1].headers) || null);
              }
            }
          } catch(e){console.warn(e)}
        }).catch(()=>{});
        return resp;
      } catch (err) {
        // if fetch failed, propagate
        throw err;
      }
    };
  }

  // Hook XHR
  (function () {
    function HookedXHR() {
      const xhr = new ORIG.XMLHttpRequest();
      let url = null;
      let method = null;
      let _open = xhr.open;
      xhr.open = function (m, u, ...rest) {
        method = m;
        url = u;
        return _open.call(this, m, u, ...rest);
      };
      xhr.addEventListener("load", function () {
        try {
          if (url && /scrapbook/i.test(url)) {
            let ct = xhr.getResponseHeader && xhr.getResponseHeader("content-type");
            // Only try to capture text-like responses
            let text;
            try { text = xhr.responseText; } catch(e) { text = null; }
            trySend(url, text, method, ct);
          }
        } catch (e) {
          console.warn("XHR hook error", e);
        }
      });
      return xhr;
    }
    // copy prototype so instanceOf checks still pass somewhat
    HookedXHR.prototype = ORIG.XMLHttpRequest.prototype;
    window.XMLHttpRequest = HookedXHR;
  })();

})();
