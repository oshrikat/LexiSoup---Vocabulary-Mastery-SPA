/**
 * LexiSoup Application Bootstrap & Main Entry Point
 * Orchestrates MVC lifecycle, dependency injection, and initial view loading.
 */
class LexiSoupApp {
  constructor() {
    this.storage = null;
    this.userProfile = null;
    this.audio = null;
    this.aiService = null;
    this.srsService = null;

    this.vocabController = null;
    this.gameController = null;
    this.settingsController = null;

    this.views = null;
  }

  async init() {
    console.log('[LexiSoup] Bootstrapping application...');

    // 1. Initialize Storage Layer (IndexedDB with LocalStorage fallback)
    this.storage = new IndexedDBAdapter('LexiSoupDB', 1);
    await this.storage.init();

    // 2. Load or initialize UserProfile
    const storedProfile = await this.storage.get('user_profile');
    this.userProfile = new UserProfile(storedProfile || {});

    // 3. Initialize Audio Synthesizer
    this.audio = new AudioService();
    this.audio.enabled = this.userProfile.soundEnabled;

    // 4. Initialize AI Service
    this.aiService = new AIService(this.userProfile.aiConfig);

    // 5. Initialize SRS Engine
    this.srsService = new SpacedRepetitionService([]);

    // 6. Initialize Controllers (Business Logic)
    this.vocabController = new VocabController(this);
    this.gameController = new GameController(this);
    this.settingsController = new SettingsController(this);

    // 7. Initialize View Coordinator (Presentation Layer)
    this.views = new ViewCoordinator(this);

    // 8. Ingest Initial Vocabulary Data
    await this.vocabController.loadInitialData();

    // 9. Bind global event listeners
    this.bindGlobalNavigation();

    // 10. Display Dashboard
    this.views.showDashboard();
    console.log('[LexiSoup] Application ready! 🚀');
  }

  bindGlobalNavigation() {
    // Header brand
    document.getElementById('header-brand')?.addEventListener('click', () => {
      this.views.showDashboard();
    });

    // Header buttons
    document.getElementById('btn-header-settings')?.addEventListener('click', () => {
      this.views.showSettingsModal();
    });

    document.getElementById('btn-header-upload')?.addEventListener('click', () => {
      this.views.showUploadModal();
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    soundBtn?.addEventListener('click', async () => {
      this.userProfile.soundEnabled = !this.userProfile.soundEnabled;
      this.audio.enabled = this.userProfile.soundEnabled;
      soundBtn.innerText = this.userProfile.soundEnabled ? '🔊' : '🔇';
      await this.storage.set('user_profile', this.userProfile.toJSON());
    });

    // Bottom Navigation Tabs
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'home') this.views.showDashboard();
        else if (tab === 'prep') this.views.showPrepMode();
        else if (tab === 'tutor') this.views.showAITutor();
        else if (tab === 'vocab') this.views.showVocabList();
        else if (tab === 'upload') this.views.showUploadModal();
        else if (tab === 'settings') this.views.showSettingsModal();
      });
    });
  }
}

// Global initialization on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new LexiSoupApp();
  window.app.init().catch(err => {
    console.error('[LexiSoup] Boot error:', err);
  });
});
