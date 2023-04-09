export function getSubscription() {
    return {
        subscription: {
            date_end: 0,
            date_start: 0,
            enabled: false,
        },
    }
}

export function getProfitbase() {
    return {
        "pb_api_key": "",
        "subdomain": "",
        "type": "profitbase"
      }
}

export function getDefaultAmoCRM() {
    return {
        "account_id": 0,
        "account_name": "",
        "client_id": "",
        "client_secret": "",
        "domain_zone": "ru",
        "subdomain": "",
        "token_cache": {
          "access_token": "",
          "expires_at": 0,
          "expires_in": 86400,
          "refresh_token": "",
          "token_type": "Bearer"
        },
        "type": "amocrm"
      }
}