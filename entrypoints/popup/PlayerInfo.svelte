<script lang="ts">
  interface PlayerData {
    playerName: string;
    server: string;
  }

  let { playerData }: { playerData: PlayerData } = $props();
</script>

<div class="player-info">
  <div class="username">{playerData.playerName}</div>
  <div class="server">{playerData.server}</div>
</div>

<style>
  .player-info {
    margin-bottom: 12px;
  }

  .username {
    font-size: 20px;
    font-weight: bold;
  }

  .server {
    font-size: 12px;
    color: var(--color-gray100);
  }
</style>
