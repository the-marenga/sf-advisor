// background.js
const TARGET_HOST_REGEX = /(?:https?:\/\/)?(?:.*\.)?sfgame\.net\/cmd\.php/i;
const MF_ENDPOINT = "https://mfbot.marenga.dev/scrapbook_advice";

// Storage key for saved items
const STORAGE_KEY = "scrapbook_items";

// helper: save item to storage and notify popup(s)
async function saveAndNotify(item) {
  const { id, url } = item;
  const stored = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY] || [];
  stored.unshift(item);
  // keep only latest 100
  const truncated = stored.slice(0, 100);
  await chrome.storage.local.set({ [STORAGE_KEY]: truncated });
  chrome.runtime.sendMessage({ type: "NEW_SCRAPBOOK_ITEM", item });
}

async function postToMfBot(originalResponse) {
  try {
    const res = await fetch(MF_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: originalResponse })
    });
    const json = await res.json();
    return { ok: true, json };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// Handle messages from content script / injected page or filterResponseData collector
chrome.runtime.onMessage.addListener((msg, _) => {
  if (!msg || msg.type !== "SCRAPBOOK_CAPTURE") return;

  (async () => {
    try {
      const { url, body, method, headers } = msg;
      if (!url || !body) return;
      if (!TARGET_HOST_REGEX.test(url)) return;

      // Only handle requests that match `.*scrapbook.*` per req
      const match = /scrapbook/i;
      if (!match.test(url)) return;

      const id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,8);
      const original = typeof body === "string" ? body : JSON.stringify(body);

      // send to mfbot
      const mfResp = await postToMfBot(original);

      const item = {
        id,
        url,
        capturedAt: new Date().toISOString(),
        original: original,
        mfResponse: mfResp.ok ? mfResp.json : { error: mfResp.error || "unknown" }
      };

      await saveAndNotify(item);
    } catch (err) {
      console.error("Error handling SCRAPBOOK_CAPTURE:", err);
    }
  })();

  // return true to indicate we may respond asynchronously (not used here)
  return false;
});

// --- Firefox: try to use webRequest.filterResponseData when available ---
// We'll attempt to set a listener if the API exists
if (chrome.webRequest && typeof chrome.webRequest.filterResponseData === "function") {
  try {
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        // create a stream filter for this request
        try {
          const filter = chrome.webRequest.filterResponseData(details.requestId);
          const decoder = new TextDecoder("utf-8");
          const encoder = new TextEncoder();
          let chunks = [];

          filter.ondata = (event) => {
            chunks.push(new Uint8Array(event.data));
            // pass through unchanged
            filter.write(event.data);
          };
          filter.onstop = async () => {
            try {
              // concatenate chunks
              let totalLen = chunks.reduce((s, c) => s + c.length, 0);
              let merged = new Uint8Array(totalLen);
              let offset = 0;
              for (const c of chunks) {
                merged.set(c, offset);
                offset += c.length;
              }
              let text = decoder.decode(merged);
              // Only forward if URL matches scrapbook
              if (/scrapbook/i.test(details.url)) {
                chrome.runtime.sendMessage({
                  type: "SCRAPBOOK_CAPTURE",
                  url: details.url,
                  body: text,
                  method: details.method,
                  headers: details.requestHeaders || null
                });
              }
            } catch (err) {
              console.error("filterResponseData onstop error:", err);
            } finally {
              filter.disconnect();
            }
          };
          filter.onerror = (e) => {
            console.warn("filter error", e);
            try { filter.disconnect(); } catch(e){}
          };
        } catch (err) {
          console.warn("filterResponseData create failed:", err);
        }
        return {};
      },
      { urls: ["*://*.sfgame.net/*"] },
      ["blocking"]
    );
  } catch (e) {
    // API may be unavailable in Chrome; ignore
    console.info("filterResponseData listener could not be established:", e);
  }
}
