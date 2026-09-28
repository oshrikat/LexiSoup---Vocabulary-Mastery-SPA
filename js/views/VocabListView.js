/**
 * VocabListView
 * Searchable repository for all 300+ vocabulary words with mastery indicators
 * and browser text-to-speech pronunciation.
 */
class VocabListView extends BaseView {
  constructor(app, containerId) {
    super(app, containerId);
    this.currentFilter = 'all';
    this.currentQuery = '';
  }

  renderList() {
    const words = this.app.vocabController.search(this.currentQuery, this.currentFilter);

    const html = `
      <div class="vocab-list-container animate-pop">
        <!-- Top Toolbar -->
        <div class="glass-panel" style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.5rem; font-weight: 800;">מאגר אוצר המילים (${this.app.vocabController.words.length} מילים)</h2>
              <p style="color: var(--text-muted); font-size: 0.9rem;">
                מעקב אחרי רמת מאסטרי, היסטוריית טעויות ותרגול ממוקד.
              </p>
            </div>
            <button class="btn btn-primary" id="btn-open-upload-modal">
              <span>העלה מסמך / PDF חדש</span>
              <span>📁</span>
            </button>
          </div>

          <!-- Search and Filter Bar -->
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <input type="text" id="vocab-search-input" class="form-input" style="flex: 2; min-width: 220px;" 
                   placeholder="חפש מילה באנגלית או תרגום בעברית..." value="${this.escapeHtml(this.currentQuery)}">
            
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="vocab-filter-pills">
              <button class="btn btn-secondary ${this.currentFilter === 'all' ? 'active-filter' : ''}" data-filter="all">הכל</button>
              <button class="btn btn-secondary ${this.currentFilter === 'mistakes' ? 'active-filter' : ''}" data-filter="mistakes">טעויות לתיקון 🎯</button>
              <button class="btn btn-secondary ${this.currentFilter === 'mastered' ? 'active-filter' : ''}" data-filter="mastered">הוטמעו (80%+) ⭐</button>
              <button class="btn btn-secondary ${this.currentFilter === 'learning' ? 'active-filter' : ''}" data-filter="learning">בתהליך למידה</button>
              <button class="btn btn-secondary ${this.currentFilter === 'new' ? 'active-filter' : ''}" data-filter="new">טרם נלמדו</button>
            </div>
          </div>
        </div>

        <!-- Words Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
          ${words.length === 0 ? `
            <div class="glass-panel" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
              <h4>לא נמצאו מילים תואמות</h4>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.3rem;">נסה לשנות את מילות החיפוש או הפילטר.</p>
            </div>
          ` : words.map(w => `
            <div class="glass-panel" style="padding: 1.2rem; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <span style="font-size: 1.25rem; font-weight: 800; color: var(--accent-glow);">${this.escapeHtml(w.word)}</span>
                  <button class="icon-btn btn-speak-word" data-word="${this.escapeHtml(w.word)}" title="השמע הגייה" style="width: 28px; height: 28px; font-size: 0.85rem;">
                    🔊
                  </button>
                </div>
                <div style="font-size: 1rem; color: #ffffff; font-weight: 600; margin-bottom: 0.4rem;">
                  ${this.escapeHtml(w.translation_he)}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.75rem;">
                  ${this.escapeHtml(w.definition || '')}
                </div>
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
          `).join('')}
        </div>
      </div>
    `;

    this.render(html);
    this.bindEvents();
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

    document.querySelectorAll('.btn-speak-word').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.word;
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.9;
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
