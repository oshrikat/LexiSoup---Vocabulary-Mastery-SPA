/**
 * DashboardView
 * Home view displaying retention metrics, prep mode launcher, AI tutor shortcut,
 * and mini-game cards.
 */
class DashboardView extends BaseView {
  renderDashboard() {
    const metrics = this.app.srsService.getMetrics();
    const profile = this.app.userProfile;
    const mistakes = this.app.vocabController.getMistakes();

    const html = `
      <div class="dashboard-container animate-pop">
        
        <!-- Two-Stage Learning Architecture Banner -->
        <div class="glass-panel hero-banner" style="margin-bottom: 2rem; border-color: var(--border-glow); position: relative; overflow: hidden;">
          <div style="position: absolute; left: -20px; top: -20px; width: 160px; height: 160px; background: radial-gradient(circle, var(--border-glow) 0%, transparent 70%); opacity: 0.25; pointer-events: none;"></div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                <span class="badge" style="background: rgba(0, 240, 255, 0.15); color: var(--accent-glow); border: 1px solid var(--border-glow);">
                  ⚡ למידה מובלעת בשני שלבים (Prep & Test)
                </span>
                <span class="badge" style="background: rgba(255, 157, 0, 0.15); color: #ff9d00;">
                  רצף ${profile.dailyStreak} ימים 🔥
                </span>
              </div>
              <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem;">
                ברוך הבא למרק המילים, אושרי!
              </h2>
              <p style="color: var(--text-muted); font-size: 1rem; max-width: 580px; line-height: 1.5;">
                <strong>שלב 1:</strong> עשה היכרות מקדימה עם המילים, הפירושים ומשפטי הדוגמה.<br>
                <strong>שלב 2:</strong> קפוץ למשחקי הבדיקה (סווייפ, צ'אט ופצצת זמן) כדי לבחון את הזיכרון בתת-המודע.
              </p>
            </div>

            <!-- Main Primary Action Buttons -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem; min-width: 230px;">
              <button class="btn btn-primary btn-lg" id="btn-start-prep" style="width: 100%; box-shadow: 0 0 25px rgba(0, 240, 255, 0.35);">
                <span>שלב היכרות מקדים (10 מילים)</span>
                <span style="font-size: 1.3rem;">📖</span>
              </button>

              <button class="btn btn-secondary" id="btn-start-sprint" style="width: 100%;">
                <span>התחל משחקי בדיקה (ספרינט)</span>
                <span>🚀</span>
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

        <!-- AI Assistant & Lexicon Quick Access Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 2rem;">
          <!-- Card A: AI Personal Tutor -->
          <div class="glass-panel" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(176, 38, 255, 0.4); background: linear-gradient(135deg, rgba(22, 28, 45, 0.8), rgba(40, 20, 60, 0.4)); padding: 1.25rem 1.5rem; cursor: pointer;" id="card-launch-tutor">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="font-size: 2.2rem; background: rgba(176, 38, 255, 0.2); width: 50px; height: 50px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(176, 38, 255, 0.5);">
                🤖
              </div>
              <div>
                <h4 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 0.2rem;">עוזר אישי AI (שיחת יום-יום)</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                  שיחה פתוחה עם מנטור ששוזר מילים באלגנטיות ובודק אם הבנת.
                </p>
              </div>
            </div>
            <button class="btn btn-secondary" style="border-color: var(--accent-violet); color: var(--accent-violet); flex-shrink: 0;">
              שוחח עכשיו 💬
            </button>
          </div>

          <!-- Card B: Full Lexicon / Dictionary -->
          <div class="glass-panel" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(0, 255, 157, 0.4); background: linear-gradient(135deg, rgba(22, 28, 45, 0.8), rgba(15, 45, 30, 0.4)); padding: 1.25rem 1.5rem; cursor: pointer;" id="card-launch-lexicon">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="font-size: 2.2rem; background: rgba(0, 255, 157, 0.2); width: 50px; height: 50px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0, 255, 157, 0.5);">
                📖
              </div>
              <div>
                <h4 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 0.2rem;">לקסיקון: כל המילים והפירושים</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                  צפייה בטבלה מלאה, חיפוש מיידי והדפסת כל 300 המילים.
                </p>
              </div>
            </div>
            <button class="btn btn-secondary" style="border-color: var(--accent-emerald); color: var(--accent-emerald); flex-shrink: 0;">
              פתח רשימה 📋
            </button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div class="glass-panel" style="text-align: center; padding: 1.2rem;">
            <div style="font-size: 2rem; font-weight: 900; color: var(--accent-glow);">${metrics.total}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">אוצר מילים במאגר</div>
          </div>
          <div class="glass-panel" style="text-align: center; padding: 1.2rem;">
            <div style="font-size: 2rem; font-weight: 900; color: var(--accent-emerald);">${metrics.mastered}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">מילים שהוטמעו (80%+)</div>
          </div>
          <div class="glass-panel" style="text-align: center; padding: 1.2rem;">
            <div style="font-size: 2rem; font-weight: 900; color: #ffaa00;">${metrics.learning}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">בתהליך למידה</div>
          </div>
          <div class="glass-panel" style="text-align: center; padding: 1.2rem;">
            <div style="font-size: 2rem; font-weight: 900; color: #ff3366;">${metrics.mistakesCount}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">טעויות ממתינות לתיקון</div>
          </div>
        </div>

        <!-- Mini-Games Section -->
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>משחקי בדיקה מהירים (השלב שבוחן אותך)</span>
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
          <!-- Game 1: Context Swipe -->
          <div class="glass-panel" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg);">
            <div>
              <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🃏</div>
              <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.4rem;">סווייפ הקשרים (Context Swipe)</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin-bottom: 1rem;">
                בסגנון טינדר: קרא משפט תאגידי. סווייפ ימינה אם המילה מנוסחת בהקשר מדויק, שמאלה אם יש סתירה.
              </p>
            </div>
            <button class="btn btn-secondary" id="btn-launch-swipe" style="width: 100%;">
              <span>שחק סווייפ 👈 👉</span>
            </button>
          </div>

          <!-- Game 2: SMS Chat -->
          <div class="glass-panel" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg);">
            <div>
              <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">💬</div>
              <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.4rem;">סימולטור צ'אט ארגוני (Corporate Slack)</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin-bottom: 1rem;">
                הקולגות שולחים הודעות דחופות. השלם את המילה החסרה כדי לשמור על מקצועיות.
              </p>
            </div>
            <button class="btn btn-secondary" id="btn-launch-chat" style="width: 100%;">
              <span>פתח צ'אט 📱</span>
            </button>
          </div>

          <!-- Game 3: Time Bomb -->
          <div class="glass-panel" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg);">
            <div>
              <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">💣</div>
              <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.4rem;">פצצת זמן ונרדפים (Synonym Blitz)</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin-bottom: 1rem;">
                הפתיל בוער! התאם במהירות את המונח או הנרדף המקביל לפני שהפצצה מתפוצצת.
              </p>
            </div>
            <button class="btn btn-secondary" id="btn-launch-timebomb" style="width: 100%;">
              <span>נטרל פצצה ⏱️</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.render(html);
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-start-prep')?.addEventListener('click', () => {
      this.app.views.showPrepMode();
    });

    document.getElementById('btn-start-sprint')?.addEventListener('click', () => {
      this.app.gameController.startSession('sprint', this.app.userProfile.defaultSprintMinutes);
    });

    document.getElementById('btn-start-review')?.addEventListener('click', () => {
      this.app.gameController.startSession('review', this.app.userProfile.defaultSprintMinutes);
    });

    document.getElementById('card-launch-tutor')?.addEventListener('click', () => {
      this.app.views.showAITutor();
    });

    document.getElementById('card-launch-lexicon')?.addEventListener('click', () => {
      this.app.views.showVocabList();
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
