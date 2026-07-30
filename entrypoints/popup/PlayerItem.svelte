<script lang="ts">
  interface ScrapbookAdvice {
    player_name: string;
    new_count: string;
    level?: number;
    class?: string;
  }

  let { player }: { player: ScrapbookAdvice } = $props();

  let clicked = $state(false);

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
  <div class="class">{player.class ? player.class : "-"}</div>
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
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .player-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .level {
    width: 36px;
    text-align: center;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: var(--color-gray100);
  }

  .class {
    width: 72px;
    text-align: center;
    font-size: 11px;
    text-transform: capitalize;
    color: var(--color-gray100);
    background-color: var(--color-gray600);
    padding: 2px 6px;
    border-radius: 10px;
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
