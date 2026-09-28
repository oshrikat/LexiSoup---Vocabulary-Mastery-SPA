/**
 * SwipeGameView
 * Tinder-style rapid card swipe view for contextual vocabulary verification.
 */
class SwipeGameView extends BaseView {
  constructor(app, containerId) {
    super(app, containerId);
    this.currentCardData = null;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.cardEl = null;
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  showCard(word) {
    // Pick one swipe card from word
    const cards = word.swipeCards && word.swipeCards.length > 0 
      ? word.swipeCards 
      : [{
          sentence: `In modern technical systems, the concept of '${word.word}' plays an indispensable strategic role.`,
          isCorrect: true,
          explanation: `שימוש נכון: המילה מתארת '${word.translation_he}'.`
        }];

    this.currentCardData = cards[Math.floor(Math.random() * cards.length)];
    this.renderCard(word, this.currentCardData);
  }

  renderCard(word, cardData) {
    // Highlight word in sentence
    const regex = new RegExp(`\\b(${word.word})\\b`, 'gi');
    const highlightedSentence = cardData.sentence.replace(regex, '<span class="highlight">$1</span>');

    const html = `
      <div class="swipe-arena animate-pop">
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

        <!-- Card Deck -->
        <div class="swipe-deck" id="swipe-deck">
          <div class="swipe-card" id="active-swipe-card">
            <div class="swipe-indicator like" id="indicator-like">מדויק ✓</div>
            <div class="swipe-indicator nope" id="indicator-nope">שגוי ✕</div>

            <div class="card-top">
              <div class="card-target-word">${this.escapeHtml(word.word)}</div>
              <div class="card-translation-badge">${this.escapeHtml(word.translation_he)}</div>
            </div>

            <div class="card-sentence-box">
              "${highlightedSentence}"
            </div>

            <div class="card-prompt-hint">
              האם המילה משובצת בהקשר הנכון במשפט? (גרור או השתמש בחצים)
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="swipe-actions-bar">
          <button class="action-circle-btn btn-wrong" id="btn-swipe-left" title="שימוש שגוי (חץ שמאלה)">
            ✕
          </button>
          <div style="font-size: 0.85rem; color: var(--text-dim); text-align: center;">
            מקשי חצים במקלדת<br>◄ שגוי | נכון ►
          </div>
          <button class="action-circle-btn btn-right" id="btn-swipe-right" title="שימוש מדויק (חץ ימינה)">
            ✓
          </button>
        </div>

        <div id="explanation-container"></div>
      </div>
    `;

    this.render(html);
    this.initCardInteractions();
    window.addEventListener('keydown', this.boundKeyDown);
  }

  initCardInteractions() {
    this.cardEl = document.getElementById('active-swipe-card');
    const likeIndicator = document.getElementById('indicator-like');
    const nopeIndicator = document.getElementById('indicator-nope');

    if (!this.cardEl) return;

    // Mouse & Touch drag handling
    const startDrag = (x) => {
      this.isDragging = true;
      this.startX = x;
      this.currentX = x;
      this.cardEl.style.transition = 'none';
    };

    const moveDrag = (x) => {
      if (!this.isDragging) return;
      this.currentX = x;
      const deltaX = this.currentX - this.startX;
      const rot = deltaX * 0.08;

      this.cardEl.style.transform = `translate(${deltaX}px, ${Math.abs(deltaX) * 0.1}px) rotate(${rot}deg)`;

      if (deltaX > 40) {
        likeIndicator.style.opacity = Math.min(1, (deltaX - 40) / 80);
        nopeIndicator.style.opacity = 0;
      } else if (deltaX < -40) {
        nopeIndicator.style.opacity = Math.min(1, (Math.abs(deltaX) - 40) / 80);
        likeIndicator.style.opacity = 0;
      } else {
        likeIndicator.style.opacity = 0;
        nopeIndicator.style.opacity = 0;
      }
    };

    const endDrag = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const deltaX = this.currentX - this.startX;

      this.cardEl.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
      if (deltaX > 100) {
        this.submitSwipe(true); // User says correct
      } else if (deltaX < -100) {
        this.submitSwipe(false); // User says incorrect
      } else {
        // Reset card to center
        this.cardEl.style.transform = 'translate(0, 0) rotate(0)';
        likeIndicator.style.opacity = 0;
        nopeIndicator.style.opacity = 0;
      }
    };

    this.cardEl.addEventListener('mousedown', (e) => startDrag(e.clientX));
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
    window.addEventListener('mouseup', endDrag);

    this.cardEl.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend', endDrag);

    // Click button handlers
    document.getElementById('btn-swipe-right')?.addEventListener('click', () => this.submitSwipe(true));
    document.getElementById('btn-swipe-left')?.addEventListener('click', () => this.submitSwipe(false));
    document.getElementById('btn-quit-session')?.addEventListener('click', () => {
      window.removeEventListener('keydown', this.boundKeyDown);
      this.app.gameController.endSession('user_quit');
    });
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.submitSwipe(true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.submitSwipe(false);
    }
  }

  submitSwipe(userClaimCorrect) {
    window.removeEventListener('keydown', this.boundKeyDown);
    if (!this.currentCardData || !this.cardEl) return;

    this.app.audio.playSwipe();

    const actualIsCorrect = this.currentCardData.isCorrect;
    const isPlayerRight = (userClaimCorrect === actualIsCorrect);

    // Card exit animation
    this.cardEl.classList.add(userClaimCorrect ? 'swipe-out-right' : 'swipe-out-left');

    // Notify game controller
    this.app.gameController.handleAnswer(isPlayerRight, 100, 'swipe');

    // Show explanation banner
    const banner = document.getElementById('explanation-container');
    if (banner) {
      banner.innerHTML = `
        <div class="card-explanation-banner ${isPlayerRight ? 'correct' : 'incorrect'}">
          <strong>${isPlayerRight ? '🎯 פגיעה מדויקת!' : '❌ לא הפעם...'}</strong>
          <p style="margin-top: 0.3rem;">${this.escapeHtml(this.currentCardData.explanation)}</p>
        </div>
      `;
    }

    // Advance to next after slight pause
    setTimeout(() => {
      this.app.gameController.nextQuestion();
    }, 1200);
  }
}

window.SwipeGameView = SwipeGameView;
