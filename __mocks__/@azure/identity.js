class ClientSecretCredential {
  constructor(tenantId, clientId, clientSecret) {
    this.tenantId = tenantId;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getToken(scopes) {
    return {
      token: 'mock-access-token',
      expiresOnTimestamp: Date.now() + 3_600_000,
    };
  }
}

class DefaultAzureCredential {
  async getToken(scopes) {
    return {
      token: 'mock-access-token',
      expiresOnTimestamp: Date.now() + 3_600_000,
    };
  }
}

class ChainedTokenCredential {
  constructor(...credentials) {
    this.credentials = credentials;
  }

  async getToken(scopes) {
    return {
      token: 'mock-access-token',
      expiresOnTimestamp: Date.now() + 3_600_000,
    };
  }
}

module.exports = {
  ClientSecretCredential,
  DefaultAzureCredential,
  ChainedTokenCredential,
};