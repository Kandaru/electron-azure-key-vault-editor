declare namespace globalParams {
    function getSelectedKeyVault(): IKeyVault;
    function getAllVaults(): IKeyVault[];
    function isEditingKVNew(): boolean;
}