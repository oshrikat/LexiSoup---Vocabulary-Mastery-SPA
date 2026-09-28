/**
 * ChatGameView
 * Corporate SMS / Slack smartphone simulation where users fill in the blanks
 * to complete urgent executive and tech discussions.
 */
class ChatGameView extends BaseView {
  constructor(app, containerId) {
    super(app, containerId);
    this.currentChallenge = null;
  }

  showChat(word) {
    const challenge = word.chatChallenge || {
      sender: "נועה (Operations Lead)",
      message: `We need to focus on _______ (${word.translation_he}) in our Q4 roadmap.`,
      options: [word.word, "superficial", "contingency", "stagnation"],
      correctIndex: 0,
      targetWord: word.word
    };

    this.currentChallenge = challenge;
    this.renderChat(word, challenge);
  }

  renderChat(word, challenge) {
    const formattedMsg = challenge.message.replace(/_______/g, '<span class="blank-highlight">_______</span>');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const html = `
      <div class="chat-wrapper animate-pop" style="max-width: 480px; margin: 0 auto;">
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

        <!-- Phone Mockup Container -->
        <div class="chat-game-container">
          <div class="phone-status-bar">
            <span>9:41</span>
            <span>LTE 5G ■■■</span>
          </div>

          <div class="chat-contact-header">
            <div class="chat-avatar">💼</div>
            <div class="chat-contact-info">
              <h4>${this.escapeHtml(challenge.sender)}</h4>
              <span>מחובר/ת עכשיו (Slack)</span>
            </div>
          </div>

          <div class="chat-messages-area" id="chat-messages-box">
            <div class="chat-target-hint">
              רמז תרגום: <strong>"${this.escapeHtml(word.translation_he)}"</strong>
            </div>

            <!-- Incoming Colleague Message -->
            <div class="chat-bubble incoming">
              ${formattedMsg}
              <div style="font-size: 0.65rem; color: var(--text-dim); text-align: right; margin-top: 0.4rem;">
                ${nowTime}
              </div>
            </div>

            <div id="outgoing-container"></div>
          </div>

          <!-- Options Grid -->
          <div class="chat-options-panel" id="chat-options-panel">
            ${challenge.options.map((opt, idx) => `
              <button class="chat-option-chip" data-idx="${idx}">
                ${this.escapeHtml(opt)}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.render(html);
    this.bindOptionEvents(word, challenge);
  }

  bindOptionEvents(word, challenge) {
    document.getElementById('btn-quit-session')?.addEventListener('click', () => {
      this.app.gameController.endSession('user_quit');
    });

    const buttons = document.querySelectorAll('.chat-option-chip');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Disable all buttons to prevent double click
        buttons.forEach(b => b.style.pointerEvents = 'none');

        const selectedIdx = parseInt(btn.dataset.idx, 10);
        const isCorrect = (selectedIdx === challenge.correctIndex);

        if (isCorrect) {
          btn.classList.add('correct');
        } else {
          btn.classList.add('wrong');
          // Highlight correct button
          const correctBtn = document.querySelector(`.chat-option-chip[data-idx="${challenge.correctIndex}"]`);
          if (correctBtn) correctBtn.classList.add('correct');
        }

        // Simulate outgoing reply bubble
        const outgoingBox = document.getElementById('outgoing-container');
        if (outgoingBox) {
          const chosenWord = challenge.options[selectedIdx];
          outgoingBox.innerHTML = `
            <div class="chat-bubble outgoing animate-pop" style="margin-top: 0.5rem;">
              "${chosenWord}" בדיוק! כבר מעדכן את הצוות.
            </div>
          `;
        }

        // Notify Controller
        this.app.gameController.handleAnswer(isCorrect, 120, 'chat');

        setTimeout(() => {
          this.app.gameController.nextQuestion();
        }, 1300);
      });
    });
  }
}

window.ChatGameView = ChatGameView;
