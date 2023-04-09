<script lang="ts">
  import { onMount, tick } from "svelte";
  import KeyVault from "../classes/KeyVault";
  import Overlay from "./lib/Overlay.svelte";
  import SecretEditor from "./lib/SecretEditor.svelte";
  import SecretsList from "./lib/SecretsList.svelte";
  import type KVSecret from "../classes/KVSecret";
  import { getProfitbase, getSubscription } from "./defaultEntites";
  import AmoToken from "./lib/AmoToken.svelte";
  
  let selectedKeyVault: KeyVault;
  let secrets: KVSecret[] = [];
  let selectedSecret: KVSecret;
  
  //#region Оверлейниые дела
  
  let fetching: boolean = false;
  let savingSecret: boolean = false;
  let fetchingAmo: boolean = false;
  let deletingSecret: boolean = false;
  let error: Error;
  
  //#endregion

  let amoTokenDataObject = {
    readyStatus: true,
    secretJSON: { applications: [] },
    onReady: () => {
      selectedSecret.content = JSON.stringify(amoTokenDataObject.secretJSON, undefined, '    ');

      amoTokenDataObject.readyStatus = true;
    },
    onError: catchError,
    onCancel: () => amoTokenDataObject.readyStatus = true
  };

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

  async function catchError(err: Error) {
    error = err;

    setTimeout(() => {
      error = undefined;
    }, 3000);
  }

  async function refetchSecrets() {
    fetching = true;

    secrets = await selectedKeyVault.fetch();
    selectedSecret = undefined;

    fetching = false;
  }

  function onDeleteSecret(status: boolean) {
    deletingSecret = status;

    if (!status) {
      refetchSecrets();
    }
  }

  async function onSaveSecret(status: boolean) {
    savingSecret = status;

    if (!status && !secrets.includes(selectedSecret)) {
      const temp = selectedSecret;

      secrets = [...secrets, selectedSecret];
      selectedSecret = undefined;

      await tick();

      selectedSecret = temp;
    }
  }

  onMount(() => {
    window.electronAPI.onSecretFunction((functionName) => {
      if (!selectedSecret || !selectedSecret.fetched) return;

      if (!selectedSecret.content) selectedSecret.content = '{}';

      let secretContentJSON;
      try {
        secretContentJSON = JSON.parse(selectedSecret.content);
      } catch (error) {
        return catchError(new Error('В теле секрета не JSON!'));
      }

      switch (functionName) {
        case 'profitbase':
          if (!secretContentJSON.applications) {
            secretContentJSON.applications = [];
          }
          if (secretContentJSON.applications.find(app => app.type === 'profitbase')) {
            return catchError(new Error('Приложение Profitbase уже есть!'));
          }

          secretContentJSON.applications.push(getProfitbase());
          break;
        case 'subscription':
          if (secretContentJSON.subscription) {
            return catchError(new Error('Блок подписки уже есть!'));
          }

          secretContentJSON.subscription = getSubscription();
          break;
        case 'amocrm':
          if (!secretContentJSON.applications) {
            secretContentJSON.applications = [];
          }
          if (secretContentJSON.applications.find(app => app.type === 'amocrm')) {
            return catchError(new Error('Приложение AmoCRM уже есть!'));
          }
          amoTokenDataObject.secretJSON = secretContentJSON;
          amoTokenDataObject.readyStatus = false;
          return;
      }

      selectedSecret.content = JSON.stringify(secretContentJSON, undefined, '    ');
    });
  });
</script>

<svelte:head>
  <title>Приложулька</title>
</svelte:head>
<div
  class="w-screen h-screen min-w-[600px] min-h-[300px] grid grid-cols-[1fr,2fr] bg-purple-800 gap-1"
>
  <!-- Overlay Types -->
  {#if fetching}
    <Overlay >
      <p>Запрос секретов...</p>
    </Overlay>
  {/if}
  {#if error}
    <Overlay>
      <p class="max-w-[50%] w-max whitespace-nowrap">{error.message}</p>
    </Overlay>
  {/if}
  {#if savingSecret}
    <Overlay>
      <p>Сохранение секрета...</p>
    </Overlay>
  {/if}
  {#if deletingSecret}
    <Overlay>
      <p>Удаление секрета...</p>
    </Overlay>
  {/if}
  {#if fetchingAmo}
    <Overlay>
      <p>Получение данных из AmoCRM...</p>
    </Overlay>
  {/if}

  <!-- Editor Main -->
  {#if selectedKeyVault}
    <SecretsList 
      on:fetching={({ detail }) => fetching = detail} 
      on:refetchSecrets={refetchSecrets}
      {secrets} 
      bind:selectedSecret
      {selectedKeyVault} />

    {#if selectedSecret}
      <SecretEditor 
        {selectedSecret} 
        on:error={({ detail }) => catchError(detail)} 
        on:delete={({ detail }) => onDeleteSecret(detail)} 
        on:save={({ detail }) => onSaveSecret(detail)} />
    {/if}
  {:else}
    <Overlay>
      <p>Не выбрано хранилище!</p>
    </Overlay>
  {/if}

  {#if !amoTokenDataObject.readyStatus}
    <AmoToken {amoTokenDataObject} on:amoToken={({ detail }) => fetchingAmo = detail} />
  {/if}
</div>
