/**
 * UploadModalView
 * Modal dialog for drag-and-drop document upload (PDF / TXT)
 * and triggering the abstracted AI parser service.
 */
class UploadModalView {
  constructor(app) {
    this.app = app;
  }

  show() {
    const modalHtml = `
      <div class="modal-backdrop open" id="upload-modal-backdrop">
        <div class="modal-window">
          <div class="modal-header">
            <h3><span>📂 העלאת מסמך אוצר מילים חדש</span></h3>
            <button class="icon-btn" id="btn-close-upload-modal" style="width: 32px; height: 32px;">✕</button>
          </div>
          
          <div class="modal-body">
            <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.25rem;">
              העלה קובץ PDF או TXT עם רשימת מילים. מנוע ה-AI ינתח אותם, יחלץ תרגומים מדויקים, וייצר כרטיסיות סווייפ ותרחישי צ'אט אוטומטית.
            </p>

            <div id="drop-zone" style="border: 2px dashed var(--border-glow); border-radius: var(--radius-md); padding: 2.5rem 1.5rem; text-align: center; background: rgba(0, 240, 255, 0.03); cursor: pointer; transition: all 0.2s ease;">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">📄</div>
              <h4 style="font-weight: 700; margin-bottom: 0.3rem;">גרור ושחרר קובץ לכאן, או לחץ לבחירה</h4>
              <p style="color: var(--text-dim); font-size: 0.85rem;">תומך ב-PDF, TXT, CSV</p>
              <input type="file" id="file-input-el" accept=".pdf,.txt,.csv" style="display: none;">
            </div>

            <div style="margin-top: 1.5rem;">
              <label class="form-label">או הדבק טקסט ישירות כאן:</label>
              <textarea id="raw-text-paste" class="form-textarea" rows="4" placeholder="Word | Translation&#10;abundance | שפע&#10;accelerate | להאיץ"></textarea>
            </div>

            <div id="upload-terminal" class="terminal-box" style="display: none;">
              <div id="terminal-logs"></div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-cancel-upload">ביטול</button>
            <button class="btn btn-primary" id="btn-submit-upload">
              <span>הפעל עיבוד AI</span>
              <span>⚡</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('upload-modal-backdrop');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.bindEvents();
  }

  log(msg) {
    const term = document.getElementById('upload-terminal');
    const logs = document.getElementById('terminal-logs');
    if (term && logs) {
      term.style.display = 'block';
      const time = new Date().toLocaleTimeString();
      logs.innerHTML += `<div>[${time}] > ${msg}</div>`;
      term.scrollTop = term.scrollHeight;
    }
  }

  bindEvents() {
    const backdrop = document.getElementById('upload-modal-backdrop');
    const closeBtn = document.getElementById('btn-close-upload-modal');
    const cancelBtn = document.getElementById('btn-cancel-upload');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input-el');
    const submitBtn = document.getElementById('btn-submit-upload');

    let selectedFile = null;

    const close = () => {
      backdrop.classList.remove('open');
      setTimeout(() => backdrop.remove(), 250);
    };

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        dropZone.innerHTML = `
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem; color: #00ff9d;">✓</div>
          <h4 style="font-weight: 700;">נבחר קובץ: ${selectedFile.name}</h4>
          <p style="color: var(--text-dim); font-size: 0.85rem;">${(selectedFile.size / 1024).toFixed(1)} KB</p>
        `;
      }
    });

    submitBtn.addEventListener('click', async () => {
      const pasteText = document.getElementById('raw-text-paste').value.trim();
      if (!selectedFile && !pasteText) {
        alert('נא לבחור קובץ או להדביק טקסט לעיבוד.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = 'מעבד...';

      try {
        let fileToProcess = selectedFile;
        if (!fileToProcess && pasteText) {
          fileToProcess = new Blob([pasteText], { type: 'text/plain' });
          fileToProcess.name = 'pasted_text.txt';
        }

        const res = await this.app.vocabController.handleFileUpload(fileToProcess, (msg) => this.log(msg));
        this.log(`הושלם בהצלחה! נוספו ${res.addedCount} מילים, עודכנו ${res.updatedCount}.`);
        
        setTimeout(() => {
          close();
          this.app.views.showDashboard();
        }, 1500);
      } catch (err) {
        this.log(`שגיאה: ${err.message}`);
        submitBtn.disabled = false;
        submitBtn.innerText = 'נסה שוב';
      }
    });
  }
}

window.UploadModalView = UploadModalView;
