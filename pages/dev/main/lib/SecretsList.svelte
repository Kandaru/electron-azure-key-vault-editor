<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type KVSecret from "../../classes/KVSecret";

    export let secrets: KVSecret[] = [];
    export let selectedSecret: KVSecret = secrets[0];

    const dispatch = createEventDispatcher();

    let query = '';
    let findedSecrets = [];

    async function selectSecret(secret: KVSecret) {
        dispatch('fetching', true);

        await secret.fetch();
        selectedSecret = secret;

        dispatch('fetching', false);
    }

    $: findedSecrets = secrets.filter(secret => secret.name.includes(query));
</script>

<div class="w-full h-full flex flex-col justify-between overflow-hidden gap-1">
    <div class="flex">
        <input bind:value={query} type="text" class="w-full h-full px-2 focus:outline-none text-2xl" placeholder="Поиск...">
        <div class="bg-white px-2">
            <button class="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-1 m-1 rounded-sm text-xl font-semibold">
                Обновить
            </button>
        </div>
    </div>
    <div class="w-full h-full bg-white flex flex-col gap-2 overflow-x-hidden scroll-smooth hover:scroll-auto scrollbar-thin hover:scrollbar scrollbar-thumb-purple-400">
        {#each findedSecrets as secret}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div 
                class:bg-gray-300={selectedSecret === secret}
                class="w-full shrink-0 h-min rounded-sm box-border border-solid cursor-pointer flex justify-start items-center px-4 py-1.5 text-2xl hover:bg-gray-600 hover:text-white overflow-hidden" 
                title={secret.name}
                on:click={() => selectSecret(secret)}
            >
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">{secret.name}</p>
            </div>
        {/each}
    </div>
    <div class="bg-white h-max px-4 py-2">
        <button class="min-h-[60px] w-full rounded-md bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-3xl text-white font-semibold">Добавить</button>
    </div>
</div>