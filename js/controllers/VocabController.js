/**
 * VocabController
 * Manages repository of vocabulary words, file ingestion, search, and mistake banks.
 */
class VocabController {
  constructor(app) {
    this.app = app;
    this.words = [];
  }

  async loadInitialData() {
    // 1. Try loading from storage
    const storedWords = await this.app.storage.getAll('vocabulary');
    if (storedWords && storedWords.length > 0) {
      this.words = storedWords.map(w => new Word(w));
    } else {
      // 2. Load from defaultVocab.js
      if (window.DEFAULT_VOCABULARY && window.DEFAULT_VOCABULARY.length > 0) {
        this.words = window.DEFAULT_VOCABULARY.map(w => new Word(w));
        await this.app.storage.saveAll('vocabulary', this.words.map(w => w.toJSON()));
      }
    }

    this.app.srsService.setWords(this.words);
    return this.words;
  }

  async saveWord(word) {
    const idx = this.words.findIndex(w => w.id === word.id);
    if (idx !== -1) {
      this.words[idx] = word;
      await this.app.storage.set(`word_${word.id}`, word.toJSON());
      // Periodically sync collection
      this.syncStorage();
    }
  }

  async syncStorage() {
    await this.app.storage.saveAll('vocabulary', this.words.map(w => w.toJSON()));
  }

  /**
   * Upload and parse new file (PDF / TXT / Paste)
   */
  async handleFileUpload(file, onProgress) {
    onProgress('פותח את הקובץ ומחלץ טקסט גולמי...');
    const rawText = await FileParserService.readFileAsText(file);

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('לא זוהה טקסט בקובץ שהועלה.');
    }

    onProgress('שולח את הטקסט למנוע ה-AI לעיבוד תרחישים...');
    const newItems = await this.app.aiService.parseAndGenerateVocab(rawText, onProgress);

    if (!newItems || newItems.length === 0) {
      throw new Error('הניתוח הסתיים ללא מילים חדשות.');
    }

    // Merge with existing
    const existingWordsMap = new Map(this.words.map(w => [w.word.toLowerCase(), w]));
    let addedCount = 0;
    let updatedCount = 0;

    newItems.forEach(item => {
      const lower = item.word.toLowerCase();
      if (existingWordsMap.has(lower)) {
        // enrich existing
        const existing = existingWordsMap.get(lower);
        if (item.swipeCards) existing.swipeCards = item.swipeCards;
        if (item.chatChallenge) existing.chatChallenge = item.chatChallenge;
        if (item.translation_he) existing.translation_he = item.translation_he;
        updatedCount++;
      } else {
        const newWord = new Word({
          ...item,
          source: 'upload'
        });
        this.words.unshift(newWord);
        addedCount++;
      }
    });

    await this.syncStorage();
    this.app.srsService.setWords(this.words);
    return { addedCount, updatedCount, total: newItems.length };
  }

  getMistakes() {
    return this.words.filter(w => w.stats.isMistake || w.stats.masteryScore < 60);
  }

  search(query, filter = 'all') {
    const q = (query || '').toLowerCase().trim();
    return this.words.filter(w => {
      const matchText = !q || w.word.toLowerCase().includes(q) || w.translation_he.includes(q);
      if (!matchText) return false;

      if (filter === 'mistakes') return w.stats.isMistake || w.stats.masteryScore < 60;
      if (filter === 'mastered') return w.stats.masteryScore >= 80;
      if (filter === 'learning') return w.stats.seen > 0 && w.stats.masteryScore < 80;
      if (filter === 'new') return w.stats.seen === 0;
      return true;
    });
  }
}

window.VocabController = VocabController;
