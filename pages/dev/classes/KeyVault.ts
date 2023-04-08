import KVSecret from "./KVSecret";

export default class KeyVault {
    origin: IKeyVault;
    secrets: KVSecret[];

    constructor(item: IKeyVault) {
        this.origin = item;
    }

    /**
     * Получить список секретов
     */
    async fetch(): Promise<KVSecret[]> {
        const result = await window.electronAPI.fetchSecrets(this.origin);
        this.secrets = result.map(secret => new KVSecret(secret, this, false));

        return this.secrets;
    }
}