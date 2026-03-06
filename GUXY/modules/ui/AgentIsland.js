/**
 * GUXY Agent 浮岛组件
 * 位于画布左侧，展示三个 AI Agent 智能体头像，点击打开对应对话窗口
 */

GUXY.AgentIsland = {
  container: null,

  AGENTS: [
    { id: 'wenquxing', name: '文曲星', icon: '📜', title: '通用大模型：文本对话、文本生成、文本转提示词' },
    { id: 'qianliyan', name: '千里眼', icon: '👁', title: '视觉模型：识别图片，转化为专业提示词，支持多图' },
    { id: 'danqingshou', name: '丹青手', icon: '🎨', title: '生图模型：通过提示词生成低保真界面' }
  ],

  /**
   * 初始化 Agent 浮岛
   */
  init() {
    this.createContainer();
    this.render();
    this.bindEvents();
    this.updateVisibility();
    console.log('AgentIsland initialized');
  },

  /**
   * 创建容器
   */
  createContainer() {
    let container = document.getElementById('agent-island');
    if (!container) {
      container = document.createElement('div');
      container.id = 'agent-island';
      container.className = 'agent-island';
      document.body.appendChild(container);
    }
    this.container = container;
  },

  /**
   * 渲染浮岛
   */
  render() {
    if (!this.container) return;

    const avatarsHtml = this.AGENTS.map(
      (a) => `
      <button type="button" class="agent-avatar" data-agent="${a.id}" title="${GUXY.Utils.escapeHtml(a.title)}">
        <span class="agent-avatar-icon">${a.icon}</span>
        <span class="agent-avatar-name">${GUXY.Utils.escapeHtml(a.name)}</span>
      </button>
    `
    ).join('');

    this.container.innerHTML = `
      <div class="agent-island-content">
        ${avatarsHtml}
      </div>
    `;
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;

    this.container.querySelectorAll('.agent-avatar').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const agentId = e.currentTarget.getAttribute('data-agent');
        this.openChat(agentId);
      });
    });
  },

  /**
   * 打开指定 Agent 的对话窗口
   * @param {string} agentId - 文曲星 / 千里眼 / 丹青手
   */
  openChat(agentId) {
    if (GUXY.AgentChatPanel) {
      GUXY.AgentChatPanel.show(agentId);
    }
  },

  /**
   * 根据当前视图更新浮岛可见性
   */
  updateVisibility() {
    if (!this.container) return;
    const canvasPage = document.getElementById('canvas-page');
    const isCanvasActive = canvasPage && canvasPage.classList.contains('active');
    this.container.classList.toggle('visible', !!isCanvasActive);
  },

  /**
   * 显示浮岛
   */
  show() {
    if (this.container) this.container.classList.add('visible');
  },

  /**
   * 隐藏浮岛
   */
  hide() {
    if (this.container) this.container.classList.remove('visible');
  },

  /**
   * 销毁
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
    this.container = null;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.AgentIsland;
}
