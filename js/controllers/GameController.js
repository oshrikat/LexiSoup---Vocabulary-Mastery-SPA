/**
 * GameController
 * Orchestrates rapid-fire gameplay sessions, mini-games, score, streaks,
 * and adaptive color theme transitions.
 */
class GameController {
  constructor(app) {
    this.app = app;
    this.currentSession = null;
    this.timerInterval = null;
    this.currentWord = null;
    this.currentChallenge = null;
    this.queue = [];
    this.queueIndex = 0;
  }

  /**
   * Starts a game session
   * @param {string} mode - 'sprint', 'swipe', 'chat', 'timebomb', 'review'
   * @param {number} durationMinutes - session duration (default 5)
   */
  startSession(mode = 'sprint', durationMinutes = 5) {
    const durationSeconds = durationMinutes * 60;
    this.currentSession = new GameSession(mode, durationSeconds);

    // Queue selection via SpacedRepetitionService
    const count = mode === 'sprint' ? 25 : (mode === 'review' ? 20 : 15);
    this.queue = this.app.srsService.getSessionQueue(count, mode);
    this.queueIndex = 0;

    if (this.queue.length === 0) {
      alert('לא נמצאו מילים זמינות להפעלה. אנא ודא שמאגר המילים טעון.');
      return false;
    }

    this.startTimer();
    this.nextQuestion();
    this.updateAdaptiveUI();
    return true;
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (!this.currentSession) return;
      this.currentSession.timeRemaining -= 1;

      // Update timer in UI
      this.app.views.updateSessionTimer(this.currentSession.timeRemaining, this.currentSession.durationSeconds);

      if (this.currentSession.timeRemaining <= 10 && this.currentSession.timeRemaining > 0) {
        this.app.audio.playTick();
      }

      if (this.currentSession.timeRemaining <= 0) {
        this.endSession('timeup');
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  nextQuestion() {
    if (this.queueIndex >= this.queue.length) {
      // Loop or finish
      this.endSession('completed');
      return;
    }

    this.currentWord = this.queue[this.queueIndex];
    this.queueIndex += 1;

    // Pick question type based on mode
    let qType = this.currentSession.mode;
    if (qType === 'sprint' || qType === 'review') {
      const types = ['swipe', 'chat', 'timebomb'];
      qType = types[Math.floor(Math.random() * types.length)];
    }

    this.currentChallenge = {
      type: qType,
      word: this.currentWord
    };

    // Render corresponding view
    switch (qType) {
      case 'swipe':
        this.app.views.showSwipeQuestion(this.currentWord);
        break;
      case 'chat':
        this.app.views.showChatQuestion(this.currentWord);
        break;
      case 'timebomb':
        this.app.views.showTimeBombQuestion(this.currentWord);
        break;
      default:
        this.app.views.showSwipeQuestion(this.currentWord);
        break;
    }

    this.updateAdaptiveUI();
  }

  handleAnswer(isCorrect, basePoints = 100, questionType = 'unknown') {
    if (!this.currentSession || !this.currentWord) return;

    // Record in Word model (SRS)
    this.currentWord.recordResult(isCorrect);
    this.app.vocabController.saveWord(this.currentWord);

    // Record in Session model
    const result = this.currentSession.recordAnswer(this.currentWord, isCorrect, basePoints, questionType);

    // Audio SFX
    if (isCorrect) {
      this.app.audio.playCorrect();
    } else {
      this.app.audio.playWrong();
    }

    // Dynamic UI feedback & Adaptive accent
    this.app.views.updateLiveScore(this.currentSession.score, result.streak, result.multiplier);
    this.updateAdaptiveUI();

    return result;
  }

  updateAdaptiveUI() {
    if (!this.currentSession) return;
    const streak = this.currentSession.streak;
    const accuracy = this.currentSession.accuracy;

    // Subtle adaptive glow based on user performance:
    // Cyan (#00f0ff) -> Violet (#b026ff) -> Emerald Fire (#00ff9d) -> Amber (#ffaa00)
    let themeColor = '#00f0ff';
    let themeName = 'neon-cyan';

    if (streak >= 7) {
      themeColor = '#00ff9d'; // Emerald God-mode streak
      themeName = 'emerald-fire';
    } else if (streak >= 4) {
      themeColor = '#b026ff'; // Electric Violet combo
      themeName = 'electric-violet';
    } else if (accuracy < 50 && this.currentSession.wrongCount >= 2) {
      themeColor = '#ff5e00'; // Amber focus
      themeName = 'amber-focus';
    }

    document.documentElement.style.setProperty('--accent-glow', themeColor);
    document.body.dataset.adaptiveTheme = themeName;
  }

  async endSession(reason = 'completed') {
    this.stopTimer();
    if (!this.currentSession) return;

    const summary = this.currentSession.finish();

    // Award XP to user
    const xpEarned = summary.score;
    const levelData = this.app.userProfile.addXP(xpEarned);
    this.app.userProfile.lifetimeStats.sessionsPlayed += 1;
    this.app.userProfile.lifetimeStats.totalCorrect += summary.correctCount;
    this.app.userProfile.lifetimeStats.totalWrong += summary.wrongCount;

    if (levelData.leveledUp) {
      this.app.audio.playLevelUp();
    }

    // Save session & user profile
    await this.app.storage.set('user_profile', this.app.userProfile.toJSON());
    const existingSessions = (await this.app.storage.get('sessions_history')) || [];
    existingSessions.unshift(summary);
    await this.app.storage.set('sessions_history', existingSessions.slice(0, 50));

    // Show summary view
    this.app.views.showSessionSummary(summary, levelData);
    this.currentSession = null;
  }
}

window.GameController = GameController;
