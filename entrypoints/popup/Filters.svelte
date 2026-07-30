<script lang="ts">
  import { HelpCircle, ChevronDown, ChevronUp } from "lucide-svelte";
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

  // svelte-ignore state_referenced_locally
  let maxAttrsValue = $state(maxAttrs?.toString() ?? "");
  // svelte-ignore state_referenced_locally
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

  function parseValue(val: string): number | null {
    if (!val) return null;
    const n = parseInt(val, 10);
    return isNaN(n) || n < 0 ? null : n;
  }

  function handleLevelInput(e: Event) {
    maxLevelValue = (e.currentTarget as HTMLInputElement).value;
    emitChange();
  }

  function handleAttrsInput(e: Event) {
    maxAttrsValue = (e.currentTarget as HTMLInputElement).value;
    emitChange();
  }

  function emitChange() {
    onFilterChange({
      maxAttrs: attrsEnabled ? parseValue(maxAttrsValue) : null,
      maxLevel: levelEnabled ? parseValue(maxLevelValue) : null,
      selectedClasses,
    });
  }

  function clampInput() {
    const clamp = (val: string): string => {
      if (!val) return "0";
      const n = parseInt(val, 10);
      return isNaN(n) || n < 0 ? "0" : String(n);
    };
    maxAttrsValue = clamp(maxAttrsValue);
    maxLevelValue = clamp(maxLevelValue);
    emitChange();
  }

  function toggleAttrs() {
    if (!maxAttrsValue || isNaN(Number(maxAttrsValue))) {
      maxAttrsValue = "0";
    }
    onFilterChange({
      maxAttrs: attrsEnabled ? null : parseValue(maxAttrsValue),
      maxLevel: levelEnabled ? parseValue(maxLevelValue) : null,
      selectedClasses,
    });
  }

  function toggleLevel() {
    if (!maxLevelValue || isNaN(Number(maxLevelValue))) {
      maxLevelValue = "0";
    }
    onFilterChange({
      maxAttrs: attrsEnabled ? parseValue(maxAttrsValue) : null,
      maxLevel: levelEnabled ? null : parseValue(maxLevelValue),
      selectedClasses,
    });
  }

  function handleClassToggle(cls: string) {
    const idx = selectedClasses.indexOf(cls);
    const updated =
      idx === -1 ? [...selectedClasses, cls] : selectedClasses.filter((c) => c !== cls);
    onFilterChange({
      maxAttrs: attrsEnabled ? parseValue(maxAttrsValue) : null,
      maxLevel: levelEnabled ? parseValue(maxLevelValue) : null,
      selectedClasses: updated,
    });
  }

  function labelFor(cls: string): string {
    switch (cls) {
      case "BattleMage":
        return "Battle Mage";
      case "DemonHunter":
        return "Demon Hunter";
      case "PlagueDoctor":
        return "Plague Doctor";
      default:
        return cls;
    }
  }

  const selectedCount = $derived(selectedClasses.length);
</script>

<div class="filters-column">
  <div class="filter-row">
    <input type="checkbox" id="chk-level" checked={levelEnabled} onchange={toggleLevel} />
    <label for="chk-level" class="filter-label">Max Level</label>
    <input
      id="max-level"
      type="number"
      value={maxLevelValue}
      oninput={handleLevelInput}
      onblur={clampInput}
      disabled={!levelEnabled}
    />
    <span title="Only consider enemies at or below this level" class="help-icon">
      <HelpCircle size={16} />
    </span>
  </div>

  <div class="filter-row">
    <input type="checkbox" id="chk-attrs" checked={attrsEnabled} onchange={toggleAttrs} />
    <label for="chk-attrs" class="filter-label">Max Attributes</label>
    <input
      id="max-attrs"
      type="number"
      value={maxAttrsValue}
      oninput={handleAttrsInput}
      onblur={clampInput}
      disabled={!attrsEnabled}
    />
    <span
      title="Only consider enemies, that have at most this many total attributes (The sum of strength, dexterity, etc.)"
      class="help-icon"
    >
      <HelpCircle size={16} />
    </span>
  </div>
</div>

<button class="class-toggle" onclick={() => (showClasses = !showClasses)}>
  {#if showClasses}
    <ChevronUp size={18} />
  {:else}
    <ChevronDown size={18} />
  {/if}
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

  .class-toggle:focus-visible {
    outline: 2px solid var(--color-blue);
    outline-offset: 2px;
    border-radius: 2px;
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
    display: inline-flex;
    color: var(--color-gray200);
  }
</style>
