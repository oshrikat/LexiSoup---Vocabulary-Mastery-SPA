/**
 * TimeBombGameView
 * Rapid-fire synonym match rush against a ticking explosive countdown.
 */
class TimeBombGameView extends BaseView {
  constructor(app, containerId) {
    super(app, containerId);
    this.bombTimer = null;
    this.secondsLeft = 15;
    this.totalSeconds = 15;
  }

  showTimeBomb(word) {
    const challenge = word.synonymChallenge || {
      prompt: `מה המשמעות של '${word.word}'?`,
      options: [word.translation_he, "סיום פעילות", "עיכוב זמני", "הסכם עקרוני"],
      correctIndex: 0,
      targetWord: word.word
    };

    this.renderBomb(word, challenge);
  }

  renderBomb(word, challenge) {
    this.clearBombTimer();
    this.secondsLeft = 15;
    this.totalSeconds = 15;

    const html = `
      <div class="timebomb-arena animate-pop">
        <!-- Live HUD Header -->
        <div class="game-hud" style="width: 100%;">
          <div class="hud-item hud-timer" id="hud-timer">05:00</div>
          <div class="hud-item hud-streak">
            <span>🔥</span>
            <span id="hud-streak-val">0</span>
            <span class="multiplier-tag" id="hud-multiplier-val">x1.0</span>
          </div>
          <div class="hud-item hud-score">
            <span>ניקוד:</span>
            <span id="hud-score-val">0</span>
          </div>
          <button class="icon-btn" id="btn-quit-session" title="סיים סשן" style="width: 32px; height: 32px;">✕</button>
        </div>

        <div class="bomb-visual">
          <div class="bomb-icon" id="bomb-icon">💣</div>
          <div style="font-family: var(--font-mono); font-size: 1.4rem; font-weight: 900; color: #ff3366;" id="bomb-seconds-display">
            15s
          </div>
          <div class="fuse-track">
            <div class="fuse-fill" id="fuse-fill"></div>
          </div>
        </div>

        <div class="bomb-target-card">
          <div class="bomb-target-word">${this.escapeHtml(word.word)}</div>
          <div class="bomb-target-prompt">
            בחר במהירות את המשמעות או הנרדף המדויק לפני שהפתיל נשרף!
          </div>
        </div>

        <div class="synonym-choices-grid" id="synonym-choices-grid">
          ${challenge.options.map((opt, idx) => `
            <button class="synonym-choice-btn" data-idx="${idx}">
              ${this.escapeHtml(opt)}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.render(html);
    this.startBombCountdown(word, challenge);
  }

  startBombCountdown(word, challenge) {
    const fuseFill = document.getElementById('fuse-fill');
    const secondsDisplay = document.getElementById('bomb-seconds-display');
    const bombIcon = document.getElementById('bomb-icon');

    document.getElementById('btn-quit-session')?.addEventListener('click', () => {
      this.clearBombTimer();
      this.app.gameController.endSession('user_quit');
    });

    const buttons = document.querySelectorAll('.synonym-choice-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.clearBombTimer();
        buttons.forEach(b => b.style.pointerEvents = 'none');

        const selectedIdx = parseInt(btn.dataset.idx, 10);
        const isCorrect = (selectedIdx === challenge.correctIndex);

        if (isCorrect) {
          btn.classList.add('correct');
          bombIcon.innerText = '✨'; // Defused!
          // Bonus points for speed
          const speedBonus = this.secondsLeft * 5;
          this.app.gameController.handleAnswer(true, 100 + speedBonus, 'timebomb');
        } else {
          btn.classList.add('wrong');
          const correctBtn = document.querySelector(`.synonym-choice-btn[data-idx="${challenge.correctIndex}"]`);
          if (correctBtn) correctBtn.classList.add('correct');
          this.app.gameController.handleAnswer(false, 0, 'timebomb');
        }

        setTimeout(() => {
          this.app.gameController.nextQuestion();
        }, 1200);
      });
    });

    this.bombTimer = setInterval(() => {
      this.secondsLeft -= 1;
      if (secondsDisplay) secondsDisplay.innerText = `${this.secondsLeft}s`;

      if (fuseFill) {
        const pct = (this.secondsLeft / this.totalSeconds) * 100;
        fuseFill.style.width = `${pct}%`;
        if (pct < 30) fuseFill.style.backgroundColor = '#ff0033';
        else if (pct < 60) fuseFill.style.backgroundColor = '#ffaa00';
      }

      if (this.secondsLeft <= 3 && this.secondsLeft > 0) {
        this.app.audio.playTick();
      }

      if (this.secondsLeft <= 0) {
        this.clearBombTimer();
        // Time expired! Explosion!
        this.app.audio.playExplosion();
        if (bombIcon) bombIcon.innerText = '💥';
        buttons.forEach(b => b.style.pointerEvents = 'none');
        const correctBtn = document.querySelector(`.synonym-choice-btn[data-idx="${challenge.correctIndex}"]`);
        if (correctBtn) correctBtn.classList.add('correct');

        this.app.gameController.handleAnswer(false, 0, 'timebomb');

        setTimeout(() => {
          this.app.gameController.nextQuestion();
        }, 1400);
      }
    }, 1000);
  }

  clearBombTimer() {
    if (this.bombTimer) {
      clearInterval(this.bombTimer);
      this.bombTimer = null;
    }
  }
}

window.TimeBombGameView = TimeBombGameView;
