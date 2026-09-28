/**
 * LocalRuleProvider
 * Offline NLP heuristic generator and offline simulation chat tutor.
 */
class LocalRuleProvider extends BaseLLMProvider {
  async testConnection() {
    return true;
  }

  async parseAndGenerateVocab(rawText, onProgress = () => {}) {
    onProgress('מחלץ צמדי מילים ותרגום באמצעות מנוע מקומי חכם...');
    
    const pairs = FileParserService.extractWordPairsLocally(rawText);
    if (pairs.length === 0) {
      throw new Error('לא זוהו צמדי מילים בפורמט מוכר (לדוגמה: Word | תרגום). נסה להזין מפתח Gemini לניתוח שפה חופשית.');
    }

    onProgress(`נמצאו ${pairs.length} מילים. יוצר תרחישי משחק והקשרים...`);

    const result = pairs.slice(0, 50).map((pair, idx) => {
      const w = pair.word;
      const t = pair.translation_he;
      
      const otherWords = pairs.filter(p => p.word !== w).map(p => p.word);
      const opts = [w, ...otherWords.slice(0, 3)];
      while (opts.length < 4) opts.push(`term_${opts.length}`);
      opts.sort(() => 0.5 - Math.random());

      return {
        word: w,
        translation_he: t,
        definition: `Denoting ${w} in corporate and modern communication.`,
        category: 'רשימה אישית',
        synonyms: [t, `term related to ${w}`],
        swipeCards: [
          {
            sentence: `The team decided that '${w}' was essential for the project's strategic roadmap.`,
            isCorrect: true,
            explanation: `שימוש מדויק! המילה '${w}' מתאימה להקשר של '${t}'.`
          },
          {
            sentence: `Because he completely misunderstood '${w}', he believed it meant the exact opposite of '${t}'.`,
            isCorrect: false,
            explanation: `שימוש שגוי! המילה '${w}' מתארת '${t}' ולא ההפך הגמור.`
          }
        ],
        chatChallenge: {
          sender: "יוסי (Lead Developer)",
          message: `In our next architectural review, we should definitely focus on _______ (${t}).`,
          options: opts,
          correctIndex: opts.indexOf(w)
        }
      };
    });

    return result;
  }

  async sendChatMessage(conversationHistory, targetWords = []) {
    // Interactive local demo replies
    const randomWord = targetWords[Math.floor(Math.random() * targetWords.length)] || { word: 'accelerate', translation_he: 'להאיץ' };
    const simulatedReplies = [
      `Hey there! Good to chat with you. In our team standup, someone mentioned we really need to **${randomWord.word}** (${randomWord.translation_he}) our workflow. Have you ever felt that on your projects?`,
      `Interesting! Speaking of which, how would you approach handling an unexpected **conundrum** when the deadline is close?`,
      `That makes total sense! Building high **resilience** into your daily routine is key. By the way, how comfortable do you feel using **${randomWord.word}** in conversation?`,
      `Awesome response! Keep it up. Want to try using **${randomWord.word}** in a quick sentence? (טיפ: כדי לקבל בינה מלאכותית דינמית חיה בזמן אמת, מומלץ להזין מפתח Gemini חינם בהגדרות ⚙️).`
    ];

    const turn = conversationHistory.length;
    return simulatedReplies[turn % simulatedReplies.length];
  }
}

window.LocalRuleProvider = LocalRuleProvider;
