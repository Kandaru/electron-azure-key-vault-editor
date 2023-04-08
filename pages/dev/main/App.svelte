<script lang="ts">
  import { tick } from "svelte";
  import KeyVault from "../classes/KeyVault";
  import Overlay from "./lib/Overlay.svelte";
  import SecretEditor from "./lib/SecretEditor.svelte";
  import SecretsList from "./lib/SecretsList.svelte";
  import type KVSecret from "../classes/KVSecret";
  
  let selectedKeyVault: KeyVault;
  let secrets: KVSecret[] = [];
  let selectedSecret: KVSecret;
  let fetching: boolean = false;

  window.electronAPI.onKVSelected(async (kv) => {
    if (kv) {
      selectedKeyVault = new KeyVault(kv);
      document.title = `Приложулька: ${selectedKeyVault.origin.name || selectedKeyVault.origin.kvName}`;

      await tick();

      fetching = true;

      secrets = await selectedKeyVault.fetch();
      selectedSecret = undefined;

      fetching = false;
    } else {
      selectedKeyVault = undefined;
      selectedSecret = undefined;
      secrets = [];
      document.title = 'Приложулька';
    }
  });
</script>

<svelte:head>
  <title>Приложулька</title>
</svelte:head>
<div
  class="w-screen h-screen min-w-[600px] min-h-[300px] grid grid-cols-[1fr,2fr] bg-purple-800 gap-1"
>
  {#if fetching}
    <Overlay >
      <p>Запрос секретов...</p>
    </Overlay>
  {/if}
  {#if selectedKeyVault}
    <SecretsList 
      on:fetching={({ detail }) => fetching = detail} 
      {secrets} 
      bind:selectedSecret />

    {#if selectedSecret}
      <SecretEditor 
        {selectedSecret} />
    {/if}
  {:else}
    <Overlay>
      <p>Не выбрано хранилище!</p>
    </Overlay>
  {/if}
</div>
