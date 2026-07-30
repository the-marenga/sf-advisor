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

<div class="input-row">
  <div class="field">
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
  <div class="field">
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
  .input-row {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .field label {
    font-size: 13px;
    white-space: nowrap;
  }

  .field input {
    width: 60px;
    padding: 4px;
    border-radius: 4px;
    border: 1px solid var(--color-gray300);
    background-color: var(--color-gray400);
    color: var(--color-text);
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
