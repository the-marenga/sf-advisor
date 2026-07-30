<script lang="ts">
  let {
    maxAttrs,
    maxLevel,
    selectedClasses,
    classes,
    onRefresh,
    onFilterChange,
  }: {
    maxAttrs: number | null;
    maxLevel: number | null;
    selectedClasses: string[];
    classes: readonly string[];
    onRefresh: () => void;
    onFilterChange: (opts: {
      maxAttrs: number | null;
      maxLevel: number | null;
      selectedClasses: string[];
    }) => void;
  } = $props();

  let maxAttrsValue = $state(maxAttrs?.toString() ?? "");
  let maxLevelValue = $state(maxLevel?.toString() ?? "");

  // Sync from props when they change externally
  $effect(() => {
    maxAttrsValue = maxAttrs?.toString() ?? "";
  });
  $effect(() => {
    maxLevelValue = maxLevel?.toString() ?? "";
  });

  function emitChange() {
    onFilterChange({
      maxAttrs: maxAttrsValue ? parseInt(maxAttrsValue, 10) : null,
      maxLevel: maxLevelValue ? parseInt(maxLevelValue, 10) : null,
      selectedClasses,
    });
  }

  function handleClassToggle(cls: string) {
    const idx = selectedClasses.indexOf(cls);
    const updated = idx === -1
      ? [...selectedClasses, cls]
      : selectedClasses.filter((c) => c !== cls);
    onFilterChange({
      maxAttrs: maxAttrsValue ? parseInt(maxAttrsValue, 10) : null,
      maxLevel: maxLevelValue ? parseInt(maxLevelValue, 10) : null,
      selectedClasses: updated,
    });
  }
</script>

<div class="controls">
  <div class="attributes">
    <label for="max-attrs">Max Attributes</label>
    <input
      id="max-attrs"
      type="number"
      bind:value={maxAttrsValue}
      oninput={emitChange}
    />
    <i
      class="material-icons-outlined help-icon"
      title="Only consider enemies, that have at most this many total attributes (The sum of strength, dexterity, etc.)"
    >help_outline</i>
  </div>
  <button onclick={onRefresh}>
    <i class="material-icons-outlined refresh-icon">refresh</i>
    Refresh
  </button>
</div>

<div class="filters-row">
  <div class="level">
    <label for="max-level">Max Level</label>
    <input
      id="max-level"
      type="number"
      bind:value={maxLevelValue}
      oninput={emitChange}
    />
    <i
      class="material-icons-outlined help-icon"
      title="Only consider enemies at or below this level"
    >help_outline</i>
  </div>

  {#each classes as cls}
    <div class="class-filter">
      <input
        type="checkbox"
        id="class-{cls.toLowerCase()}"
        checked={selectedClasses.includes(cls)}
        onchange={() => handleClassToggle(cls)}
      />
      <label for="class-{cls.toLowerCase()}">
        {cls === "BattleMage" ? "Battle Mage"
          : cls === "DemonHunter" ? "Demon Hunter"
          : cls === "PlagueDoctor" ? "Plague Doctor"
          : cls}
      </label>
    </div>
  {/each}
</div>

<style>
  .controls {
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  .attributes {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .attributes label,
  .level label,
  .class-filter label {
    font-size: 14px;
  }

  .attributes input,
  .level input {
    width: 60px;
    padding: 4px;
    border-radius: 4px;
    border: 1px solid var(--color-gray300);
    background-color: var(--color-gray400);
    color: var(--color-text);
  }

  .filters-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-bottom: 12px;
    align-items: center;
  }

  .filters-row .class-filter {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .filters-row .class-filter label {
    font-size: 13px;
    cursor: pointer;
  }

  .filters-row .class-filter input[type="checkbox"] {
    accent-color: var(--color-blue);
    cursor: pointer;
  }

  button {
    padding: 6px 12px;
    border: none;
    background-color: var(--color-blue);
    color: var(--color-text);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button:hover {
    background-color: #a9c2f5;
  }

  .help-icon {
    cursor: help;
    font-size: 18px !important;
  }

  .refresh-icon {
    font-size: 18px !important;
  }
</style>
