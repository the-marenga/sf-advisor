# <img src="https://github.com/user-attachments/assets/cdab1bd0-f080-4c80-bbba-78a8c4947057" width="75" alt="Logo">  S&F Advisor
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT) [<img src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' height='20'>](https://ko-fi.com/J3J0ULD4J) 
<a href="https://chromewebstore.google.com/detail/sf-advisor/ochfmlpkkclpfmchdoademhenaobplbi">
  <img src="https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png" 
       alt="Available in the Chrome Web Store" 
       height="20px" /> 
</a>
<a href="https://addons.mozilla.org/de/firefox/addon/sf-advisor/">
  <img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg"
       alt="Get the Add-on for Firefox"
       height="20px" />
</a>

Looks at the scrapbook of your Shakes and Fidget character and finds the best players to attack for items, that you have not found yet. 
The list of players to attack will be fetched from an online database whenever your scrapbook updates and does not require any manual searching through the Hall of Fame. 
You can just login your character, open the extension and copy the name of the best players within seconds

![preview](https://github.com/user-attachments/assets/b9b2a3a0-1cf0-415c-ae41-bbf752297923)

## Development

Built with [WXT](https://wxt.dev/) + [Svelte 5](https://svelte.dev/).

```bash
# Install dependencies
npm install

# Development (with HMR)
npm run dev          # Chrome
npm run dev:firefox  # Firefox

# Build for production
npm run build:chrome
npm run build:firefox

# Create distributable zip files
npm run zip:chrome
npm run zip:firefox
```

## Project structure

```
src/
├── entrypoints/
│   ├── background.ts         # Service worker / background script
│   ├── content.ts            # Content script (injects page hook)
│   └── popup/                # Popup UI (Svelte)
│       ├── index.html
│       ├── main.ts
│       ├── App.svelte
│       ├── PlayerInfo.svelte
│       ├── Filters.svelte
│       ├── PlayerList.svelte
│       └── PlayerItem.svelte
├── public/
│   ├── icons/                # Extension icons
│   └── injected_page_hook.js # Page-level script (runs in page context)
├── wxt.config.ts
├── tsconfig.json
└── package.json
```

## License

MIT — 2025

<a href="https://chromewebstore.google.com/detail/sf-advisor/ochfmlpkkclpfmchdoademhenaobplbi">
  <img src="https://developer.chrome.com/static/docs/webstore/branding/image/HRs9MPufa1J1h5glNhut.png" 
       alt="Available in the Chrome Web Store" 
      height="80px" />
</a>
<a href="https://addons.mozilla.org/de/firefox/addon/sf-advisor/">
  <img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg"
       alt="Get the Add-on for Firefox"
       height="80px" />
</a>
