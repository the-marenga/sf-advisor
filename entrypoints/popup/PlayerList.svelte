<script lang="ts">
  import PlayerItem from "./PlayerItem.svelte";

  interface ScrapbookAdvice {
    player_name: string;
    new_count: string;
    level?: number;
    class?: string;
  }

  let {
    players,
    loading,
    error,
  }: {
    players: ScrapbookAdvice[];
    loading: boolean;
    error: string | null;
  } = $props();
</script>

<div id="list" class="list">
  {#if loading}
    <div class="spinner"></div>
  {:else if error}
    <div class="no-items">Error loading advice: {error}</div>
  {:else if players.length === 0}
    <div class="no-items">No player data</div>
  {:else}
    {#each players as player (player.player_name)}
      <PlayerItem {player} />
    {/each}
  {/if}
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    flex: 1;
  }

  .no-items {
    color: var(--color-gray200);
    font-size: 13px;
    padding: 12px;
    text-align: center;
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: var(--color-blue);
    animation: spin 1s ease infinite;
    margin: 20px auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
