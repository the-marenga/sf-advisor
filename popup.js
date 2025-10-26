// @ts-ignore
const STORAGE_KEY = "scrapbook_data";
// @ts-ignore
/** @type {HTMLElement} */
// @ts-ignore
const listEl = document.getElementById("list");
/** @type {HTMLButtonElement} */
// @ts-ignore
const refreshBtn = document.getElementById("refresh");
/** @type {HTMLButtonElement} */
// @ts-ignore
const clearBtn = document.getElementById("clear");

// background.js
const MF_ENDPOINT = "https://mfbot-api.marenga.dev/scrapbook_advice";

/**
 * @param {string} scrapbook
 * @param {string} server
 * @param {number} max_attrs
 * @returns {Promise<{ok: true, players: ScrapbookAdvice[]} | {ok: false, error: string}>}
 */
async function getBestEnemies(scrapbook, server, max_attrs) {
  try {
    const res = await fetch(MF_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_scrapbook: scrapbook, server, max_attrs })
    });
    const json = await res.json();
    return { ok: true, players: json };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * @typedef {object} ScrapbookAdvice
 * @property {string} player_name
 * @property {string} new_count
 */

function render() {
  chrome.storage.local.get(STORAGE_KEY).then(res => {
    /** @type {PlayerData|null} */
    const advice = res[STORAGE_KEY];


    listEl.innerHTML = "";
    if (!advice) {
      listEl.innerHTML = `<div class="no-items">No player data</div>`;
      return;
    }
    if (!advice.scrapbook) {
      listEl.innerHTML = `<div class="no-items">No scrapbook data</div>`;
      return;
    }
    listEl.innerHTML = `<div class="no-items">Loading...</div>`;

    getBestEnemies(advice.scrapbook, advice.server, advice.attributes).then(a => {
      listEl.innerHTML = "";
      if (a.ok ){
        for (const player of a.players) {
          const div = document.createElement("div");
          div.className = "item";
          const meta = document.createElement("div");
          meta.className = "meta";
          meta.textContent = player.new_count;
          const origLabel = document.createElement("div");
          origLabel.style.fontWeight = "600";
          origLabel.style.marginTop = "6px";
          origLabel.textContent = "Name:";
          const origPre = document.createElement("pre");
          origPre.textContent = player.player_name;

          div.appendChild(meta);
          div.appendChild(origLabel);
          div.appendChild(origPre);
          listEl.appendChild(div);
        }
      } else {
        listEl.innerHTML = `<div class="no-items">Error loading advice: ${a.error}</div>`;
      }
    });
  });
}

refreshBtn.addEventListener("click", render);

document.addEventListener("DOMContentLoaded", render);

// Listen for realtime updates from background
/**
 * @param {{type: "NEW_SCRAPBOOK_ITEM"}} msg
 */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "NEW_SCRAPBOOK") {
    render();
  }
});
