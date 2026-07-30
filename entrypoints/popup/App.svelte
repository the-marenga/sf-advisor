<script lang="ts">
  import PlayerInfo from "./PlayerInfo.svelte";
  import Filters from "./Filters.svelte";
  import PlayerList from "./PlayerList.svelte";

  const STORAGE_KEY = "scrapbook_data";
  const MF_ENDPOINT = "https://mfbot-api.marenga.dev/scrapbook_advice";

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

  interface ScrapbookAdvice {
    player_name: string;
    new_count: string;
    level?: number;
    class?: string;
  }

  let playerData = $state<PlayerData | null>(null);
  let players = $state<ScrapbookAdvice[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Filter state
  let maxAttrs = $state<number | null>(null);
  let maxLevel = $state<number | null>(null);
  let selectedClasses = $state<string[]>([]);

  const CLASSES = [
    "Assassin", "Bard", "BattleMage", "Berserker",
    "DemonHunter", "Druid", "Mage", "Necromancer",
    "Paladin", "PlagueDoctor", "Scout", "Warrior",
  ] as const;

  async function loadData() {
    const res = await browser.storage.local.get(STORAGE_KEY);
    const data = res[STORAGE_KEY] as PlayerData | undefined;
    if (data) {
      playerData = data;
      maxAttrs = data.maxAttrsFilter ?? (data.attributes ? data.attributes : null);
      maxLevel = data.maxLevel ?? (data.level ? data.level + 5 : null);
      selectedClasses = data.classFilter ?? [];
    }
  }

  async function fetchAdvice() {
    if (!playerData?.scrapbook) return;
    loading = true;
    error = null;
    players = [];

    try {
      const body: Record<string, unknown> = {
        raw_scrapbook: playerData.scrapbook,
        server: playerData.server,
      };
      if (maxAttrs != null) body.max_attrs = maxAttrs;
      if (selectedClasses.length > 0) body.class_filter = selectedClasses;
      if (maxLevel != null) body.max_level = maxLevel;

      const startTime = Date.now();
      const res = await fetch(MF_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const duration = Date.now() - startTime;
      if (duration < 300) {
        await new Promise((resolve) => setTimeout(resolve, 300 - duration));
      }

      if (!res.ok) {
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      }

      players = (await res.json()) as ScrapbookAdvice[];
    } catch (err) {
      error = String(err);
    } finally {
      loading = false;
    }
  }

  async function saveFilters() {
    if (!playerData) return;
    playerData.maxAttrsFilter = maxAttrs;
    playerData.maxLevel = maxLevel;
    playerData.classFilter = selectedClasses.length > 0 ? selectedClasses : undefined;
    await browser.storage.local.set({ [STORAGE_KEY]: playerData });
  }

  function handleRefresh() {
    fetchAdvice();
  }

  function handleFilterChange(opts: { maxAttrs: number | null; maxLevel: number | null; selectedClasses: string[] }) {
    maxAttrs = opts.maxAttrs;
    maxLevel = opts.maxLevel;
    selectedClasses = opts.selectedClasses;
    saveFilters();
    fetchAdvice();
  }

  // On mount: load data and listen for live updates
  $effect(() => {
    loadData().then(() => fetchAdvice());
  });

  $effect(() => {
    // Re-fetch when scrapbook data changes externally
    const handler = (msg: { type?: string }) => {
      if (msg?.type === "NEW_SCRAPBOOK") {
        loadData().then(() => fetchAdvice());
      }
    };
    browser.runtime.onMessage.addListener(handler);
    return () => {
      browser.runtime.onMessage.removeListener(handler);
    };
  });
</script>

<h1>
  <span>S&F Advisor</span>
  <a href="https://ko-fi.com/J3J0ULD4J" target="_blank">
    <img
      height="28"
      style="border: 0; height: 28px"
      src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
      alt="Buy Me a Coffee at ko-fi.com"
    />
  </a>
</h1>

<div class="container">
  {#if playerData}
    <PlayerInfo {playerData} onRefresh={handleRefresh} />

    <Filters
      {maxAttrs}
      {maxLevel}
      {selectedClasses}
      classes={CLASSES}
      onFilterChange={handleFilterChange}
    />

    {#if playerData.scrapbook}
      <div class="list-header">
        <div class="name">Name</div>
        <div class="level">Lvl</div>
        <div class="class">Class</div>
        <div class="new-items">New Items</div>
      </div>

      <PlayerList {players} {loading} {error} />
    {:else}
      <div class="empty-state">
        <span class="material-icons-outlined empty-icon">menu_book</span>
        <p class="empty-title">No scrapbook data yet</p>
        <p class="empty-desc">Keep playing — the extension will capture your scrapbook data as soon as the game sends it.</p>
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <span class="material-icons-outlined empty-icon">travel_explore</span>
      <p class="empty-title">Welcome to S&amp;F Advisor!</p>
      <p class="empty-desc">
        Open
        <a href="https://sfgame.net" target="_blank" rel="noopener noreferrer">sfgame.net</a>,
        log in with your character, and play the game. The extension will detect your character automatically.
      </p>
    </div>
  {/if}
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    margin: 0;
    width: 420px;
    height: 600px;
    background-color: var(--color-gray600);
    color: var(--color-text);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :global(:root) {
    --color-gray100: #9e9eb1;
    --color-gray200: #848588;
    --color-gray300: #676678;
    --color-gray400: #31313c;
    --color-gray500: #282830;
    --color-gray600: #1c1c1f;
    --color-text: white;
    --color-yellow: #efbb49;
    --color-blue: #5383e8;
  }

  h1 {
    font-size: 18px;
    margin: 0;
    padding: 12px;
    background-color: var(--color-gray500);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .container {
    padding: 12px;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    padding: 5px 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-gray200);
    margin-bottom: 4px;
  }

  .list-header .name {
    flex: 1;
  }

  .list-header .level {
    width: 36px;
    text-align: center;
  }

  .list-header .class {
    width: 80px;
    text-align: center;
  }

  .list-header .new-items {
    width: 70px;
    text-align: center;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    gap: 8px;
  }

  .empty-icon {
    font-size: 48px !important;
    color: var(--color-gray300);
    margin-bottom: 8px;
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: var(--color-text);
  }

  .empty-desc {
    font-size: 13px;
    color: var(--color-gray100);
    margin: 0;
    max-width: 300px;
    line-height: 1.5;
  }

  .empty-desc a {
    color: var(--color-blue);
    text-decoration: none;
  }

  .empty-desc a:hover {
    text-decoration: underline;
  }
</style>
