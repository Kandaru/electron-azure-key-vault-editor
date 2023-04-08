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

declare namespace electronAPI {
    function onThemeChange(callback: (theme: 'dark' | 'light') => void): void;
    function onFormat(callback: () => void): void;
    function onKVSelected(callback: (kv: IKeyVault) => void): void;
    function fetchSecrets(kv: IKeyVault): Promise<string[]>;
    function fetchSecret(secretName: string, kv: IKeyVault): Promise<string>;
}

declare var selectedKeyVault: IKeyVault;