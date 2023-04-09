<script lang="ts">
    import { AceEditor } from "svelte-ace";
    import "brace/mode/json";
    import "brace/theme/clouds";
    import "brace/theme/vibrant_ink";
    import { globalSettings } from "../globalSettings";
    import { js as jsBeautify } from "js-beautify";
    import { createEventDispatcher, onMount } from "svelte";
    import type KVSecret from "../../classes/KVSecret";

    export let selectedSecret: KVSecret;

    const dispatch = createEventDispatcher<{
        delete: void;
        error: Error;
        save: boolean;
    }>();

    let isValid = false;
    let editor;

    function enableValidation({ detail: ace }) {
        ace.getSession().on("changeAnnotation", function () {
            var annot = ace.getSession().getAnnotations();

            isValid = !annot.length;
        });

        editor = ace;
    }

    function beautify() {
        selectedSecret.content = jsBeautify(selectedSecret.content);
    }

    function changeFontSizeOnScroll(ev: WheelEvent) {
        const direction = ev.deltaY < 0 ? 1 : -1;
        const ctrl = ev.ctrlKey;
        const currentFontSize = parseInt(editor.getFontSize());

        if (!ctrl) return;
        if (currentFontSize < 4 && direction === -1) return;
        if (currentFontSize > 100 && direction === 1) return;

        editor.setFontSize(`${currentFontSize + (2 * direction)}px`);
    }

    async function save() {
        dispatch('save', true);
        try {
            const result = await selectedSecret.save();

            if (!result) {
                throw Error('Не удалось сохранить секрет');
            }
        } catch (error) {
            dispatch('error', error);
        }
        dispatch('save', false);
    }

    async function del() {
        try {
            const result = await selectedSecret.delete();

            if (!result) {
                throw Error('Не удалось удалить секрет');
            }
        } catch (error) {
            return dispatch('error', error);
        }

        dispatch('delete');
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
    <div class="w-full h-full mt-1" on:mousewheel={changeFontSizeOnScroll}>
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
            on:click={save}
            class="min-h-[60px] w-full rounded-md bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-300 disabled:hover:bg-purple-300 text-3xl text-white font-semibold"
            >Сохранить</button
        >
        <button
            disabled={selectedSecret.isNew || !isValid}
            on:click={del}
            class="min-h-[60px] w-full rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 disabled:hover:bg-red-300 text-3xl text-white font-semibold"
            >Удалить</button
        >
    </div>
</div>
