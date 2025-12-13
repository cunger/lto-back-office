class TokenCredentialAuthenticationProvider {
  constructor(credential, options = {}) {
    this.credential = credential;
    this.scopes = options.scopes || ['https://graph.microsoft.com/.default'];
  }

  async getAccessToken() {
    const token = await this.credential.getToken(this.scopes);
    return token.token;
  }
}

module.exports = {
  TokenCredentialAuthenticationProvider,
};