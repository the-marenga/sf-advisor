import { defineBackground } from "wxt/utils/define-background";
import type { PlayerData } from "../types/player-data";
import type { Browser } from "wxt/browser";

interface SFCaptureMessage {
  type: "SF_CAPTURE";
  body: string;
  url: string;
}

const STORAGE_KEY = "scrapbook_data";

// Serialize concurrent storage writes to prevent lost updates
let writeQueue = Promise.resolve();

function enqueue(fn: () => Promise<void>) {
  writeQueue = writeQueue.then(fn).catch((err) => console.error("Background write failed:", err));
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((msg: unknown, _sender: Browser.runtime.MessageSender) => {
    const data = msg as SFCaptureMessage;
    if (!data || data.type !== "SF_CAPTURE") return false;

    enqueue(async () => {
      try {
        const { url, body } = data;
        if (typeof body !== "string" || typeof url !== "string") return;

        const kvs: Record<string, string> = {};
        for (const part of body.split("&")) {
          const idx = part.indexOf(":");
          if (idx === -1) continue;
          const key = part.slice(0, idx);
          const value = part.slice(idx + 1);
          if (!key || !value) continue;
          kvs[key.split(".")[0]!] = value;
        }

        // The game API sends the player save data under "ownplayersavecharacter"
        if ("ownplayersavecharacter" in kvs) {
          const raw = kvs["ownplayersavecharacter"];
          if (!raw) return;
          const parts = raw.split("/");
          const attributes = parts
            .slice(30, 40)
            .map(Number)
            .reduce((a, b) => a + b, 0);
          const level = (Number(parts[3]) || 0) & 0xffff;

          const old = (await browser.storage.local.get(STORAGE_KEY))[STORAGE_KEY] as
            PlayerData | undefined;

          if (!old) {
            if ("ownplayername" in kvs) {
              const playerData: PlayerData = {
                playerName: kvs.ownplayername,
                server: url,
                level,
                attributes,
                scrapbook: null,
                maxAttrsFilter: null,
                maxLevel: null,
                classFilter: null,
              };
              await browser.storage.local.set({
                [STORAGE_KEY]: playerData,
              });
            } else {
              console.warn("Could not init player data, we do not know the name");
            }
          } else {
            if ("ownplayername" in kvs) {
              if (old.playerName !== kvs.ownplayername || old.server !== url) {
                old.scrapbook = null;
                old.playerName = kvs.ownplayername;
                old.server = url;
                old.level = level;
                old.attributes = attributes;
              }
            }
            await browser.storage.local.set({ [STORAGE_KEY]: old });
          }
        }

        if ("scrapbook" in kvs) {
          const stored = (await browser.storage.local.get(STORAGE_KEY))[STORAGE_KEY] as
            PlayerData | undefined;

          if (!stored) {
            console.warn("Captured scrapbook before player state");
            return;
          }
          if (stored.scrapbook !== kvs.scrapbook) {
            stored.scrapbook = kvs.scrapbook;
            await browser.storage.local.set({ [STORAGE_KEY]: stored });
            try {
              await browser.runtime.sendMessage({ type: "NEW_SCRAPBOOK" });
            } catch {
              // popup may not be open
            }
          }
        }
      } catch (err) {
        console.error("Error handling sf capture:", err);
      }
    });

    return false;
  });
});
