<script lang="ts">
  //@ts-ignore
  let selectedKeyVault: IKeyVault = {};
  let allKeyVaults: IKeyVault[] = [];
  let isNew: boolean = false;
  let isValid: boolean = false;

  window.electronAPI.fetchEditingData().then((res) => {
    selectedKeyVault = res.selectedKV;
    allKeyVaults = res.allKVs;
    isNew = res.isNew;
  });

  $: isValid = !!(selectedKeyVault.name && selectedKeyVault.kvName && selectedKeyVault.aci && selectedKeyVault.acs && selectedKeyVault.ati);

  function save() {
    window.electronAPI.saveKV({ selectedKV: selectedKeyVault, isNew });
  }

  function cancel() {
    window.electronAPI.cancelEditing();
  }
</script>

<svelte:head>
  <title>Создание \ Обновление хранилища</title>
</svelte:head>
<div
  class="w-screen h-screen dark:text-white dark:bg-purple-800 gap-10 flex flex-col py-10 items-center text-2xl text-center justify-center select-none"
>
  <!-- Title -->
  <div>
    <p class="font-bold text-3xl">Создание \ Редактирование хранилища</p>
  </div>

  <!-- Inputs -->
  <div
    class="flex flex-col gap-4 [&>*]:grid [&>*]:grid-cols-2 [&>*]:w-full [&>*]:gap-6 [&_p]:text-left [&_input]:focus:outline-none [&_input]:border-gray-400 [&_input]:border-2 [&_input]:rounded-md [&_input]:px-2 [&_input:invalid]:border-red-500"
  >
    <div>
      <div
        class="cursor-help"
        title="Будет отображаться во всех списках для удобства понимания"
      >
        <p>Своё название</p>
      </div>
      <div>
        <input required type="text" list="name" bind:value={selectedKeyVault.name} />
        <datalist id="name">
          {#each allKeyVaults as kv}
            <option value={kv.name}>{kv.name}</option>
          {/each}
        </datalist>
      </div>
    </div>
    <div>
      <div>
        <p>Название секрета</p>
      </div>
      <div>
        <input required type="text" list="kvName" bind:value={selectedKeyVault.kvName} />
        <datalist id="kvName">
          {#each allKeyVaults as kv}
            <option value={kv.kvName}>{kv.name}</option>
          {/each}
        </datalist>
      </div>
    </div>
    <div>
      <div>
        <p>Azure Client Id</p>
      </div>
      <div>
        <input required type="text" list="aci" bind:value={selectedKeyVault.aci} />
        <datalist id="aci">
          {#each allKeyVaults as kv}
            <option value={kv.aci}>{kv.name}</option>
          {/each}
        </datalist>
      </div>
    </div>
    <div>
      <div>
        <p>Azure Client Secret</p>
      </div>
      <div>
        <input required type="text" list="acs" bind:value={selectedKeyVault.acs} />
        <datalist id="acs">
          {#each allKeyVaults as kv}
            <option value={kv.acs}>{kv.name}</option>
          {/each}
        </datalist>
      </div>
    </div>
    <div>
      <div>
        <p>Azure Tenant Id</p>
      </div>
      <div>
        <input required type="text" list="ati" bind:value={selectedKeyVault.ati} />
        <datalist id="ati">
          {#each allKeyVaults as kv}
            <option value={kv.ati}>{kv.name}</option>
          {/each}
        </datalist>
      </div>
    </div>
  </div>

  <!-- Buttons -->
  <div
    class="flex gap-6 [&_button]:min-h-[50px] [&_button]:w-full [&_button]:px-4 [&_button]:text-white [&_button]:font-semibold"
  >
    <button
      on:click={save}
      disabled={!isValid}
      class="rounded-md bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-300 disabled:hover:bg-purple-300 text-3xl"
      >Сохранить</button
    >
    <button
      on:click={cancel}
      class="rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 disabled:hover:bg-red-300 text-3xl"
      >Отмена</button
    >
  </div>
</div>

<style>
  input[value=""] {
    border: 1px solid red!important;
  }
</style>