<script lang="ts">
    import { AceEditor } from "svelte-ace";
    import "brace/mode/json";
    import "brace/theme/clouds";
    import "brace/theme/vibrant_ink";
    import { globalSettings } from "../globalSettings";
    import { js as jsBeautify } from "js-beautify";
    import { onMount } from "svelte";
    import type KVSecret from "../../classes/KVSecret";

    export let selectedSecret: KVSecret;

    let isValid = false;

    function enableValidation({ detail: editor }) {
        editor.getSession().on("changeAnnotation", function () {
            var annot = editor.getSession().getAnnotations();

            isValid = !annot.length;
        });
    }

    function beautify() {
        selectedSecret.content = jsBeautify(selectedSecret.content);
    }

    onMount(() => {
        window.electronAPI?.onFormat(beautify);
    });
</script>

<div class="w-full h-full bg-white flex flex-col">
    <div
        class="flex mt-2 px-4 gap-4 justify-between text-xl md:text-3xl md:mx-[10%] items-center"
    >
        <p class="grow-0 shrink">Название</p>
        <input
            type="text"
            disabled={!selectedSecret.isNew}
            bind:value={selectedSecret.name}
            class="border-solid border-gray-400 border w-full px-2 md:py-1 disabled:bg-gray-200"
        />
    </div>
    <div class="w-full h-full mt-1">
        <AceEditor
            on:init={enableValidation}
            theme={$globalSettings.theme === "dark" ? "vibrant_ink" : "clouds"}
            bind:value={selectedSecret.content}
            options={{ fontSize: 24 }}
        />
    </div>
    <div class="bg-white h-max px-4 py-2 grid grid-cols-2 gap-2">
        <button
            disabled={!isValid}
            class="min-h-[60px] w-full rounded-md bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-300 disabled:hover:bg-purple-300 text-3xl text-white font-semibold"
            >Сохранить</button
        >
        <button
            disabled={selectedSecret.isNew || !isValid}
            class="min-h-[60px] w-full rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 disabled:hover:bg-red-300 text-3xl text-white font-semibold"
            >Удалить</button
        >
    </div>
</div>
