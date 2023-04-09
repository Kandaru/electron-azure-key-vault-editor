const { ClientSecretCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

class KeyVault {
    client;

    constructor(kv) {
        const keyVaultURL = `https://${kv.kvName}.vault.azure.net`;
        const credential = new ClientSecretCredential(
            kv.ati,
            kv.aci,
            kv.acs
        );

        this.client = new SecretClient(keyVaultURL, credential);
    }

    async getSecretNames() {
        const names = [];

        for await (let page of this.client.listPropertiesOfSecrets().byPage({ maxPageSize: 25 })) {
            names.push(...page.map(item => item.name));
        }

        return names;
    }

    async getSecretContent(secretName) {
        const secret = await this.client.getSecret(secretName);

        return secret.value;
    }

    async setSecretContent(secretName, content) {
        await this.client.setSecret(secretName, content);
    }

    async deleteSecret(secretName) {
        const deletingProcess = await this.client.beginDeleteSecret(secretName);

        await deletingProcess.pollUntilDone();

        await this.client.purgeDeletedSecret(secretName);
    }
}

module.exports = KeyVault;