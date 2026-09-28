/**
 * PrepModeView
 * Pre-learning / Discovery stage where users preview words, Hebrew translations,
 * definitions, and real-world example sentences BEFORE being tested in mini-games.
 */
class PrepModeView extends BaseView {
  constructor(app, containerId) {
    super(app, containerId);
    this.wordsQueue = [];
    this.currentIndex = 0;
    this.batchSize = 10;
  }

  startPrep(words = null, batchSize = 10) {
    this.batchSize = batchSize;
    if (words && words.length > 0) {
      this.wordsQueue = [...words];
    } else {
      const allWords = this.app.vocabController.words || [];
      const unlearned = allWords.filter(w => w.stats.seen === 0);
      const pool = unlearned.length >= batchSize 
        ? unlearned 
        : [...allWords].sort((a, b) => a.stats.masteryScore - b.stats.masteryScore);
      
      this.wordsQueue = [...pool].sort(() => 0.5 - Math.random()).slice(0, batchSize);
    }

    this.currentIndex = 0;
    this.renderWordCard();
  }

  renderWordCard() {
    if (this.currentIndex >= this.wordsQueue.length) {
      this.renderCompletionScreen();
      return;
    }

    const word = this.wordsQueue[this.currentIndex];
    const total = this.wordsQueue.length;
    const currentNum = this.currentIndex + 1;
    const progressPct = Math.round((currentNum / total) * 100);

    const sentences = (word.swipeCards || []).map(sc => sc.sentence);
    if (sentences.length === 0) {
      sentences.push(`Understanding '${word.word}' is key in business and technical contexts.`);
    }

    const html = `
      <div class="prep-container animate-pop" style="max-width: 680px; margin: 0 auto;">
        <!-- Header & Progress -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <span class="badge" style="background: rgba(0, 240, 255, 0.15); color: var(--accent-glow); border: 1px solid var(--border-glow);">
              📖 שלב היכרות מקדים (Prep & Learn)
            </span>
          </div>
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted);">
            מילה ${currentNum} מתוך ${total} (${progressPct}%)
          </div>
        </div>

        <div class="mastery-bar-container" style="margin-bottom: 1.5rem; height: 8px;">
          <div class="mastery-bar-fill" style="width: ${progressPct}%;"></div>
        </div>

        <!-- Word Study Card -->
        <div class="glass-panel" style="padding: 2.2rem 2rem; border-radius: var(--radius-lg); border: 2px solid var(--border-glow); box-shadow: var(--shadow-neon); position: relative;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <h2 style="font-size: 2.4rem; font-weight: 900; color: var(--accent-glow); letter-spacing: 0.5px;">
                  ${this.escapeHtml(word.word)}
                </h2>
                <button class="icon-btn" id="btn-prep-speak" title="השמע הגייה" style="width: 38px; height: 38px; font-size: 1.1rem; border-color: var(--border-glow);">
                  🔊
                </button>
              </div>
              <div style="font-size: 1.4rem; font-weight: 700; color: #ffffff; margin-top: 0.35rem;">
                ${this.escapeHtml(word.translation_he)}
              </div>
            </div>

            <div style="text-align: left;">
              <span class="badge" style="background: rgba(255, 255, 255, 0.08); color: var(--text-muted); font-size: 0.8rem;">
                ${this.escapeHtml(word.category || 'Advanced')}
              </span>
            </div>
          </div>

          <!-- English Definition -->
          <div style="background: rgba(0, 0, 0, 0.25); border-left: 3px solid var(--accent-glow); padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1.5rem; direction: ltr; text-align: left;">
            <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.2rem;">Definition:</div>
            <div style="font-size: 1.05rem; color: var(--text-main); font-weight: 500;">
              ${this.escapeHtml(word.definition || 'Corporate / professional term')}
            </div>
          </div>

          <!-- Synonyms -->
          ${word.synonyms && word.synonyms.length > 0 ? `
            <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">מילים קשורות / נרדפים:</span>
              ${word.synonyms.map(s => `
                <span class="badge" style="background: rgba(255, 255, 255, 0.06); color: #00ff9d; font-size: 0.8rem;">${this.escapeHtml(s)}</span>
              `).join('')}
            </div>
          ` : ''}

          <!-- Example Sentences -->
          <div style="margin-bottom: 1.5rem;">
            <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>💡 איך משתמשים במילה זו במשפט אמיתי?</span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${sentences.map((sent) => {
                const regex = new RegExp(`\\b(${word.word})\\b`, 'gi');
                const highlighted = sent.replace(regex, '<strong style="color: var(--accent-glow); text-decoration: underline;">$1</strong>');
                return `
                  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem 1.1rem; direction: ltr; text-align: left; line-height: 1.5; font-size: 1.05rem;">
                    "${highlighted}"
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Footer Actions in Card -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.25rem; flex-wrap: wrap; gap: 1rem;">
            <button class="btn btn-secondary" id="btn-prep-prev" ${this.currentIndex === 0 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
              <span>◄ מילה קודמת</span>
            </button>

            <button class="btn btn-primary" id="btn-prep-next">
              <span>${currentNum === total ? 'סיום היכרות ✓' : 'הבנתי, המילה הבאה ►'}</span>
            </button>
          </div>
        </div>

        <!-- Exit / Skip to Game button -->
        <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem;">
          <button class="btn btn-secondary" id="btn-prep-quit" style="font-size: 0.85rem;">
            <span>חזרה ללוח הבקרה 🏠</span>
          </button>
          <button class="btn btn-success" id="btn-prep-jump-game" style="font-size: 0.85rem;">
            <span>דלג ישירות למשחק בדיקה (ספרינט) 🚀</span>
          </button>
        </div>
      </div>
    `;

    this.render(html);
    this.bindCardEvents(word);
  }

  bindCardEvents(word) {
    document.getElementById('btn-prep-speak')?.addEventListener('click', () => {
      this.speakWord(word.word);
    });

    document.getElementById('btn-prep-next')?.addEventListener('click', () => {
      this.app.audio.playSwipe();
      this.currentIndex++;
      this.renderWordCard();
    });

    document.getElementById('btn-prep-prev')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.renderWordCard();
      }
    });

    document.getElementById('btn-prep-quit')?.addEventListener('click', () => {
      this.app.views.showDashboard();
    });

    document.getElementById('btn-prep-jump-game')?.addEventListener('click', () => {
      this.launchTargetedTestGame();
    });
  }

  speakWord(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  renderCompletionScreen() {
    this.app.audio.playLevelUp();
    this.app.userProfile.addXP(50);
    this.app.storage.set('user_profile', this.app.userProfile.toJSON());

    const html = `
      <div class="glass-panel animate-pop" style="max-width: 560px; margin: 2rem auto; text-align: center; padding: 2.5rem 2rem; border-color: var(--accent-emerald);">
        <div style="font-size: 3.5rem; margin-bottom: 0.75rem;">🧠</div>
        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; color: #00ff9d;">
          סיימת את שלב ההיכרות!
        </h2>
        <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem;">
          עברת על <strong>${this.wordsQueue.length} מילים חדשות</strong>, ראית את הפירושים שלהן ומשפטים מציאותיים מהעולם התאגידי.<br>
          עכשיו המוח שלך ספג את ההקשר ומסוגל לזהות אותן במשחקי הבדיקה!
        </p>

        <div style="background: rgba(0, 255, 157, 0.1); border: 1px solid #00ff9d; border-radius: var(--radius-md); padding: 0.8rem; margin-bottom: 2rem; color: #a7ffdb; font-weight: 700;">
          +50 XP הוענקו על סיום שלב ההיכרות!
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          <button class="btn btn-primary btn-lg" id="btn-prep-finish-game" style="width: 100%;">
            <span>התחל משחקי בדיקה (ספרינט) על המילים האלו 🚀</span>
          </button>
          
          <button class="btn btn-secondary" id="btn-prep-finish-home" style="width: 100%;">
            <span>חזרה ללוח הבקרה 🏠</span>
          </button>
        </div>
      </div>
    `;

    this.render(html);

    document.getElementById('btn-prep-finish-game')?.addEventListener('click', () => {
      this.launchTargetedTestGame();
    });

    document.getElementById('btn-prep-finish-home')?.addEventListener('click', () => {
      this.app.views.showDashboard();
    });
  }

  launchTargetedTestGame() {
    this.app.gameController.currentSession = new GameSession('sprint', 300);
    this.app.gameController.queue = [...this.wordsQueue].sort(() => 0.5 - Math.random());
    this.app.gameController.queueIndex = 0;
    this.app.gameController.startTimer();
    this.app.gameController.nextQuestion();
    this.app.gameController.updateAdaptiveUI();
  }
}

window.PrepModeView = PrepModeView;
