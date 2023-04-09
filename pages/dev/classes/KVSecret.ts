import type KeyVault from "./KeyVault";

export default class KVSecret {
    name: string;
    content: string;
    isNew: boolean;
    parentKeyVault: KeyVault;
    fetched: boolean = false;

    constructor(secretName: string, kv: KeyVault, isNew?: boolean) {
        this.name = secretName;
        this.parentKeyVault = kv;
        this.content = '';
        this.isNew = !!isNew;
    }

    async fetch() {
        if (this.isNew) {
            throw new Error('Попытка запросить новый секрет!');
        }

        this.content = await electronAPI.fetchSecret(this.name, this.parentKeyVault.origin);
        this.fetched = true;

        return this.content;
    }

    async save() {
        if (!this.fetched) return;

        const result = await window.electronAPI.saveSecret(this.parentKeyVault.origin, this.name, this.content);
        
        return result;
    }

    async delete() {
        if (this.isNew) {
            throw new Error('Попытка удалить новый секрет!');
        }

        const result = await window.electronAPI.deleteSecret(this.parentKeyVault.origin, this.name);

        return result;
    }
}