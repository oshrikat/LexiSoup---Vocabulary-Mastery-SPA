/**
 * UserProfile Model
 * Manages player overall progress, level, XP, daily streak, and settings.
 */
class UserProfile {
  constructor(data = {}) {
    this.totalXP = data.totalXP || 0;
    this.level = data.level || 1;
    this.dailyStreak = data.dailyStreak || 1;
    this.lastActiveDate = data.lastActiveDate || new Date().toISOString().split('T')[0];
    this.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
    this.hapticsEnabled = data.hapticsEnabled !== undefined ? data.hapticsEnabled : true;
    this.defaultSprintMinutes = data.defaultSprintMinutes || 5;
    
    // AI Settings
    this.aiConfig = {
      provider: data.aiConfig?.provider || 'gemini', // 'gemini', 'groq', 'local'
      geminiApiKey: data.aiConfig?.geminiApiKey || '',
      geminiModel: data.aiConfig?.geminiModel || 'gemini-1.5-flash',
      groqApiKey: data.aiConfig?.groqApiKey || '',
      groqModel: data.aiConfig?.groqModel || 'llama-3.3-70b-versatile'
    };

    // Lifetime Stats
    this.lifetimeStats = {
      sessionsPlayed: data.lifetimeStats?.sessionsPlayed || 0,
      wordsMastered: data.lifetimeStats?.wordsMastered || 0,
      totalCorrect: data.lifetimeStats?.totalCorrect || 0,
      totalWrong: data.lifetimeStats?.totalWrong || 0
    };

    this.updateDailyStreak();
  }

  addXP(points) {
    this.totalXP += points;
    // Level formula: level = floor(sqrt(XP / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(this.totalXP / 100)) + 1;
    const leveledUp = newLevel > this.level;
    this.level = newLevel;
    return { currentXP: this.totalXP, level: this.level, leveledUp };
  }

  get rankTitle() {
    if (this.level >= 20) return 'מאסטר ורבלי עליון (Lexical Sovereign)';
    if (this.level >= 15) return 'ארכיטקט שפה עתידני (Cyber Linguist)';
    if (this.level >= 10) return 'מומחה ניבים מתקדם (Advanced Fluent)';
    if (this.level >= 5)  return 'סוכן שפה תאגידי (Corporate Verbalist)';
    return 'מתלמד לשוני (Linguistic Initiate)';
  }

  updateDailyStreak() {
    const today = new Date().toISOString().split('T')[0];
    if (this.lastActiveDate === today) {
      return;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.lastActiveDate === yesterday) {
      this.dailyStreak += 1;
    } else {
      // Missed more than a day
      this.dailyStreak = 1;
    }
    this.lastActiveDate = today;
  }

  toJSON() {
    return {
      totalXP: this.totalXP,
      level: this.level,
      dailyStreak: this.dailyStreak,
      lastActiveDate: this.lastActiveDate,
      soundEnabled: this.soundEnabled,
      hapticsEnabled: this.hapticsEnabled,
      defaultSprintMinutes: this.defaultSprintMinutes,
      aiConfig: this.aiConfig,
      lifetimeStats: this.lifetimeStats
    };
  }
}

window.UserProfile = UserProfile;
