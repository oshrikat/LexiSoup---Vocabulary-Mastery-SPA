/**
 * GroqProvider
 * Connects to Groq API (OpenAI-compatible) for ultra-fast LLM inference and Conversational Chat.
 */
class GroqProvider extends BaseLLMProvider {
  constructor(apiKey = '', model = 'llama-3.3-70b-versatile') {
    super(apiKey, model);
  }

  async testConnection() {
    if (!this.apiKey) throw new Error('נא להזין מפתח Groq API בהגדרות');
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: 'Say "OK"' }],
        max_tokens: 5
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `שגיאת חיבור ל-Groq API: ${res.status}`);
    }
    return true;
  }

  async parseAndGenerateVocab(rawText, onProgress = () => {}) {
    if (!this.apiKey) {
      throw new Error('חסר מפתח Groq API. אנא פתח את ההגדרות והזן את המפתח.');
    }

    onProgress('מתחבר ל-Groq Cloud ומעבד אוצר מילים במהירות גבוהה...');

    const prompt = `
Extract the key vocabulary items from this text. For each word, generate structured game items for the LexiSoup app.
Always respond with a strict JSON object: { "words": [ ... ] }
Each item in "words" must have:
- "word": English word
- "translation_he": Hebrew translation
- "definition": Short English definition
- "category": "Corporate & Tech"
- "synonyms": ["synonym1", "synonym2"]
- "swipeCards": [
    { "sentence": "...", "isCorrect": true, "explanation": "הסבר בעברית" },
    { "sentence": "...", "isCorrect": false, "explanation": "הסבר בעברית" }
  ]
- "chatChallenge": {
    "sender": "Colleague Name (Role)",
    "message": "sentence with _______",
    "options": ["opt1", "opt2", "opt3", "opt4"],
    "correctIndex": 0
  }

Text to process:
"""
${rawText.slice(0, 10000)}
"""
`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a JSON-only response engine. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.words || []);
  }

  async sendChatMessage(conversationHistory, targetWords = []) {
    if (!this.apiKey) {
      throw new Error('חסר מפתח Groq API. נא להזין מפתח בהגדרות כדי לשוחח.');
    }

    const wordsListStr = targetWords.map(w => `• "${w.word}" (${w.translation_he})`).join('\n');
    const systemPrompt = `
You are Alex, an elite and friendly AI language mentor for Oshri in the LexiSoup app.
Have a casual everyday conversation, elegantly weaving in 1-2 target vocabulary words in bold (e.g. **resilience**).
Target words:
${wordsListStr}
Be concise (2-4 sentences max), friendly, and test if Oshri understands. Compliment good usage!
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq API error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }
}

window.GroqProvider = GroqProvider;
