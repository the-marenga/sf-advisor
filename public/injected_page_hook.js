// injected_page_hook.js
// Runs in page context so it can intercept window.fetch and XMLHttpRequest responses.
// Posts captured responses to the content script via window.postMessage.

(function () {
  const ORIG = {
    fetch: window.fetch,
    XMLHttpRequest: window.XMLHttpRequest,
  };

  /**
   * @param {string} url
   * @param {string} body
   */
  function trySend(url, body) {
    try {
      window.postMessage(
        {
          source: "EXT_SF_PAGE_HOOK",
          url,
          body,
        },
        "*",
      );
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
        cloned
          .text()
          .then((text) => {
            try {
              const url = String(args[0]);
              if (/cmd.php/i.test(url)) {
                trySend(url.split("cmd.php")[0], text);
              }
            } catch (e) {
              console.warn(e);
            }
          })
          .catch(() => {});
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
      /** @type {string|null} */
      let url = null;
      /** @type {string|null} */
      let method = null;
      let _open = xhr.open;
      /**
       * @param {string} m
       * @param {string} u
       */
      xhr.open = function (m, u, ...rest) {
        method = m;
        url = u;
        return _open.call(this, m, u, ...rest);
      };
      xhr.addEventListener("load", function () {
        try {
          if (url && /cmd\.php/i.test(url)) {
            try {
              const text = xhr.responseText;
              trySend(url, text);
            } catch (e) {}
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
