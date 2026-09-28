/**
 * SpacedRepetitionService
 * Intelligent scheduler implementing Leitner/SM-2 spaced repetition principles.
 * Delivers the "Vegetable Soup" blend: mistakes + due reviews + fresh words.
 */
class SpacedRepetitionService {
  constructor(words = []) {
    this.words = words;
  }

  setWords(words) {
    this.words = words;
  }

  /**
   * Generates a curated queue of words for a rapid session.
   * @param {number} targetCount - number of words needed for the session
   * @param {string} mode - 'sprint', 'review', or game specific
   */
  getSessionQueue(targetCount = 15, mode = 'sprint') {
    if (!this.words || this.words.length === 0) return [];

    if (mode === 'review') {
      const mistakes = this.words.filter(w => w.stats.isMistake || w.stats.masteryScore < 60);
      mistakes.sort((a, b) => a.stats.masteryScore - b.stats.masteryScore);
      if (mistakes.length >= targetCount) {
        return mistakes.slice(0, targetCount);
      }
      // Fill remaining with lowest mastery words
      const sortedByMastery = [...this.words].sort((a, b) => a.stats.masteryScore - b.stats.masteryScore);
      return sortedByMastery.slice(0, targetCount);
    }

    // Default "Vegetable Soup" Blend:
    // 1. High priority: Active mistakes & critical reviews
    const mistakePool = this.words.filter(w => w.stats.isMistake || w.stats.masteryScore < 50);
    // 2. Scheduled reviews
    const duePool = this.words.filter(w => !w.stats.isMistake && w.isDueForReview && w.stats.seen > 0);
    // 3. New words
    const freshPool = this.words.filter(w => w.stats.seen === 0);
    // 4. Stable review words
    const regularPool = this.words.filter(w => w.stats.seen > 0);

    const queue = [];
    const neededMistakes = Math.min(mistakePool.length, Math.ceil(targetCount * 0.4));
    const neededDue = Math.min(duePool.length, Math.ceil(targetCount * 0.3));
    const neededFresh = Math.min(freshPool.length, Math.ceil(targetCount * 0.3));

    // Shuffle helper
    const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

    queue.push(...shuffle(mistakePool).slice(0, neededMistakes));
    queue.push(...shuffle(duePool).slice(0, neededDue));
    queue.push(...shuffle(freshPool).slice(0, neededFresh));

    // If still below target, fill from regular words
    if (queue.length < targetCount) {
      const remainingNeeded = targetCount - queue.length;
      const existingIds = new Set(queue.map(w => w.id));
      const pool = shuffle(this.words.filter(w => !existingIds.has(w.id)));
      queue.push(...pool.slice(0, remainingNeeded));
    }

    return shuffle(queue);
  }

  getMetrics() {
    const total = this.words.length;
    if (total === 0) return { mastered: 0, learning: 0, newWords: 0, mistakesCount: 0, avgMastery: 0 };

    let mastered = 0;
    let learning = 0;
    let newWords = 0;
    let mistakesCount = 0;
    let totalScore = 0;

    this.words.forEach(w => {
      totalScore += w.stats.masteryScore;
      if (w.stats.isMistake) mistakesCount++;
      if (w.stats.seen === 0) newWords++;
      else if (w.stats.masteryScore >= 80) mastered++;
      else learning++;
    });

    return {
      total,
      mastered,
      learning,
      newWords,
      mistakesCount,
      avgMastery: Math.round(totalScore / total)
    };
  }
}

window.SpacedRepetitionService = SpacedRepetitionService;
