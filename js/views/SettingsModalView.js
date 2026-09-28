/**
 * SettingsModalView
 * Modal for configuring API keys (Gemini / Groq), models, sprint duration, and audio.
 */
class SettingsModalView {
  constructor(app) {
    this.app = app;
  }

  show() {
    const profile = this.app.userProfile;
    const ai = profile.aiConfig;

    const modalHtml = `
      <div class="modal-backdrop open" id="settings-modal-backdrop">
        <div class="modal-window">
          <div class="modal-header">
            <h3><span>⚙️ הגדרות מערכת ו-AI</span></h3>
            <button class="icon-btn" id="btn-close-settings-modal" style="width: 32px; height: 32px;">✕</button>
          </div>

          <div class="modal-body">
            <!-- AI Provider Selector -->
            <div class="form-group">
              <label class="form-label">ספק בינה מלאכותית (AI Provider)</label>
              <select id="settings-ai-provider" class="form-select">
                <option value="gemini" ${ai.provider === 'gemini' ? 'selected' : ''}>Google Gemini API (מומלץ)</option>
                <option value="groq" ${ai.provider === 'groq' ? 'selected' : ''}>Groq Cloud API (מהירות שיא)</option>
                <option value="local" ${ai.provider === 'local' ? 'selected' : ''}>מנוע חוקים מקומי (ללא מפתח חיצוני)</option>
              </select>
            </div>

            <!-- Gemini Fields -->
            <div id="gemini-settings-section" style="${ai.provider === 'gemini' ? '' : 'display: none;'}">
              <div class="form-group">
                <label class="form-label">Gemini API Key</label>
                <input type="password" id="settings-gemini-key" class="form-input" 
                       placeholder="AIzaSy..." value="${this.escapeHtml(ai.geminiApiKey)}">
                <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.3rem;">
                  המפתח נשמר באופן מקומי בלבד בדפדפן שלך (LocalStorage) ואינו מועבר לשום שרת צד שלישי.
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">מודל Gemini</label>
                <input type="text" id="settings-gemini-model" class="form-input" 
                       value="${this.escapeHtml(ai.geminiModel || 'gemini-1.5-flash')}">
              </div>
            </div>

            <!-- Groq Fields -->
            <div id="groq-settings-section" style="${ai.provider === 'groq' ? '' : 'display: none;'}">
              <div class="form-group">
                <label class="form-label">Groq API Key</label>
                <input type="password" id="settings-groq-key" class="form-input" 
                       placeholder="gsk_..." value="${this.escapeHtml(ai.groqApiKey)}">
              </div>
              <div class="form-group">
                <label class="form-label">מודל Groq</label>
                <input type="text" id="settings-groq-model" class="form-input" 
                       value="${this.escapeHtml(ai.groqModel || 'llama-3.3-70b-versatile')}">
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
              <button class="btn btn-secondary" id="btn-test-ai-key" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                בדוק חיבור API 📡
              </button>
              <span id="ai-test-status" style="font-size: 0.85rem; align-self: center;"></span>
            </div>

            <!-- Gameplay Preferences -->
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1.5rem 0;">
            <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">העדפות משחק</h4>

            <div class="form-group">
              <label class="form-label">משך ספרינט יומי (דקות)</label>
              <select id="settings-sprint-minutes" class="form-select">
                <option value="3" ${profile.defaultSprintMinutes === 3 ? 'selected' : ''}>3 דקות (מהיר ועצבני)</option>
                <option value="5" ${profile.defaultSprintMinutes === 5 ? 'selected' : ''}>5 דקות (אידיאלי)</option>
                <option value="10" ${profile.defaultSprintMinutes === 10 ? 'selected' : ''}>10 דקות (מעמיק)</option>
              </select>
            </div>

            <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
              <label class="form-label" style="margin-bottom: 0;">אפקטים קוליים (Web Audio API)</label>
              <input type="checkbox" id="settings-sound-toggle" ${profile.soundEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-glow);">
            </div>

            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1.5rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; color: #ff3366;">איפוס נתונים והתחלה מחדש:</span>
              <button class="btn btn-danger" id="btn-reset-data" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                מחק הכל ואפס מאגר
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" id="btn-save-settings">שמור הגדרות ✓</button>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('settings-modal-backdrop');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.bindEvents();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;');
  }

  bindEvents() {
    const backdrop = document.getElementById('settings-modal-backdrop');
    const closeBtn = document.getElementById('btn-close-settings-modal');
    const providerSelect = document.getElementById('settings-ai-provider');
    const geminiSection = document.getElementById('gemini-settings-section');
    const groqSection = document.getElementById('groq-settings-section');
    const testBtn = document.getElementById('btn-test-ai-key');
    const statusSpan = document.getElementById('ai-test-status');
    const saveBtn = document.getElementById('btn-save-settings');
    const resetBtn = document.getElementById('btn-reset-data');

    const close = () => {
      backdrop.classList.remove('open');
      setTimeout(() => backdrop.remove(), 250);
    };

    closeBtn.addEventListener('click', close);

    providerSelect.addEventListener('change', () => {
      const p = providerSelect.value;
      geminiSection.style.display = p === 'gemini' ? 'block' : 'none';
      groqSection.style.display = p === 'groq' ? 'block' : 'none';
    });

    testBtn.addEventListener('click', async () => {
      statusSpan.innerText = 'בודק...';
      statusSpan.style.color = 'var(--text-muted)';

      // Temporarily update config to test
      this.app.aiService.updateConfig({
        provider: providerSelect.value,
        geminiApiKey: document.getElementById('settings-gemini-key').value.trim(),
        geminiModel: document.getElementById('settings-gemini-model').value.trim(),
        groqApiKey: document.getElementById('settings-groq-key').value.trim(),
        groqModel: document.getElementById('settings-groq-model').value.trim()
      });

      try {
        await this.app.settingsController.testAIConnection();
        statusSpan.innerText = '✓ חיבור תקין בהצלחה!';
        statusSpan.style.color = '#00ff9d';
      } catch (err) {
        statusSpan.innerText = `✕ שגיאה: ${err.message}`;
        statusSpan.style.color = '#ff3366';
      }
    });

    saveBtn.addEventListener('click', async () => {
      const data = {
        provider: providerSelect.value,
        geminiApiKey: document.getElementById('settings-gemini-key').value,
        geminiModel: document.getElementById('settings-gemini-model').value,
        groqApiKey: document.getElementById('settings-groq-key').value,
        groqModel: document.getElementById('settings-groq-model').value,
        defaultSprintMinutes: document.getElementById('settings-sprint-minutes').value,
        soundEnabled: document.getElementById('settings-sound-toggle').checked
      };

      await this.app.settingsController.saveSettings(data);
      close();
      this.app.views.updateHeaderStats();
    });

    resetBtn.addEventListener('click', async () => {
      if (confirm('האם אתה בטוח שברצונך לאפס את כל ההתקדמות והמילים למצב התחלתי?')) {
        await this.app.settingsController.resetAllData();
      }
    });
  }
}

window.SettingsModalView = SettingsModalView;
