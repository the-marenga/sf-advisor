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
    <span>{player.player_name}</span>
  </div>
  <div class="level">{player.level != null ? player.level : "-"}</div>
  <div class="class">{player.class || "-"}</div>
  <div class="new-items">{player.new_count}</div>
</div>

<style>
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background-color: var(--color-gray400);
    border-radius: 6px;
  }

  .name {
    flex: 1;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .level {
    width: 50px;
    text-align: center;
    font-size: 13px;
  }

  .class {
    width: 70px;
    text-align: center;
    font-size: 13px;
    text-transform: capitalize;
  }

  .new-items {
    width: 100px;
    text-align: center;
  }

  .copy-icon {
    cursor: pointer;
    font-size: 18px !important;
  }

  .copy-icon.clicked {
    color: var(--color-yellow);
  }
</style>
