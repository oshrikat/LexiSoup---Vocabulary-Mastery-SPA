/**
 * GeminiProvider
 * Connects directly to Google Gemini API (v1beta) using JSON schema generation and Conversational Chat.
 */
class GeminiProvider extends BaseLLMProvider {
  constructor(apiKey = '', model = 'gemini-1.5-flash') {
    super(apiKey, model);
  }

  async testConnection() {
    if (!this.apiKey) throw new Error('נא להזין מפתח Gemini API תקין בהגדרות');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with the single word: "OK"' }] }]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `שגיאת חיבור ל-Gemini API (סטטוס ${res.status})`);
    }
    return true;
  }

  async parseAndGenerateVocab(rawText, onProgress = () => {}) {
    if (!this.apiKey) {
      throw new Error('חסר מפתח Gemini API. אנא פתח את ההגדרות והזן את המפתח שלך.');
    }

    onProgress('מתחבר ל-Gemini API ומנתח את אוצר המילים...');

    const prompt = `
You are an expert curriculum designer for an elite vocabulary app called LexiSoup.
Your philosophy is "Implicit Learning" (hiding vegetables in soup).
Analyze the following vocabulary text or document content.
Extract the distinct advanced/corporate English vocabulary terms (limit to the most prominent 15-25 words if the text is huge).
For each word:
1. Provide accurate Hebrew translation.
2. English definition.
3. Two swipe challenge sentences:
   - One where the word is used CORRECTLY in a natural corporate/modern tech context.
   - One where the word is used INCORRECTLY (e.g. opposite meaning, awkward semantic clash).
   - A concise Hebrew explanation explaining the nuance.
4. An SMS/Slack chat scenario:
   - sender name and title (e.g., "אביעד (Tech Lead)", "מאיה (VP Product)")
   - message containing an empty blank "_______" where this target word naturally fits
   - 4 multiple-choice options (the correct word and 3 plausible distractors)
   - correctIndex (0-3)
5. 2-3 concise English synonyms or related terms.

Respond ONLY with a valid JSON array of objects conforming to this schema:
[
  {
    "word": "string",
    "translation_he": "string",
    "definition": "string",
    "category": "Corporate & Tech",
    "synonyms": ["string", "string"],
    "swipeCards": [
      {
        "sentence": "string",
        "isCorrect": true,
        "explanation": "הסבר בעברית מדוע השימוש מדויק"
      },
      {
        "sentence": "string",
        "isCorrect": false,
        "explanation": "הסבר בעברית מדוע השימוש שגוי"
      }
    ],
    "chatChallenge": {
      "sender": "string",
      "message": "string with _______",
      "options": ["wordA", "wordB", "wordC", "wordD"],
      "correctIndex": 0
    }
  }
]

Document content to analyze:
"""
${rawText.slice(0, 15000)}
"""
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    onProgress('מייצר אתגרים אינטראקטיביים ותרחישי צ\'אט...');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `שגיאה מ-Gemini API: ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('לא התקבלה תשובה מ-Gemini.');
    }

    try {
      const parsedArray = JSON.parse(candidateText);
      onProgress(`הצלחה! נוצרו ${parsedArray.length} מילים עשירות בהקשר.`);
      return parsedArray;
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output:', candidateText);
      throw new Error('פלט ה-JSON שהתקבל מ-Gemini לא היה תקין.');
    }
  }

  async sendChatMessage(conversationHistory, targetWords = []) {
    if (!this.apiKey) {
      throw new Error('חסר מפתח Gemini API. נא להזין מפתח בהגדרות (סמל גלגל השיניים ⚙️) כדי לשוחח עם העוזר האישי.');
    }

    const wordsListStr = targetWords.map(w => `• "${w.word}" (${w.translation_he}): ${w.definition || ''}`).join('\n');

    const systemPrompt = `
You are Alex, an elite, witty and warm conversational AI language mentor in the LexiSoup app.
Your user is Oshri, a software developer and tech enthusiast practicing advanced corporate and professional English.
Your goal is to have a casual, natural everyday conversation (like two colleagues or friends talking over coffee or Slack), while elegantly weaving in target vocabulary words and checking if Oshri understands them naturally.

Target vocabulary words you can practice:
${wordsListStr}

Behavior Guidelines:
1. Speak mainly in natural conversational English. Friendly, modern, upbeat tech colleague tone.
2. Weave 1 or 2 target vocabulary words into your message in bold (e.g. **resilience**, **mitigate**, **conundrum**).
3. Connect the word to a realistic everyday or tech scenario and ask a casual question to engage Oshri (e.g., "How was your day? We had an **abysmal** network latency earlier, did you ever have to troubleshoot something like that?").
4. If Oshri uses one of the target words or shows clear comprehension, compliment him warmly (e.g., "Spot on! That's how a pro uses **mitigate**! 🔥 (+50 XP)").
5. If Oshri asks what a word means or seems confused, explain the nuance kindly and concisely in Hebrew/English with a simple example.
6. Keep each of your responses concise (2 to 4 sentences max) to keep the chat fast, snappy, and fun.
`;

    // Build Gemini contents
    const contents = [];
    
    // First message with system context
    let isFirst = true;
    for (const msg of conversationHistory) {
      const role = (msg.role === 'user') ? 'user' : 'model';
      let text = msg.text;
      if (isFirst && role === 'user') {
        text = `[System Instruction: ${systemPrompt}]\n\n${text}`;
        isFirst = false;
      }
      contents.push({
        role: role,
        parts: [{ text: text }]
      });
    }

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `[System Instruction: ${systemPrompt}]\n\nStart the conversation with a friendly greeting and weave in 1-2 words from our list!` }]
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350
        }
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `שגיאת תקשורת עם Gemini API (${res.status})`);
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('לא התקבלה תשובה מ-Gemini.');
    return reply.trim();
  }
}

window.GeminiProvider = GeminiProvider;
