// @ts-ignore
const STORAGE_KEY = "scrapbook_data";
// @ts-ignore
/** @type {HTMLElement} */
// @ts-ignore
const listEl = document.getElementById("list");
/** @type {HTMLElement} */
// @ts-ignore
const playerInfoEl = document.getElementById("player-info");
/** @type {HTMLButtonElement} */
// @ts-ignore
const refreshBtn = document.getElementById("refresh");
/** @type {HTMLInputElement} */
// @ts-ignore
const maxAttrsInput = document.getElementById("max-attrs");

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
    const startTime = Date.now();
    const res = await fetch(MF_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_scrapbook: scrapbook, server, max_attrs })
    });
    const duration = Date.now() - startTime;
    if (duration < 300) {
      // Requests can be so fast, that it is hard to tell, when this is 
      // actually fetched otherwise
      await new Promise(resolve => setTimeout(resolve, 300 - duration));
    }
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

/**
 * @param {string} text
 * @param {HTMLElement} element
 */
function copyToClipboard(text, element) {
  navigator.clipboard.writeText(text).then(() => {
    element.classList.add("clicked");
    setTimeout(() => {
      element.classList.remove("clicked");
    }, 500);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

function render() {
  chrome.storage.local.get(STORAGE_KEY).then(res => {
    /** @type {PlayerData|null} */
    const advice = res[STORAGE_KEY];
    listEl.innerHTML = "";
    playerInfoEl.innerHTML = "";

    
    if (!advice) {
      listEl.innerHTML = `<div class="no-items">No player data</div>`;
      return;
    }
    maxAttrsInput.value = "" + advice.attributes;

    if (advice.playerName && advice.server) {
      const usernameDiv = document.createElement("div");
      usernameDiv.className = "username";
      usernameDiv.textContent = advice.playerName;
      const serverDiv = document.createElement("div");
      serverDiv.className = "server";
      serverDiv.textContent = advice.server;
      playerInfoEl.appendChild(usernameDiv);
      playerInfoEl.appendChild(serverDiv);
    }

    if (!advice.scrapbook) {
      listEl.innerHTML = `<div class="no-items">No scrapbook data</div>`;
      return;
    }

    listEl.innerHTML = `<div class="spinner"></div>`;

    getBestEnemies(advice.scrapbook, advice.server, advice.attributes).then(a => {
      listEl.innerHTML = "";
      if (a.ok) {
        for (const player of a.players) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";

          const nameDiv = document.createElement("div");
          nameDiv.className = "name";

          const copyIcon = document.createElement("i");
          copyIcon.className = "material-icons-outlined copy-icon";
          copyIcon.textContent = "content_copy";
          copyIcon.title = "Copy player name";
          copyIcon.addEventListener("click", () => copyToClipboard(player.player_name, copyIcon));
          nameDiv.appendChild(copyIcon);

          const nameSpan = document.createElement("span");
          nameSpan.textContent = player.player_name;
          nameDiv.appendChild(nameSpan);

          const newItemsDiv = document.createElement("div");
          newItemsDiv.className = "new-items";
          newItemsDiv.textContent = player.new_count;

          itemDiv.appendChild(nameDiv);
          itemDiv.appendChild(newItemsDiv);
          listEl.appendChild(itemDiv);
        }
      } else {
        listEl.innerHTML = `<div class="no-items">Error loading advice: ${a.error}</div>`;
      }
    });
  });
}

refreshBtn.addEventListener("click", render);

document.addEventListener("DOMContentLoaded", render);

maxAttrsInput.addEventListener("input", () => {
  const maxAtrs = parseInt(maxAttrsInput.value, 10);
  if (!isNaN(maxAtrs)) {
    chrome.storage.local.get(STORAGE_KEY, (res) => {
      const advice = res[STORAGE_KEY] || {};
      advice.attributes = maxAtrs;
      chrome.storage.local.set({ [STORAGE_KEY]: advice });
    });
  }
});

// Listen for realtime updates from background
/**
 * @param {{type: "NEW_SCRAPBOOK"}} msg
 */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "NEW_SCRAPBOOK") {
    render();
  }
});
