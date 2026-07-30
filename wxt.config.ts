import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-svelte"],
  manifest: {
    name: "S&F Advisor",
    version: "1.2",
    description:
      "Helps you fill the scrapbook in Shakes and Fidget by showing you the players with the most items, that you have not found yet",
    permissions: ["storage"],
    host_permissions: ["*://sfgame.net/*", "*://*.sfgame.net/*", "https://mfbot-api.marenga.dev/*"],
    web_accessible_resources: [
      {
        resources: ["injected_page_hook.js"],
        matches: ["*://sfgame.net/*", "*://*.sfgame.net/*"],
      },
    ],
    icons: {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    },
    browser_specific_settings: {
      gecko: {
        id: "@sf-advisor.marenga",
      },
    },
  },
  manifestVersion: 3,
  suppressWarnings: {
    firefoxDataCollection: true,
  },
});
