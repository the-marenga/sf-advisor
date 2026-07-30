import { defineBackground } from "wxt/utils/define-background";

interface PlayerData {
  playerName: string;
  server: string;
  level: number;
  attributes: number;
  scrapbook: string | null;
  maxAttrsFilter?: number | null;
  maxLevel?: number | null;
  classFilter?: string[] | undefined;
}

interface SFCaptureMessage {
  type: "SF_CAPTURE";
  body: string;
  url: string;
}

const STORAGE_KEY = "scrapbook_data";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (msg: unknown, _sender: unknown) => {
      const data = msg as SFCaptureMessage;
      if (!data || data.type !== "SF_CAPTURE") return false;

      (async () => {
        try {
          const { url, body } = data;
          if (typeof body !== "string" || typeof url !== "string") return;

          const kvs: Record<string, string> = {};
          for (const part of body.split("&")) {
            const [key, value] = part.split(":");
            if (!value) continue;
            kvs[key.split(".")[0]] = value;
          }

          // The game API renamed "ownplayersave" to "ownplayersavecharacter"; support both
          const ownplayersaveKey =
            ["ownplayersavecharacter", "ownplayersave"].find(
              (k) => k in kvs,
            ) ?? null;
          if (ownplayersaveKey) {
            const parts = kvs[ownplayersaveKey].split("/");
            const attributes = parts.slice(30, 40).map(Number).reduce((a, b) => a + b, 0);
            const level = (Number(parts[3]) || 0) & 0xffff;

            const old = (
              await browser.storage.local.get(STORAGE_KEY)
            )[STORAGE_KEY] as PlayerData | undefined;

            if (!old) {
              if ("ownplayername" in kvs) {
                const playerData: PlayerData = {
                  playerName: kvs.ownplayername,
                  server: url,
                  level,
                  attributes,
                  scrapbook: null,
                };
                await browser.storage.local.set({
                  [STORAGE_KEY]: playerData,
                });
              } else {
                console.warn(
                  "Could not init player data, we do not know the name",
                );
              }
            } else {
              if ("ownplayername" in kvs) {
                if (
                  old.playerName !== kvs.ownplayername ||
                  old.server !== url
                ) {
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
            const stored = (
              await browser.storage.local.get(STORAGE_KEY)
            )[STORAGE_KEY] as PlayerData | undefined;

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
      })();

      return false;
    },
  );
});
