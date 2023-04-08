import { writable } from 'svelte/store';

export let globalSettings = writable<ISettings>({
    theme: undefined
});