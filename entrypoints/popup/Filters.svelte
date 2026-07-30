<script lang="ts">
  let {
    maxAttrs,
    maxLevel,
    selectedClasses,
    classes,
    onFilterChange,
  }: {
    maxAttrs: number | null;
    maxLevel: number | null;
    selectedClasses: string[];
    classes: readonly string[];
    onFilterChange: (opts: {
      maxAttrs: number | null;
      maxLevel: number | null;
      selectedClasses: string[];
    }) => void;
  } = $props();

  let maxAttrsValue = $state(maxAttrs?.toString() ?? "");
  let maxLevelValue = $state(maxLevel?.toString() ?? "");
  let showClasses = $state(false);

  // Sync input values from props (when parent changes them)
  $effect(() => {
    if (maxAttrs != null) maxAttrsValue = maxAttrs.toString();
  });
  $effect(() => {
    if (maxLevel != null) maxLevelValue = maxLevel.toString();
  });

  const attrsEnabled = $derived(maxAttrs != null);
  const levelEnabled = $derived(maxLevel != null);

  function emitChange() {
    onFilterChange({
      maxAttrs: attrsEnabled && maxAttrsValue ? parseInt(maxAttrsValue, 10) : null,
      maxLevel: levelEnabled && maxLevelValue ? parseInt(maxLevelValue, 10) : null,
      selectedClasses,
    });
  }

  function clampInput() {
    if (!maxAttrsValue || isNaN(Number(maxAttrsValue))) {
      maxAttrsValue = "0";
    }
    if (!maxLevelValue || isNaN(Number(maxLevelValue))) {
      maxLevelValue = "0";
    }
    emitChange();
  }

  function toggleAttrs() {
    if (!maxAttrsValue || isNaN(Number(maxAttrsValue))) {
      maxAttrsValue = "0";
    }
    onFilterChange({
      maxAttrs: attrsEnabled ? null : parseInt(maxAttrsValue, 10),
      maxLevel: levelEnabled && maxLevelValue ? parseInt(maxLevelValue, 10) : null,
      selectedClasses,
    });
  }

  function toggleLevel() {
    if (!maxLevelValue || isNaN(Number(maxLevelValue))) {
      maxLevelValue = "0";
    }
    onFilterChange({
      maxAttrs: attrsEnabled && maxAttrsValue ? parseInt(maxAttrsValue, 10) : null,
      maxLevel: levelEnabled ? null : parseInt(maxLevelValue, 10),
      selectedClasses,
    });
  }

  function handleClassToggle(cls: string) {
    const idx = selectedClasses.indexOf(cls);
    const updated = idx === -1
      ? [...selectedClasses, cls]
      : selectedClasses.filter((c) => c !== cls);
    onFilterChange({
      maxAttrs: attrsEnabled && maxAttrsValue ? parseInt(maxAttrsValue, 10) : null,
      maxLevel: levelEnabled && maxLevelValue ? parseInt(maxLevelValue, 10) : null,
      selectedClasses: updated,
    });
  }

  function labelFor(cls: string): string {
    switch (cls) {
      case "BattleMage": return "Battle Mage";
      case "DemonHunter": return "Demon Hunter";
      case "PlagueDoctor": return "Plague Doctor";
      default: return cls;
    }
  }

  const selectedCount = $derived(selectedClasses.length);
</script>

<div class="filters-column">
  <div class="filter-row">
    <input
      type="checkbox"
      id="chk-level"
      checked={levelEnabled}
      onchange={toggleLevel}
    />
    <label for="chk-level" class="filter-label">Max Level</label>
    <input
      id="max-level"
      type="number"
      bind:value={maxLevelValue}
      oninput={emitChange}
      onblur={clampInput}
      disabled={!levelEnabled}
    />
    <i
      class="material-icons-outlined help-icon"
      title="Only consider enemies at or below this level"
    >help_outline</i>
  </div>

  <div class="filter-row">
    <input
      type="checkbox"
      id="chk-attrs"
      checked={attrsEnabled}
      onchange={toggleAttrs}
    />
    <label for="chk-attrs" class="filter-label">Max Attributes</label>
    <input
      id="max-attrs"
      type="number"
      bind:value={maxAttrsValue}
      oninput={emitChange}
      onblur={clampInput}
      disabled={!attrsEnabled}
    />
    <i
      class="material-icons-outlined help-icon"
      title="Only consider enemies, that have at most this many total attributes (The sum of strength, dexterity, etc.)"
    >help_outline</i>
  </div>
</div>

<button
  class="class-toggle"
  onclick={() => (showClasses = !showClasses)}
>
  <i class="material-icons-outlined">{showClasses ? "expand_less" : "expand_more"}</i>
  Class filter{selectedCount > 0 ? ` (${selectedCount})` : ""}
</button>

{#if showClasses}
  <div class="class-grid">
    {#each classes as cls}
      <div class="class-filter">
        <input
          type="checkbox"
          id="class-{cls.toLowerCase()}"
          checked={selectedClasses.includes(cls)}
          onchange={() => handleClassToggle(cls)}
        />
        <label for="class-{cls.toLowerCase()}">{labelFor(cls)}</label>
      </div>
    {/each}
  </div>
{/if}

<style>
  .filters-column {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .filter-row input[type="checkbox"] {
    accent-color: var(--color-blue);
    cursor: pointer;
    margin: 0;
  }

  .filter-label {
    font-size: 13px;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    width: 95px;
  }

  .filter-row input[type="number"] {
    width: 90px;
    padding: 3px 4px;
    border-radius: 4px;
    border: 1px solid var(--color-gray300);
    background-color: var(--color-gray400);
    color: var(--color-text);
  }

  .filter-row input[type="number"]:disabled {
    opacity: 0.4;
  }

  .class-toggle {
    all: unset;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--color-gray100);
    cursor: pointer;
    padding: 2px 0;
    margin-bottom: 8px;
  }

  .class-toggle:hover {
    color: var(--color-text);
  }

  .class-toggle i {
    font-size: 18px !important;
  }

  .class-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    margin-bottom: 10px;
    padding: 6px;
    background-color: var(--color-gray500);
    border-radius: 6px;
    max-height: 160px;
    overflow-y: auto;
  }

  .class-grid::-webkit-scrollbar {
    width: 4px;
  }

  .class-grid::-webkit-scrollbar-thumb {
    background: var(--color-gray300);
    border-radius: 2px;
  }

  .class-filter {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px;
    border-radius: 4px;
  }

  .class-filter:hover {
    background-color: var(--color-gray400);
  }

  .class-filter label {
    font-size: 13px;
    cursor: pointer;
  }

  .class-filter input[type="checkbox"] {
    accent-color: var(--color-blue);
    cursor: pointer;
  }

  .help-icon {
    cursor: help;
    font-size: 16px !important;
    color: var(--color-gray200);
  }
</style>
