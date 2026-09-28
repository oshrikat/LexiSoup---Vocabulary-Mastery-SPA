/**
 * GameSession Model
 * Encapsulates the live state of a game run (Sprint, Swipe, Chat, or Time Bomb)
 */
class GameSession {
  constructor(mode = 'sprint', durationSeconds = 300) {
    this.id = `sess_${Date.now()}`;
    this.mode = mode; // 'sprint', 'swipe', 'chat', 'timebomb', 'review'
    this.durationSeconds = durationSeconds; // default 5 minutes
    this.timeRemaining = durationSeconds;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.multiplier = 1.0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.history = []; // { wordId, word, questionType, correct, pointsAwarded, timestamp }
    this.startTime = Date.now();
    this.endTime = null;
    this.isCompleted = false;
  }

  recordAnswer(word, isCorrect, basePoints = 100, questionType = 'unknown') {
    if (isCorrect) {
      this.streak += 1;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      this.correctCount += 1;

      // Dynamic combo multiplier: 1x -> 1.5x -> 2x -> 3x
      if (this.streak >= 10) this.multiplier = 3.0;
      else if (this.streak >= 5) this.multiplier = 2.0;
      else if (this.streak >= 3) this.multiplier = 1.5;
      else this.multiplier = 1.0;

      const points = Math.round(basePoints * this.multiplier);
      this.score += points;

      this.history.push({
        wordId: word.id,
        word: word.word,
        translation_he: word.translation_he,
        isCorrect: true,
        pointsAwarded: points,
        questionType,
        timestamp: Date.now()
      });

      return { points, multiplier: this.multiplier, streak: this.streak };
    } else {
      this.streak = 0;
      this.multiplier = 1.0;
      this.wrongCount += 1;

      this.history.push({
        wordId: word.id,
        word: word.word,
        translation_he: word.translation_he,
        isCorrect: false,
        pointsAwarded: 0,
        questionType,
        timestamp: Date.now()
      });

      return { points: 0, multiplier: 1.0, streak: 0 };
    }
  }

  get accuracy() {
    const total = this.correctCount + this.wrongCount;
    if (total === 0) return 0;
    return Math.round((this.correctCount / total) * 100);
  }

  finish() {
    this.endTime = Date.now();
    this.isCompleted = true;
    return {
      id: this.id,
      mode: this.mode,
      duration: Math.round((this.endTime - this.startTime) / 1000),
      score: this.score,
      accuracy: this.accuracy,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      maxStreak: this.maxStreak,
      history: this.history
    };
  }
}

window.GameSession = GameSession;
