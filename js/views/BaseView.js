/**
 * BaseView
 * Foundation class for rendering HTML views and managing UI state.
 */
class BaseView {
  constructor(app, containerId = 'app-root') {
    this.app = app;
    this.container = document.getElementById(containerId);
  }

  render(html) {
    if (this.container) {
      this.container.innerHTML = html;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.BaseView = BaseView;
