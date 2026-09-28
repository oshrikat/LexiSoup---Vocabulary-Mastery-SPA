/**
 * DashboardView
 * Home view displaying retention metrics, quick sprint launcher, and mini-game cards.
 */
class DashboardView extends BaseView {
  renderDashboard() {
    const metrics = this.app.srsService.getMetrics();
    const profile = this.app.userProfile;
    const mistakes = this.app.vocabController.getMistakes();

    const html = `
      <div class="dashboard-container animate-pop">
        <!-- Hero Section: Daily Rapid Sprint -->
        <div class="glass-panel hero-banner" style="margin-bottom: 2rem; border-color: var(--border-glow); position: relative; overflow: hidden;">
          <div style="position: absolute; left: -20px; top: -20px; width: 150px; height: 150px; background: radial-gradient(circle, var(--border-glow) 0%, transparent 70%); opacity: 0.3; pointer-events: none;"></div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span class="badge" style="background: rgba(0, 240, 255, 0.15); color: var(--accent-glow); border: 1px solid var(--border-glow);">
                  ⚡ למידה מובלעת (Implicit Learning)
                </span>
                <span class="badge" style="background: rgba(255, 157, 0, 0.15); color: #ff9d00;">
                  רצף ${profile.dailyStreak} ימים 🔥
                </span>
              </div>
              <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem;">
                ספרינט שינון יומי (5-10 דקות)
              </h2>
              <p style="color: var(--text-muted); font-size: 1rem; max-width: 550px; line-height: 1.5;">
                מנות קצרות של תרחישים אמיתיים מהעולם התאגידי והטכנולוגי. 
                בלי כרטיסיות משעממות — רק סווייפים מהירים, צ'אטים דחופים וחידות הקשר.
              </p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.75rem; min-width: 200px;">
              <button class="btn btn-primary btn-lg" id="btn-start-sprint" style="width: 100%;">
                <span>התחל ספרינט עכשיו</span>
                <span style="font-size: 1.3rem;">🚀</span>
              </button>
              ${mistakes.length > 0 ? `
                <button class="btn btn-danger" id="btn-start-review" style="width: 100%;">
                  <span>סבב שיפור ציון (${mistakes.length} טעויות)</span>
                  <span>🎯</span>
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
          <div class="glass-panel" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent-glow);">${metrics.total}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem;">אוצר מילים במאגר</div>
          </div>
          <div class="glass-panel" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent-emerald);">${metrics.mastered}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem;">מילים שהוטמעו (מאסטרי 80%+)</div>
          </div>
          <div class="glass-panel" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 900; color: #ffaa00;">${metrics.learning}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem;">בתהליך הטמעה פעיל</div>
          </div>
          <div class="glass-panel" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 900; color: #ff3366;">${metrics.mistakesCount}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem;">טעויות ממתינות לתיקון</div>
          </div>
        </div>

        <!-- Mini-Games Selection -->
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>משחקי מיני ממוקדים (מרק הירקות)</span>
          <span style="font-size: 1rem; color: var(--text-muted); font-weight: 400;">בחר מוד משחק ספציפי</span>
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <!-- Game 1: Context Swipe -->
          <div class="glass-panel" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg);">
            <div>
              <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🃏</div>
              <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 0.5rem;">סווייפ הקשרים (Context Swipe)</h4>
              <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem;">
                בסגנון טינדר: קרא משפט תאגידי אמיתי. סווייפ ימינה אם המילה מנוסחת בהקשר מדויק, שמאלה אם יש סתירה לשונית.
              </p>
            </div>
            <button class="btn btn-secondary" id="btn-launch-swipe" style="width: 100%;">
              <span>שחק סווייפ</span>
              <span>👈 👉</span>
            </button>
          </div>

          <!-- Game 2: SMS Chat -->
          <div class="glass-panel" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg);">
            <div>
              <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💬</div>
              <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 0.5rem;">סימולטור צ'אט (Corporate SMS)</h4>
              <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem;">
                קולגות ב-Slack שולחים הודעות דחופות. השלם את המילה החסרה כדי לשמור על מקצועיות ומהירות תגובה.
              </p>
            </div>
            <button class="btn btn-secondary" id="btn-launch-chat" style="width: 100%;">
              <span>פתח צ'אט</span>
              <span>📱</span>
            </button>
          </div>

          <!-- Game 3: Time Bomb -->
          <div class="glass-panel" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg);">
            <div>
              <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💣</div>
              <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 0.5rem;">פצצת זמן (Synonym Blitz)</h4>
              <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem;">
                הפתיל בוער! התאם במהירות את המונח או הנרדף המקביל לפני שהפצצה מתפוצצת. קצב אדרנלין גבוה.
              </p>
            </div>
            <button class="btn btn-secondary" id="btn-launch-timebomb" style="width: 100%;">
              <span>נטרל פצצה</span>
              <span>⏱️</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.render(html);
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-start-sprint')?.addEventListener('click', () => {
      this.app.gameController.startSession('sprint', this.app.userProfile.defaultSprintMinutes);
    });

    document.getElementById('btn-start-review')?.addEventListener('click', () => {
      this.app.gameController.startSession('review', this.app.userProfile.defaultSprintMinutes);
    });

    document.getElementById('btn-launch-swipe')?.addEventListener('click', () => {
      this.app.gameController.startSession('swipe', 3);
    });

    document.getElementById('btn-launch-chat')?.addEventListener('click', () => {
      this.app.gameController.startSession('chat', 3);
    });

    document.getElementById('btn-launch-timebomb')?.addEventListener('click', () => {
      this.app.gameController.startSession('timebomb', 3);
    });
  }
}

window.DashboardView = DashboardView;
