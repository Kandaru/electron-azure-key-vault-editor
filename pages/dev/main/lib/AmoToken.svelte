<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getDefaultAmoCRM } from "../defaultEntites";

    export let amoTokenDataObject = {
        readyStatus: false,
        secretJSON: { applications: [] },
        onReady: () => {},
        onError: async (err: Error) => {},
        onCancel: () => {}
    };

    const dispatch = createEventDispatcher<{
        'amoToken': boolean;
    }>();

    const initialData = {};
    const resultData = getDefaultAmoCRM();
    const fieldsData = [
        { name: 'Субдомен', key: 'subdomain' },
        { name: 'Доменная зона', key: 'domainZone' },
        { name: 'Redirect URI', key: 'redirectUri' },
        { name: 'Секретный ключ', key: 'secret' },
        { name: 'ID интеграции', key: 'integrationId' },
        { name: 'Код авторизации', key: 'authCode' },
    ]

    let inputsBlock: HTMLDivElement;
    let isValid = false;

    async function collectData() {
        dispatch('amoToken', true);
        try {
            const tokenData = await getToken();

            resultData.token_cache = {
                ...tokenData,
                expires_at: Math.ceil(Date.now() / 1000) + tokenData.expires_in
            };

            const accountInfo = await getAccountInfo(tokenData);

            resultData.account_id = accountInfo.id;
            resultData.account_name = `${accountInfo.name} - ${initialData['integrationId']}`;
            resultData.client_id = initialData['integrationId'];
            resultData.client_secret = initialData['secret'];
            resultData.domain_zone = initialData['domainZone'];
            resultData.subdomain = initialData['subdomain'];

            amoTokenDataObject.secretJSON.applications.push(resultData);
            amoTokenDataObject.onReady();
        } catch (error) {
            amoTokenDataObject.onError(error);
        } finally {
            dispatch('amoToken', false);
        }
    }

    async function getToken() {
        const baseUrl = `https://${initialData['subdomain']}.amocrm.${initialData['domainZone']}`;

        const request = await fetch(`${baseUrl}/oauth2/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: initialData['integrationId'],
                client_secret: initialData['secret'],
                grant_type: "authorization_code",
                code: initialData['authCode'],
                redirect_uri: initialData['redirectUri'],
            })
        });

        if (!request.ok) {
            throw new Error("Не удалось получить токен");
        }

        const response: IAmoToken = await request.json();

        return response;
    }

    async function getAccountInfo(token: IAmoToken): Promise<{ id: number; name: string; }> {
        const baseUrl = `https://${initialData['subdomain']}.amocrm.${initialData['domainZone']}`;

        const request = await fetch(`${baseUrl}/api/v4/account`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.access_token}`
            }
        });

        if (!request.ok) {
            throw new Error("Не удалось запросить информацию об аккаунте");
        }

        const response = await request.json();

        return response;
    }

    function updateValidation() {
        isValid = Array.from(inputsBlock.querySelectorAll<HTMLInputElement>('input')).every(input => input.validity.valid);
    }
</script>

<!-- Overlay -->
<div class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-40 z-10">
    <div class="flex flex-col items-center gap-6 rounded-md bg-white p-10">
      <div class="text-center font-semibold text-lg">
        <p>Генерация токена AmoCRM</p>
      </div>
      <div bind:this={inputsBlock} class="flex flex-col gap-2 [&>*]:grid [&>*]:grid-cols-2 [&>*]:items-center [&>*]:gap-5 [&_input]:rounded-md [&_input]:border-2 [&_input]:border-gray-400 [&_input]:px-2 [&_input]:outline-none [&_input:invalid]:border-red-500">
        {#each fieldsData as field}
            <div>
                <div>
                    <p>{field.name}</p>
                </div>
                <div>
                    <input type="text" list={field.key === 'domainZone' ? 'zones' : ''} required bind:value={initialData[field.key]} on:input={updateValidation}/>
                    {#if field.key === 'domainZone'}
                        <datalist id="zones">
                            <option>ru</option>
                            <option>com</option>
                        </datalist>
                    {/if}
                </div>
            </div>
        {/each}
      </div>
      <div class="flex gap-3 [&>button]:px-2">
        <button disabled={!isValid} on:click={collectData} class="min-h-[40px] w-full rounded-md bg-purple-600 text-2xl font-semibold text-white hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-300 disabled:hover:bg-purple-300">Запросить</button>
        <button on:click={amoTokenDataObject.onCancel} class="min-h-[40px] w-full rounded-md bg-red-600 text-2xl font-semibold text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 disabled:hover:bg-red-300">Отмена</button>
      </div>
    </div>
  </div>