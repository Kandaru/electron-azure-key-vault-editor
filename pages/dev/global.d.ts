interface ISettings {
    theme: 'dark' | 'light';
}

interface IKeyVault {
    name: string;
    kvName: string;
    aci: string;
    acs: string;
    ati: string;
}

interface IAmoToken {
    token_type: "Bearer";
    expires_in: 86400;
    access_token: string;
    refresh_token: string;
}

declare namespace electronAPI {
    function onThemeChange(callback: (theme: 'dark' | 'light') => void): void;
    function onFormat(callback: () => void): void;
    function onKVSelected(callback: (kv: IKeyVault) => void): void;
    function onSecretFunction(callback: (funcName: 'subscription' | 'profitbase' | 'amocrm') => void): void;
    function fetchSecrets(kv: IKeyVault): Promise<string[]>;
    function fetchSecret(secretName: string, kv: IKeyVault): Promise<string>;
    function fetchEditingData(): Promise<{ selectedKV: IKeyVault, allKVs: IKeyVault[], isNew: boolean }>;
    function saveKV(editingData: { selectedKV: IKeyVault, isNew: boolean }): Promise<void>;
    function cancelEditing(): Promise<void>;
    function saveSecret(kv, secretName, secretContent): Promise<boolean>;
    function deleteSecret(kv, secretName): Promise<boolean>;
}

declare var selectedKeyVault: IKeyVault;
declare var allKeyVaults: IKeyVault[];