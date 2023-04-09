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

        const result: string | false = await electronAPI.fetchSecret(this.name, this.parentKeyVault.origin);

        if (typeof result === 'string') {
            this.fetched = true;
            this.content = result;
        }

        return result;
    }

    async save() {
        if (!this.isNew && !this.fetched) return;

        const result = await window.electronAPI.saveSecret(this.parentKeyVault.origin, this.name, this.content);

        if (result) {
            this.fetched = true;
            this.isNew = false;
        }
        
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