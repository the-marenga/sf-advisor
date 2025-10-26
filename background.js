// background.js
const MF_ENDPOINT = "https://mfbot.marenga.dev/scrapbook_advice";

// Storage key for saved items
// @ts-ignore
const STORAGE_KEY = "scrapbook_data";

/**
 * @typedef {object} ScrapbookAdvice
 * @property {string} playerName The name of the player, that this advice was made for
 * @property {string} server The base url (https://f8...net) of the server,
 * that the player is playing on
 * @property {number} attributes The total amount of attributes the player has
 * @property {string|null} scrapbook the raw (encoded) scrapbook string. If the
 * player has not looked at that yet (i.e the game client has not requested
 * that yet), this will be null
 */


/**
 * @typedef {object} SFCaptureMessage
 * @property {"SF_CAPTURE"} type
 * @property {string} body The request body, that contains whatever the server sent back
 * @property {string} url The request url, that contains the endpoint
 * @property {chrome.webRequest.HttpHeader[]|null} headers
 */

// Handle messages from content script / injected page or filterResponseData collector
/**
 * @param {SFCaptureMessage} msg
 * @param {chrome.runtime.MessageSender} _
 */
chrome.runtime.onMessage.addListener((msg, _) => {
  if (!msg || msg.type !== "SF_CAPTURE") return;

  (async () => {
    try {
      const { url, body } = msg;
      if (typeof (body) != "string" || typeof (url) != "string") return;

      /** @type {Record<string, string>} */
      let kvs = {};
      for (const part of body.split("&")) {
        const [key, value] = part.split(":");
        if (!value) continue;

        kvs[key.split(".")[0]] = value;
      }

      console.log(JSON.stringify(Object.keys(kvs)));
      if ("ownplayersave" in kvs) {
        const attributes = kvs.ownplayersave.split("/").slice(30, 40).map(Number).reduce((a, b) => a + b, 0);        

        /** @type {ScrapbookAdvice|null} */
        const old = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY];
        if (!old) {
          if ("ownplayername" in kvs) {
            // Insert a fully new one 
            /** @type {ScrapbookAdvice} */
            const playerData = {
              playerName: kvs.ownplayername,
              server: url,
              attributes,
              scrapbook: null
            };
            await chrome.storage.local.set({ [STORAGE_KEY]: playerData });
          } else {
            console.warn("Could not init player data, we do not know the name")
          }
        } else {
          // we have an existing value. 
          old.attributes = attributes;
          if ("ownplayername" in kvs) {
            if (old.playerName != kvs.ownplayername || old.server != url) {
              old.scrapbook = null;
              old.playerName = kvs.ownplayername;
              old.server = url;
            }
          }
          await chrome.storage.local.set({ [STORAGE_KEY]: old });
        }
      }

      if ("scrapbook" in kvs) {
        /** @type {ScrapbookAdvice|null} */
        const stored = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY];

        if (!stored) {
          console.warn("captured scrapbook before player state");
          return
        };
        stored.scrapbook = kvs.scrapbook;
        await chrome.storage.local.set({ [STORAGE_KEY]: stored });
        chrome.runtime.sendMessage({ type: "NEW_SCRAPBOOK" });
        return;
      }
    } catch (err) {
      console.error("Error handling sf capture:", err);
    }
  })();

  // return true to indicate we may respond asynchronously (not used here)
  return false;
});