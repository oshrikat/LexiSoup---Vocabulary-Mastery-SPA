/**
 * AIService (Facade / Factory)
 * Decouples game logic from specific AI providers.
 * Easily switch between Gemini, Groq, or Local rules without touching UI or controllers.
 */
class AIService {
  constructor(config = {}) {
    this.config = config;
    this.provider = this._createProvider(config.provider || 'gemini');
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.provider = this._createProvider(this.config.provider);
  }

  _createProvider(providerName) {
    switch (providerName) {
      case 'gemini':
        return new GeminiProvider(this.config.geminiApiKey, this.config.geminiModel || 'gemini-1.5-flash');
      case 'groq':
        return new GroqProvider(this.config.groqApiKey, this.config.groqModel || 'llama-3.3-70b-versatile');
      case 'local':
      default:
        return new LocalRuleProvider();
    }
  }

  async testConnection() {
    return await this.provider.testConnection();
  }

  async parseAndGenerateVocab(rawText, onProgress) {
    return await this.provider.parseAndGenerateVocab(rawText, onProgress);
  }

  async sendChatMessage(conversationHistory, targetWords) {
    return await this.provider.sendChatMessage(conversationHistory, targetWords);
  }
}

window.AIService = AIService;
