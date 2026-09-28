/**
 * FileParserService
 * Client-side file reader capable of parsing plain TXT, CSV, clipboard text,
 * and extracting raw text from PDFs directly in the browser.
 */
class FileParserService {
  /**
   * Reads a File object and extracts clean text
   * @param {File} file
   * @returns {Promise<string>}
   */
  static async readFileAsText(file) {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return await this.extractPdfText(file);
    } else {
      return await this.readPlainText(file);
    }
  }

  static readPlainText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('שגיאה בקריאת הקובץ'));
      reader.readAsText(file, 'utf-8');
    });
  }

  /**
   * Lightweight client-side PDF text parser
   * Extracts text streams from binary PDF without heavy server dependency
   */
  static async extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert bytes to string to search for text blocks
    let rawText = '';
    const decoder = new TextDecoder('latin1');
    const pdfContent = decoder.decode(bytes);

    // Look for text operators in PDF: BT ... ET blocks and parenthesis strings (text)
    const textMatches = [];
    const regex = /\(([^)]+)\)\s*T[jJ]/g;
    let match;
    while ((match = regex.exec(pdfContent)) !== null) {
      const str = match[1]
        .replace(/\\([()\\])/g, '$1')
        .replace(/\\r/g, ' ')
        .replace(/\\n/g, ' ');
      if (str.trim().length > 0) {
        textMatches.push(str.trim());
      }
    }

    if (textMatches.length > 20) {
      rawText = textMatches.join(' ');
      return rawText;
    }

    // Fallback: extract readable ASCII & UTF-8 chunks
    const cleanChunks = pdfContent.match(/[A-Za-z\u0590-\u05FF0-9\-–—|:,.\s]{3,}/g) || [];
    return cleanChunks.join('\n');
  }

  /**
   * Quick heuristic extractor for word/translation pairs (e.g. Word | Translation)
   */
  static extractWordPairsLocally(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const pairs = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check for 'word | translation' or 'word - translation'
      if (line.includes('|') || line.includes(' - ') || line.includes(':')) {
        const sep = line.includes('|') ? '|' : (line.includes(' - ') ? ' - ' : ':');
        const parts = line.split(sep);
        if (parts.length >= 2) {
          const w = parts[0].trim();
          const t = parts.slice(1).join(' ').trim();
          if (w.length > 1 && t.length > 1) {
            pairs.push({ word: w, translation_he: t });
          }
        }
      } else if (i + 1 < lines.length && (lines[i+1].startsWith('|') || lines[i+1].startsWith('-'))) {
        const w = line;
        const t = lines[i+1].replace(/^[|\-:]\s*/, '').trim();
        if (w.length > 1 && t.length > 1) {
          pairs.push({ word: w, translation_he: t });
          i++;
        }
      }
    }

    return pairs;
  }
}

window.FileParserService = FileParserService;
