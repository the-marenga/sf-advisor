<script lang="ts">
  interface ScrapbookAdvice {
    player_name: string;
    new_count: string;
    level?: number;
    class?: string;
  }

  let { player }: { player: ScrapbookAdvice } = $props();

  let clicked = $state(false);

  function displayClass(cls: string | undefined): string {
    if (!cls) return "-";
    return cls.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(player.player_name).then(() => {
      clicked = true;
      setTimeout(() => {
        clicked = false;
      }, 500);
    }).catch((err) => {
      console.error("Failed to copy text: ", err);
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copyToClipboard();
    }
  }
</script>

<div class="item">
  <div class="name">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <i
      class="material-icons-outlined copy-icon"
      class:clicked
      title="Copy player name"
      role="button"
      tabindex="0"
      onclick={copyToClipboard}
      onkeydown={handleKeydown}
    >content_copy</i>
    <span class="player-name">{player.player_name}</span>
  </div>
  <div class="level">{player.level != null ? player.level : "-"}</div>
  <div class="class">{displayClass(player.class)}</div>
  <div class="new-items">{player.new_count}</div>
</div>

<style>
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 8px;
    background-color: var(--color-gray400);
    border-radius: 6px;
    transition: background-color 0.15s;
  }

  .item:hover {
    background-color: #383844;
  }

  .name {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .player-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }

  .level {
    width: 36px;
    text-align: center;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
  }

  .class {
    width: 80px;
    text-align: center;
    font-size: 11px;
    color: var(--color-text);
    background-color: var(--color-gray300);
    padding: 2px 4px;
    border-radius: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .new-items {
    width: 70px;
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-blue);
  }

  .copy-icon {
    cursor: pointer;
    font-size: 16px !important;
    color: var(--color-gray200);
    transition: color 0.15s;
    flex-shrink: 0;
  }

  .copy-icon:hover {
    color: var(--color-text);
  }

  .copy-icon.clicked {
    color: var(--color-yellow);
  }
</style>
