/**
 * Word Model
 * Represents a single vocabulary item and its mastery/retention tracking data.
 */
class Word {
  constructor(data = {}) {
    this.id = data.id || `w_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.word = data.word || '';
    this.translation_he = data.translation_he || '';
    this.definition = data.definition || '';
    this.synonyms = Array.isArray(data.synonyms) ? data.synonyms : [];
    this.category = data.category || 'כללי';
    this.source = data.source || 'default'; // 'default', 'upload', 'custom'

    // Interactive Game Challenges
    this.swipeCards = Array.isArray(data.swipeCards) ? data.swipeCards : [];
    this.chatChallenge = data.chatChallenge || null;
    this.synonymChallenge = data.synonymChallenge || null;

    // Retention & Spaced Repetition (SRS)
    this.stats = {
      seen: data.stats?.seen || 0,
      correct: data.stats?.correct || 0,
      wrong: data.stats?.wrong || 0,
      masteryScore: data.stats?.masteryScore || 0, // 0 - 100%
      streak: data.stats?.streak || 0,
      intervalDays: data.stats?.intervalDays || 1,
      easeFactor: data.stats?.easeFactor || 2.5,
      lastReviewed: data.stats?.lastReviewed || null,
      nextReviewTimestamp: data.stats?.nextReviewTimestamp || Date.now(),
      isMistake: data.stats?.isMistake || false
    };
  }

  /**
   * Records a response and adjusts SRS mastery score using lightweight SM-2 algorithm
   * @param {boolean} isCorrect - whether user answer was correct
   */
  recordResult(isCorrect) {
    this.stats.seen += 1;
    this.stats.lastReviewed = new Date().toISOString();

    if (isCorrect) {
      this.stats.correct += 1;
      this.stats.streak += 1;
      this.stats.isMistake = false;

      // Adjust mastery
      this.stats.masteryScore = Math.min(100, this.stats.masteryScore + (this.stats.streak >= 3 ? 25 : 15));

      // SM-2 Interval progression
      if (this.stats.streak === 1) {
        this.stats.intervalDays = 1;
      } else if (this.stats.streak === 2) {
        this.stats.intervalDays = 3;
      } else {
        this.stats.intervalDays = Math.round(this.stats.intervalDays * this.stats.easeFactor);
      }
      this.stats.easeFactor = Math.min(2.8, this.stats.easeFactor + 0.1);
    } else {
      this.stats.wrong += 1;
      this.stats.streak = 0;
      this.stats.isMistake = true;

      // Penalize mastery
      this.stats.masteryScore = Math.max(0, this.stats.masteryScore - 20);
      this.stats.intervalDays = 1;
      this.stats.easeFactor = Math.max(1.3, this.stats.easeFactor - 0.2);
    }

    // Next scheduled review
    this.stats.nextReviewTimestamp = Date.now() + (this.stats.intervalDays * 24 * 60 * 60 * 1000);
    return this.stats.masteryScore;
  }

  get isDueForReview() {
    return Date.now() >= (this.stats.nextReviewTimestamp || 0);
  }

  toJSON() {
    return {
      id: this.id,
      word: this.word,
      translation_he: this.translation_he,
      definition: this.definition,
      synonyms: this.synonyms,
      category: this.category,
      source: this.source,
      swipeCards: this.swipeCards,
      chatChallenge: this.chatChallenge,
      synonymChallenge: this.synonymChallenge,
      stats: this.stats
    };
  }
}

// Make accessible to window
window.Word = Word;
