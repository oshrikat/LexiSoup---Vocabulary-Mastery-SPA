/**
 * ViewCoordinator
 * Single entry point coordinating views, HUD updates, modal popups, and tab navigation.
 */
class ViewCoordinator {
  constructor(app) {
    this.app = app;
    this.dashboardView = new DashboardView(app, 'app-root');
    this.swipeGameView = new SwipeGameView(app, 'app-root');
    this.chatGameView = new ChatGameView(app, 'app-root');
    this.timeBombGameView = new TimeBombGameView(app, 'app-root');
    this.vocabListView = new VocabListView(app, 'app-root');
    this.uploadModalView = new UploadModalView(app);
    this.settingsModalView = new SettingsModalView(app);
    this.currentTab = 'home';
  }

  showDashboard() {
    this.currentTab = 'home';
    this.updateTabHighlight();
    this.updateHeaderStats();
    this.dashboardView.renderDashboard();
  }

  showVocabList() {
    this.currentTab = 'vocab';
    this.updateTabHighlight();
    this.vocabListView.renderList();
  }

  showSwipeQuestion(word) {
    this.swipeGameView.showCard(word);
  }

  showChatQuestion(word) {
    this.chatGameView.showChat(word);
  }

  showTimeBombQuestion(word) {
    this.timeBombGameView.showTimeBomb(word);
  }

  showUploadModal() {
    this.uploadModalView.show();
  }

  showSettingsModal() {
    this.settingsModalView.show();
  }

  updateSessionTimer(secondsRemaining, totalSeconds) {
    const el = document.getElementById('hud-timer');
    if (!el) return;
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    el.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (secondsRemaining <= 30) {
      el.style.color = '#ff3366';
      el.style.borderColor = '#ff3366';
    } else {
      el.style.color = '#ffffff';
      el.style.borderColor = 'var(--border-color)';
    }
  }

  updateLiveScore(score, streak, multiplier) {
    const scoreEl = document.getElementById('hud-score-val');
    const streakEl = document.getElementById('hud-streak-val');
    const multEl = document.getElementById('hud-multiplier-val');

    if (scoreEl) scoreEl.innerText = score;
    if (streakEl) streakEl.innerText = streak;
    if (multEl) multEl.innerText = `x${multiplier.toFixed(1)}`;
  }

  updateHeaderStats() {
    const profile = this.app.userProfile;
    const streakEl = document.getElementById('nav-streak-count');
    const xpEl = document.getElementById('nav-xp-count');
    const levelEl = document.getElementById('nav-level-count');

    if (streakEl) streakEl.innerText = profile.dailyStreak;
    if (xpEl) xpEl.innerText = profile.totalXP;
    if (levelEl) levelEl.innerText = `רמה ${profile.level}`;
  }

  updateTabHighlight() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
    });
  }

  showSessionSummary(summary, levelData) {
    const html = `
      <div class="session-summary-card animate-pop">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
        <h2 style="font-size: 1.8rem; font-weight: 800;">הספרינט הושלם בהצלחה!</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          קצב למידה גבוה והטמעה מובלעת בתת-המודע.
        </p>

        <div class="summary-score-large">+${summary.score} XP</div>

        <div class="summary-stats-grid">
          <div class="summary-stat-box">
            <div class="stat-val">${summary.accuracy}%</div>
            <div class="stat-label">דיוק תשובות</div>
          </div>
          <div class="summary-stat-box">
            <div class="stat-val">${summary.correctCount} / ${summary.correctCount + summary.wrongCount}</div>
            <div class="stat-label">תשובות נכונות</div>
          </div>
          <div class="summary-stat-box">
            <div class="stat-val">${summary.maxStreak} 🔥</div>
            <div class="stat-label">רצף שיא (Combo)</div>
          </div>
        </div>

        ${levelData.leveledUp ? `
          <div style="background: rgba(0, 255, 157, 0.15); border: 1px solid #00ff9d; border-radius: var(--radius-md); padding: 0.8rem; margin-bottom: 1.5rem; color: #a7ffdb; font-weight: 700;">
            🎉 עלית לרמה ${levelData.level}! תואר חדש: ${this.app.userProfile.rankTitle}
          </div>
        ` : ''}

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="btn-summary-home">
            <span>חזרה ללוח הבקרה</span>
            <span>🏠</span>
          </button>
          <button class="btn btn-primary" id="btn-summary-again">
            <span>ספרינט נוסף</span>
            <span>⚡</span>
          </button>
        </div>
      </div>
    `;

    this.dashboardView.render(html);

    document.getElementById('btn-summary-home')?.addEventListener('click', () => {
      this.showDashboard();
    });

    document.getElementById('btn-summary-again')?.addEventListener('click', () => {
      this.app.gameController.startSession('sprint', this.app.userProfile.defaultSprintMinutes);
    });
  }
}

window.ViewCoordinator = ViewCoordinator;
