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

/**
 * @param {string} scrapbook
 * @param {string} server
 * @param {number} max_attrs
 * @returns {Promise<{ok: true, json: any} | {ok: false, error: string}>}
 */
async function getBestEnemies(scrapbook, server, max_attrs) {
  try {
    const res = await fetch(MF_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_scrapbook: scrapbook, server, max_attrs })
    });
    const json = await res.json();
    return { ok: true, json };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function render() {
  chrome.storage.local.get(STORAGE_KEY).then(res => {
    /** @type {ScrapbookAdvice|null} */
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
      if (a.ok ){
        listEl.innerHTML = JSON.stringify(a.json);
      }else {
        listEl.innerHTML = `<div class="no-items">Error loading advice</div>`;
      }
    });
    

    // for (const it of items) {
    //   const div = document.createElement("div");
    //   div.className = "item";
    //   const meta = document.createElement("div");
    //   meta.className = "meta";
    //   meta.textContent = `${new Date(it.capturedAt).toLocaleString()} — ${it.url}`;
    //   const origLabel = document.createElement("div");
    //   origLabel.style.fontWeight = "600";
    //   origLabel.style.marginTop = "6px";
    //   origLabel.textContent = "Original response:";
    //   const origPre = document.createElement("pre");
    //   origPre.textContent = it.original;
    //   const mfLabel = document.createElement("div");
    //   mfLabel.style.fontWeight = "600";
    //   mfLabel.style.marginTop = "6px";
    //   mfLabel.textContent = "mfbot.marenga.dev/advice response:";
    //   const mfPre = document.createElement("pre");
    //   try {
    //     mfPre.textContent = JSON.stringify(it.mfResponse, null, 2);
    //   } catch(e) {
    //     mfPre.textContent = String(it.mfResponse);
    //   }

    //   div.appendChild(meta);
    //   div.appendChild(origLabel);
    //   div.appendChild(origPre);
    //   div.appendChild(mfLabel);
    //   div.appendChild(mfPre);
    //   listEl.appendChild(div);
    // }
  });
}

refreshBtn.addEventListener("click", render);
clearBtn.addEventListener("click", () => {
  chrome.storage.local.set({ [STORAGE_KEY]: [] }).then(render);
});

document.addEventListener("DOMContentLoaded", render);

// Listen for realtime updates from background
/**
 * @param {{type: "NEW_SCRAPBOOK_ITEM"}} msg
 */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "NEW_SCRAPBOOK_ITEM") {
    render();
  }
});
