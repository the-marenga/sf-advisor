// popup.js
const STORAGE_KEY = "scrapbook_items";
const listEl = document.getElementById("list");
const refreshBtn = document.getElementById("refresh");
const clearBtn = document.getElementById("clear");

function render() {
  chrome.storage.local.get(STORAGE_KEY).then(res => {
    const items = (res[STORAGE_KEY] || []);
    listEl.innerHTML = "";
    if (!items.length) {
      listEl.innerHTML = `<div class="no-items">No captured scrapbook responses yet.</div>`;
      return;
    }
    for (const it of items) {
      const div = document.createElement("div");
      div.className = "item";
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${new Date(it.capturedAt).toLocaleString()} — ${it.url}`;
      const origLabel = document.createElement("div");
      origLabel.style.fontWeight = "600";
      origLabel.style.marginTop = "6px";
      origLabel.textContent = "Original response:";
      const origPre = document.createElement("pre");
      origPre.textContent = it.original;
      const mfLabel = document.createElement("div");
      mfLabel.style.fontWeight = "600";
      mfLabel.style.marginTop = "6px";
      mfLabel.textContent = "mfbot.marenga.dev/advice response:";
      const mfPre = document.createElement("pre");
      try {
        mfPre.textContent = JSON.stringify(it.mfResponse, null, 2);
      } catch(e) {
        mfPre.textContent = String(it.mfResponse);
      }

      div.appendChild(meta);
      div.appendChild(origLabel);
      div.appendChild(origPre);
      div.appendChild(mfLabel);
      div.appendChild(mfPre);
      listEl.appendChild(div);
    }
  });
}

refreshBtn.addEventListener("click", render);
clearBtn.addEventListener("click", () => {
  chrome.storage.local.set({ [STORAGE_KEY]: [] }).then(render);
});

document.addEventListener("DOMContentLoaded", render);

// Listen for realtime updates from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "NEW_SCRAPBOOK_ITEM") {
    render();
  }
});
