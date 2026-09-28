/**
 * AITutorChatView
 * Interactive conversational AI language mentor.
 * Chats casually with the user, weaves target words into everyday scenarios,
 * and tests natural vocabulary comprehension.
 */
class AITutorChatView extends BaseView {
  constructor(app, containerId) {
    super(app, containerId);
    this.history = [];
    this.targetWords = [];
    this.isWaitingResponse = false;
  }

  show() {
    const allWords = this.app.vocabController.words || [];
    const mistakes = this.app.vocabController.getMistakes();
    const pool = mistakes.length >= 5 ? mistakes : allWords;
    this.targetWords = [...pool].sort(() => 0.5 - Math.random()).slice(0, 6);

    if (this.history.length === 0) {
      const firstTarget = this.targetWords[0]?.word || 'resilience';
      this.history.push({
        role: 'model',
        text: `Hey Oshri! Great to see you. How's everything going with your code and projects today? By the way, have you ever faced an unexpected **${firstTarget}** or challenge recently?`
      });
    }

    this.renderChatInterface();
  }

  renderChatInterface() {
    const isGeminiReady = Boolean(this.app.userProfile.aiConfig.geminiApiKey);

    const html = `
      <div class="ai-tutor-container animate-pop" style="max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; height: calc(100vh - 170px); min-height: 520px;">
        
        <!-- Header -->
        <div class="glass-panel" style="padding: 1rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; border-color: var(--border-glow);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-full); background: linear-gradient(135deg, var(--accent-glow), var(--accent-violet)); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 0 15px var(--border-glow);">
              🤖
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <h3 style="font-size: 1.15rem; font-weight: 800;">אלכס • מנטור השפה האישי שלך (AI)</h3>
                <span class="badge" style="background: rgba(0, 255, 157, 0.15); color: #00ff9d; font-size: 0.7rem;">מחובר עכשיו</span>
              </div>
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                שיחת יום-יום חופשית • שזירת מילים מתקדמות בהקשר טבעי
              </span>
            </div>
          </div>

          <button class="btn btn-secondary" id="btn-tutor-settings" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;" title="הגדרות API">
            ⚙️ הגדרות AI
          </button>
        </div>

        <!-- Target Words Pill Tray -->
        <div style="background: rgba(18, 22, 36, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.6rem 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; overflow-x: auto; white-space: nowrap;">
          <span style="font-size: 0.75rem; color: var(--text-dim); font-weight: 700;">מילות יעד לשיחה:</span>
          ${this.targetWords.map(w => `
            <span class="badge" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--accent-glow); font-size: 0.8rem;" title="${this.escapeHtml(w.translation_he)}: ${this.escapeHtml(w.definition || '')}">
              ${this.escapeHtml(w.word)} (${this.escapeHtml(w.translation_he)})
            </span>
          `).join('')}
        </div>

        ${!isGeminiReady ? `
          <div style="background: rgba(255, 157, 0, 0.1); border: 1px solid rgba(255, 157, 0, 0.3); border-radius: var(--radius-sm); padding: 0.5rem 0.85rem; margin-bottom: 0.75rem; font-size: 0.8rem; color: #ffbe4d; display: flex; justify-content: space-between; align-items: center;">
            <span>💡 <strong>טיפ:</strong> כרגע פועל במצב סימולציה. הזן מפתח Gemini API (חינם) בהגדרות לשיחה אינטראקטיבית חכמה בזמן אמת.</span>
            <button id="btn-quick-open-settings" style="background: none; border: underline; color: #fff; cursor: pointer; font-size: 0.8rem; font-weight: bold; padding: 0;">הגדר עכשיו</button>
          </div>
        ` : ''}

        <!-- Chat Messages Flow -->
        <div class="glass-panel" id="tutor-chat-messages" style="flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; border-radius: var(--radius-md); background: #0a0d17;">
          ${this.history.map(msg => this.renderMessageBubble(msg)).join('')}
          <div id="tutor-typing-indicator" style="display: none;">
            <div class="chat-bubble incoming" style="padding: 0.6rem 1rem; width: fit-content; display: flex; gap: 0.3rem; align-items: center;">
              <span style="font-size: 0.8rem; color: var(--text-dim);">אלכס מקליד/ה...</span>
              <div style="width: 6px; height: 6px; background: var(--accent-glow); border-radius: 50%; animation: typingDot 1.4s infinite ease-in-out;"></div>
              <div style="width: 6px; height: 6px; background: var(--accent-glow); border-radius: 50%; animation: typingDot 1.4s infinite ease-in-out 0.2s;"></div>
              <div style="width: 6px; height: 6px; background: var(--accent-glow); border-radius: 50%; animation: typingDot 1.4s infinite ease-in-out 0.4s;"></div>
            </div>
          </div>
        </div>

        <!-- Quick Reply Chips -->
        <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.5rem 0; margin-top: 0.5rem;">
          <button class="btn btn-secondary quick-prompt-btn" data-prompt="I had a pretty busy day coding. What does ${this.targetWords[0]?.word || 'this word'} mean in plain English?" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
            מה הפירוש של ${this.targetWords[0]?.word || 'המילה'}?
          </button>
          <button class="btn btn-secondary quick-prompt-btn" data-prompt="Things are going great! We had a team meeting earlier to discuss our project timeline." style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
            הכל טוב, בדיוק סיימתי פגישת צוות
          </button>
          <button class="btn btn-secondary quick-prompt-btn" data-prompt="Could you give me another realistic sentence with ${this.targetWords[1]?.word || 'these words'}?" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
            תן לי עוד דוגמה שימושית
          </button>
        </div>

        <!-- Input Bar -->
        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; align-items: center;">
          <input type="text" id="tutor-user-input" class="form-input" style="flex: 1; padding: 0.85rem 1.15rem; font-size: 1rem; direction: ltr; text-align: left;" 
                 placeholder="Type your response in English (e.g. 'Yeah, I had to troubleshoot latency...')...">
          
          <button class="btn btn-primary" id="btn-tutor-send" style="padding: 0.85rem 1.4rem;">
            <span>שלח</span>
            <span>➤</span>
          </button>
        </div>
      </div>
    `;

    this.render(html);
    this.scrollToBottom();
    this.bindEvents();
  }

  renderMessageBubble(msg) {
    const isModel = msg.role === 'model';
    const formattedText = this.escapeHtml(msg.text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color: var(--accent-glow); text-shadow: 0 0 10px rgba(0,240,255,0.4);">$1</strong>')
      .replace(/\n/g, '<br>');

    if (isModel) {
      return `
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; max-width: 85%;">
          <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: linear-gradient(135deg, var(--accent-glow), var(--accent-violet)); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
            🤖
          </div>
          <div class="chat-bubble incoming" style="direction: ltr; text-align: left; line-height: 1.5;">
            ${formattedText}
          </div>
        </div>
      `;
    } else {
      return `
        <div style="display: flex; justify-content: flex-end; width: 100%;">
          <div class="chat-bubble outgoing" style="max-width: 80%; direction: ltr; text-align: left; line-height: 1.5;">
            ${formattedText}
          </div>
        </div>
      `;
    }
  }

  scrollToBottom() {
    const box = document.getElementById('tutor-chat-messages');
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }

  bindEvents() {
    const input = document.getElementById('tutor-user-input');
    const sendBtn = document.getElementById('btn-tutor-send');

    const handleSend = async () => {
      const text = input.value.trim();
      if (!text || this.isWaitingResponse) return;

      input.value = '';
      this.history.push({ role: 'user', text });
      this.renderNewMessage({ role: 'user', text });

      this.isWaitingResponse = true;
      const indicator = document.getElementById('tutor-typing-indicator');
      if (indicator) indicator.style.display = 'block';
      this.scrollToBottom();

      try {
        const reply = await this.app.aiService.sendChatMessage(this.history, this.targetWords);
        this.history.push({ role: 'model', text: reply });
        
        this.app.userProfile.addXP(25);
        this.app.views.updateHeaderStats();

        if (indicator) indicator.style.display = 'none';
        this.renderNewMessage({ role: 'model', text: reply });
        this.app.audio.playCorrect();
      } catch (err) {
        if (indicator) indicator.style.display = 'none';
        this.renderNewMessage({
          role: 'model',
          text: `שגיאה בתקשורת עם ה-AI: ${err.message}. אנא ודא שהמפתח תקין בהגדרות.`
        });
        this.app.audio.playWrong();
      } finally {
        this.isWaitingResponse = false;
        this.scrollToBottom();
      }
    };

    sendBtn?.addEventListener('click', handleSend);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });

    document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (input) {
          input.value = btn.dataset.prompt;
          input.focus();
        }
      });
    });

    document.getElementById('btn-tutor-settings')?.addEventListener('click', () => {
      this.app.views.showSettingsModal();
    });

    document.getElementById('btn-quick-open-settings')?.addEventListener('click', () => {
      this.app.views.showSettingsModal();
    });
  }

  renderNewMessage(msg) {
    const box = document.getElementById('tutor-chat-messages');
    const indicator = document.getElementById('tutor-typing-indicator');
    if (box && indicator) {
      const bubbleHtml = this.renderMessageBubble(msg);
      indicator.insertAdjacentHTML('beforebegin', bubbleHtml);
      this.scrollToBottom();
    }
  }
}

window.AITutorChatView = AITutorChatView;
