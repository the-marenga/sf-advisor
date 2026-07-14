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
/** @type {HTMLInputElement} */
// @ts-ignore
const maxLevelInput = document.getElementById("max-level");
/** @type {NodeListOf<HTMLInputElement>} */
// @ts-ignore
const classCheckboxes = document.querySelectorAll(".class-filter input[type='checkbox']");

/**
 * @returns {string[]}
 */
function getSelectedClasses() {
  /** @type {string[]} */
  const selected = [];
  classCheckboxes.forEach(cb => {
    if (cb.checked) selected.push(cb.value);
  });
  return selected;
}

/**
 * @param {string[]} classes
 */
function setSelectedClasses(classes) {
  classCheckboxes.forEach(cb => {
    cb.checked = classes.includes(cb.value);
  });
}

// background.js
const MF_ENDPOINT = "https://mfbot-api.marenga.dev/scrapbook_advice";

/**
 * @param {string} scrapbook
 * @param {string} server
 * @param {number|null} max_attrs
 * @param {string[]|null} class_filter
 * @param {number|null} max_level
 * @returns {Promise<{ok: true, players: ScrapbookAdvice[]} | {ok: false, error: string}>}
 */
async function getBestEnemies(scrapbook, server, max_attrs, class_filter, max_level) {
  try {
    const startTime = Date.now();
    /** @type {Record<string, any>} */
    const body = { raw_scrapbook: scrapbook, server };
    if (max_attrs != null) {
      body.max_attrs = max_attrs;
    }
    if (class_filter && class_filter.length > 0) {
      body.class_filter = class_filter;
    }
    if (max_level != null) {
      body.max_level = max_level;
    }
    const res = await fetch(MF_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
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
 * @property {number} [level]
 * @property {string} [class]
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
  browser.storage.local.get(STORAGE_KEY).then(res => {
    /** @type {PlayerData|null} */
    const advice = res[STORAGE_KEY];
    listEl.innerHTML = "";
    playerInfoEl.innerHTML = "";

    
    if (!advice) {
      listEl.innerHTML = `<div class="no-items">No player data</div>`;
      return;
    }
    maxAttrsInput.value = advice.maxAttrsFilter != null ? "" + advice.maxAttrsFilter : "";
    maxLevelInput.value = advice.maxLevel != null ? "" + advice.maxLevel : "";
    if (advice.classFilter) {
      setSelectedClasses(advice.classFilter);
    }

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

    const maxAttrs = maxAttrsInput.value ? parseInt(maxAttrsInput.value, 10) : null;
    const classFilter = getSelectedClasses();
    const maxLevel = maxLevelInput.value ? parseInt(maxLevelInput.value, 10) : null;
    getBestEnemies(advice.scrapbook, advice.server, maxAttrs, classFilter.length > 0 ? classFilter : null, maxLevel).then(a => {
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

          const levelDiv = document.createElement("div");
          levelDiv.className = "level";
          levelDiv.textContent = player.level != null ? "" + player.level : "-";

          const classDiv = document.createElement("div");
          classDiv.className = "class";
          classDiv.textContent = player.class || "-";

          const newItemsDiv = document.createElement("div");
          newItemsDiv.className = "new-items";
          newItemsDiv.textContent = player.new_count;

          itemDiv.appendChild(nameDiv);
          itemDiv.appendChild(levelDiv);
          itemDiv.appendChild(classDiv);
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

function saveFilters() {
  const maxAttrs = maxAttrsInput.value ? parseInt(maxAttrsInput.value, 10) : null;
  const maxLevel = maxLevelInput.value ? parseInt(maxLevelInput.value, 10) : null;
  const classFilter = getSelectedClasses();
  browser.storage.local.get(STORAGE_KEY, (res) => {
    const advice = res[STORAGE_KEY] || {};
    advice.maxAttrsFilter = maxAttrs;
    advice.maxLevel = maxLevel;
    advice.classFilter = classFilter.length > 0 ? classFilter : undefined;
    browser.storage.local.set({ [STORAGE_KEY]: advice });
  });
}

maxAttrsInput.addEventListener("input", saveFilters);
maxLevelInput.addEventListener("input", saveFilters);
classCheckboxes.forEach(cb => cb.addEventListener("change", saveFilters));

// Listen for realtime updates from background
/**
 * @param {{type: "NEW_SCRAPBOOK"}} msg
 */
browser.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "NEW_SCRAPBOOK") {
    render();
  }
});
