/**
 * BaseLLMProvider
 * Abstract strategy class defining the LLM provider interface.
 */
class BaseLLMProvider {
  constructor(apiKey = '', model = '') {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Parse extracted raw text and return structured vocabulary game items
   * @param {string} rawText - Document or list text
   * @param {function} onProgress - Progress status callback (message)
   * @returns {Promise<Array<Object>>}
   */
  async parseAndGenerateVocab(rawText, onProgress = () => {}) {
    throw new Error('parseAndGenerateVocab must be implemented by provider');
  }

  /**
   * Ping / Validate API Key
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    throw new Error('testConnection must be implemented by provider');
  }

  /**
   * Interactive Conversational Chat with AI Tutor
   * @param {Array<{role: string, text: string}>} conversationHistory
   * @param {Array<Object>} targetWords - List of words to weave into chat
   * @returns {Promise<string>}
   */
  async sendChatMessage(conversationHistory, targetWords = []) {
    throw new Error('sendChatMessage must be implemented by provider');
  }
}

window.BaseLLMProvider = BaseLLMProvider;
