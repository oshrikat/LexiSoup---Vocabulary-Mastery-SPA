/**
 * VocabListView
 * Searchable repository for all 300+ vocabulary words with dual-view mode
 * (Interactive Cards vs. Detailed Lexicon Table) and browser text-to-speech.
 */
class VocabListView extends BaseView {
  constructor(app, containerId) {
    super(app, containerId);
    this.currentFilter = 'all';
    this.currentQuery = '';
    this.viewMode = 'table'; // 'table' or 'grid'
  }

  renderList() {
    const words = this.app.vocabController.search(this.currentQuery, this.currentFilter);

    const html = `
      <div class="vocab-list-container animate-pop">
        <!-- Top Toolbar -->
        <div class="glass-panel" style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                <h2 style="font-size: 1.5rem; font-weight: 800;">📖 לקסיקון מלא: כל המילים והפירושים</h2>
                <span class="badge" style="background: rgba(0, 240, 255, 0.15); color: var(--accent-glow);">
                  ${words.length} מילים מוצגות
                </span>
              </div>
              <p style="color: var(--text-muted); font-size: 0.9rem;">
                סקירה מקיפה של כל אוצר המילים, תרגומים לעברית, הגדרות ומשפטי דוגמה מהעולם התאגידי.
              </p>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-secondary" id="btn-toggle-view-mode" title="החלף בין תצוגת טבלה לכרטיסיות">
                ${this.viewMode === 'table' ? 'תצוגת כרטיסיות 🗂️' : 'תצוגת טבלה מלאה 📋'}
              </button>
              <button class="btn btn-secondary" id="btn-print-vocab" title="הדפס או שמור כ-PDF">
                <span>הדפס לקסיקון 🖨️</span>
              </button>
              <button class="btn btn-primary" id="btn-open-upload-modal">
                <span>העלה מסמך נוסף 📁</span>
              </button>
            </div>
          </div>

          <!-- Search and Filter Bar -->
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <input type="text" id="vocab-search-input" class="form-input" style="flex: 2; min-width: 240px;" 
                   placeholder="חפש מונח באנגלית או תרגום בעברית (למשל: mitigate, leverage, אב טיפוס)..." value="${this.escapeHtml(this.currentQuery)}">
            
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="vocab-filter-pills">
              <button class="btn btn-secondary ${this.currentFilter === 'all' ? 'active-filter' : ''}" data-filter="all">הכל (${this.app.vocabController.words.length})</button>
              <button class="btn btn-secondary ${this.currentFilter === 'mistakes' ? 'active-filter' : ''}" data-filter="mistakes">טעויות לתיקון 🎯</button>
              <button class="btn btn-secondary ${this.currentFilter === 'mastered' ? 'active-filter' : ''}" data-filter="mastered">הוטמעו (80%+) ⭐</button>
              <button class="btn btn-secondary ${this.currentFilter === 'learning' ? 'active-filter' : ''}" data-filter="learning">בתהליך למידה</button>
              <button class="btn btn-secondary ${this.currentFilter === 'new' ? 'active-filter' : ''}" data-filter="new">טרם נלמדו</button>
            </div>
          </div>
        </div>

        <!-- Render Content based on viewMode -->
        ${this.viewMode === 'table' ? this.renderTableView(words) : this.renderGridView(words)}
      </div>
    `;

    this.render(html);
    this.bindEvents();
  }

  renderTableView(words) {
    if (words.length === 0) {
      return this.renderEmptyState();
    }

    return `
      <div class="glass-panel" style="padding: 0; overflow-x: auto; border-radius: var(--radius-lg);">
        <table style="width: 100%; border-collapse: collapse; text-align: right; min-width: 700px;">
          <thead>
            <tr style="background: rgba(255, 255, 255, 0.04); border-bottom: 2px solid var(--border-color); color: var(--text-muted); font-size: 0.85rem;">
              <th style="padding: 1rem 1.25rem; width: 40px;">#</th>
              <th style="padding: 1rem 1.25rem;">מילה באנגלית (Word)</th>
              <th style="padding: 1rem 1.25rem;">תרגום לעברית</th>
              <th style="padding: 1rem 1.25rem;">משפט דוגמה בהקשר (Context Sentence)</th>
              <th style="padding: 1rem 1.25rem; width: 120px;">מאסטרי</th>
              <th style="padding: 1rem 1.25rem; width: 60px;">שמע</th>
            </tr>
          </thead>
          <tbody>
            ${words.map((w, idx) => {
              const example = (w.swipeCards && w.swipeCards[0]?.sentence) || `Used in advanced technical contexts.`;
              return `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.04); transition: background 0.15s ease;" onmouseover="this.style.background='rgba(0, 240, 255, 0.03)'" onmouseout="this.style.background='transparent'">
                  <td style="padding: 0.85rem 1.25rem; font-size: 0.8rem; color: var(--text-dim);">${idx + 1}</td>
                  <td style="padding: 0.85rem 1.25rem;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-glow);">${this.escapeHtml(w.word)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-dim); direction: ltr; text-align: left;">${this.escapeHtml(w.definition || '')}</div>
                  </td>
                  <td style="padding: 0.85rem 1.25rem; font-size: 1rem; font-weight: 700; color: #ffffff;">
                    ${this.escapeHtml(w.translation_he)}
                  </td>
                  <td style="padding: 0.85rem 1.25rem; font-size: 0.9rem; color: var(--text-muted); direction: ltr; text-align: left; line-height: 1.4;">
                    "${this.escapeHtml(example)}"
                  </td>
                  <td style="padding: 0.85rem 1.25rem;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.2rem;">${w.stats.masteryScore}%</div>
                    <div class="mastery-bar-container" style="height: 5px;">
                      <div class="mastery-bar-fill" style="width: ${w.stats.masteryScore}%;"></div>
                    </div>
                  </td>
                  <td style="padding: 0.85rem 1.25rem; text-align: center;">
                    <button class="icon-btn btn-speak-word" data-word="${this.escapeHtml(w.word)}" title="השמע הגייה" style="width: 32px; height: 32px;">
                      🔊
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderGridView(words) {
    if (words.length === 0) {
      return this.renderEmptyState();
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1rem;">
        ${words.map(w => {
          const example = (w.swipeCards && w.swipeCards[0]?.sentence) || '';
          return `
            <div class="glass-panel" style="padding: 1.25rem; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <span style="font-size: 1.3rem; font-weight: 800; color: var(--accent-glow);">${this.escapeHtml(w.word)}</span>
                  <button class="icon-btn btn-speak-word" data-word="${this.escapeHtml(w.word)}" title="השמע הגייה" style="width: 30px; height: 30px; font-size: 0.9rem;">
                    🔊
                  </button>
                </div>
                <div style="font-size: 1.05rem; color: #ffffff; font-weight: 700; margin-bottom: 0.4rem;">
                  ${this.escapeHtml(w.translation_he)}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.75rem; direction: ltr; text-align: left;">
                  ${this.escapeHtml(w.definition || '')}
                </div>
                ${example ? `
                  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; font-size: 0.85rem; color: var(--text-dim); direction: ltr; text-align: left; line-height: 1.35; margin-bottom: 0.75rem;">
                    "${this.escapeHtml(example)}"
                  </div>
                ` : ''}
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim);">
                  <span>מאסטרי: ${w.stats.masteryScore}%</span>
                  <span>נצפה ${w.stats.seen} פעמים</span>
                </div>
                <div class="mastery-bar-container">
                  <div class="mastery-bar-fill" style="width: ${w.stats.masteryScore}%;"></div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="glass-panel" style="text-align: center; padding: 3rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <h4>לא נמצאו מילים תואמות</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.3rem;">נסה לשנות את מילות החיפוש או הפילטר.</p>
      </div>
    `;
  }

  bindEvents() {
    const searchInput = document.getElementById('vocab-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.currentQuery = e.target.value;
      this.renderList();
      const el = document.getElementById('vocab-search-input');
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });

    const pills = document.querySelectorAll('#vocab-filter-pills button');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.currentFilter = pill.dataset.filter;
        this.renderList();
      });
    });

    document.getElementById('btn-toggle-view-mode')?.addEventListener('click', () => {
      this.viewMode = (this.viewMode === 'table') ? 'grid' : 'table';
      this.renderList();
    });

    document.getElementById('btn-print-vocab')?.addEventListener('click', () => {
      window.print();
    });

    document.querySelectorAll('.btn-speak-word').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.word;
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.85;
          window.speechSynthesis.speak(utterance);
        }
      });
    });

    document.getElementById('btn-open-upload-modal')?.addEventListener('click', () => {
      this.app.views.showUploadModal();
    });
  }
}

window.VocabListView = VocabListView;
