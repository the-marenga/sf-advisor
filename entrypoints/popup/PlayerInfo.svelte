<script lang="ts">
  import { RefreshCw } from "@lucide/svelte";

  interface PlayerData {
    playerName: string;
    server: string;
    level: number;
  }

  let {
    playerData,
    onRefresh,
  }: {
    playerData: PlayerData;
    onRefresh: () => void;
  } = $props();
</script>

<div class="player-info">
  <div class="info-row">
    <div>
      <div class="username">{playerData.playerName}</div>
      <div class="server">{playerData.server}</div>
    </div>
    <button onclick={onRefresh}>
      <RefreshCw size={16} />
      Refresh
    </button>
  </div>
</div>

<style>
  .player-info {
    margin-bottom: 10px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .username {
    font-size: 18px;
    font-weight: bold;
  }

  .server {
    font-size: 11px;
    color: var(--color-gray100);
    word-break: break-all;
  }

  button {
    padding: 5px 10px;
    border: none;
    background-color: var(--color-blue);
    color: var(--color-text);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    flex-shrink: 0;
  }

  button:hover {
    background-color: #a9c2f5;
  }
</style>
