import type KeyVault from "./KeyVault";

export default class KVSecret {
    name: string;
    content: string;
    isNew: boolean;
    parentKeyVault: KeyVault;

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

        return this.content;
    }

    async save() {

    }

    async delete() {
        
    }
}