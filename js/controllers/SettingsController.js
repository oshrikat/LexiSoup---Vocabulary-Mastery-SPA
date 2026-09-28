/**
 * SettingsController
 * Handles configuration, API keys, audio settings, and data resets.
 */
class SettingsController {
  constructor(app) {
    this.app = app;
  }

  async saveSettings(formData) {
    const profile = this.app.userProfile;

    profile.soundEnabled = formData.soundEnabled;
    profile.defaultSprintMinutes = parseInt(formData.defaultSprintMinutes, 10) || 5;

    profile.aiConfig.provider = formData.provider;
    profile.aiConfig.geminiApiKey = formData.geminiApiKey.trim();
    profile.aiConfig.geminiModel = formData.geminiModel.trim() || 'gemini-1.5-flash';
    profile.aiConfig.groqApiKey = formData.groqApiKey.trim();
    profile.aiConfig.groqModel = formData.groqModel.trim() || 'llama-3.3-70b-versatile';

    // Update active AI service
    this.app.aiService.updateConfig(profile.aiConfig);
    this.app.audio.enabled = profile.soundEnabled;

    await this.app.storage.set('user_profile', profile.toJSON());
    return true;
  }

  async testAIConnection() {
    return await this.app.aiService.testConnection();
  }

  async resetAllData() {
    await this.app.storage.clear();
    location.reload();
  }
}

window.SettingsController = SettingsController;
