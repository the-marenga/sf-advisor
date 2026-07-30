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
      console.warn("postMessage fail", e);
    }
  }

  // Hook fetch
  if (ORIG.fetch) {
    window.fetch = async function (...args) {
      // Check URL before touching the response body
      const url = String(args[0]);
      if (!/cmd\.php/i.test(url)) {
        return ORIG.fetch.apply(this, args);
      }

      try {
        const resp = await ORIG.fetch.apply(this, args);
        // clone response to be able to read body without interfering
        const cloned = resp.clone();
        cloned
          .text()
          .then((text) => {
            trySend(url.split("cmd.php")[0], text);
          })
          .catch((err) => {
            console.warn("Failed to read cloned fetch body", err);
          });
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
        if (!url) return;
        if (!/cmd\.php/i.test(url)) return;
        try {
          const text = xhr.responseText;
          trySend(url, text);
        } catch (e) {
          console.warn("XHR hook error", e);
        }
      });
      return xhr;
    }
    // Assign the original prototype so instanceof checks against XMLHttpRequest still pass.
    // NOTE: This breaks xhr.constructor, but no consumer in this extension relies on that.
    HookedXHR.prototype = ORIG.XMLHttpRequest.prototype;
    window.XMLHttpRequest = HookedXHR;
  })();
})();
