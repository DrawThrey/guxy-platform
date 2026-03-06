/**
 * GUXY Agent 对话窗口组件
 * 左侧滑出面板，支持文本输入、图片上传，与文曲星/千里眼/丹青手对话
 */

GUXY.AgentChatPanel = {
  container: null,
  currentAgentId: null,
  history: {}, // { agentId: [{ role, content, images?, imageResult? }] },

  AGENT_INFO: {
    wenquxing: { name: '文曲星', icon: '📜' },
    qianliyan: { name: '千里眼', icon: '👁' },
    danqingshou: { name: '丹青手', icon: '🎨' }
  },

  SYSTEM_PROMPTS: {
    wenquxing: `你是文曲星，游戏交互设计领域的文本助手。你的能力包括：
1. 文本对话：回答与游戏界面、交互设计相关的问题
2. 文本生成：根据需求生成策划文案、功能描述等
3. 文本转提示词：将自然语言描述转化为可用于生图的专业提示词
请遵循交互规范与提示词规范，给出专业、清晰的回复。`,
    qianliyan: `你是千里眼，游戏交互设计领域的视觉分析助手。你的能力是：识别用户上传/发送的图片（支持多图），分析界面结构、布局、元素、风格等，将识别的图片转化为与「一键AI改写」功能相同格式的低保真提示词。

【输出格式要求（与一键AI改写完全一致）】
你的回复必须且仅包含用于生成低保真界面的提示词正文，不要输出「分析请求」「分析输入数据」「识别结果如下」等前后说明。
可以使用自然段或有层级的无序列表，但不要输出「①」「②」这类编号标题。

【须覆盖以下信息要点】
① 界面区域划分：按顶部导航区、主内容区、底部按钮区、侧边栏、弹窗浮层等方式，将界面切分为若干区域，并说明每个区域在整个界面中的大致位置和宽高或占比。
② 区域内的组件与信息：针对每个区域，列出其中包含的关键 UI 组件和文案信息（标题、副标题、标签、图标、列表项、输入框、按钮等）。
③ 组件与信息的位置：对每个重要组件和信息，说明其在界面或所属区域中的相对位置（例如顶部居中、靠左对齐、行尾图标、右下角悬浮按钮等）。
④ 组件与信息的大小与字号：描述不同层级文本和组件的大致尺寸与层级关系（例如主标题大号粗体、正文中号、标签小号；主按钮更大更宽，次要按钮更小更窄，可给出大致像素高度）。

【严禁事项】
- 除非图片中明确涉及「道具」「背包」「道具栏」等，否则一律禁止出现：道具栏、道具背包、640×600（或 640*600）等尺寸描述。
- 禁止对每个区域都机械地写上「选中状态、置灰状态、锁定状态」三段式。只对真正需要这些状态的组件写对应状态；不需要的组件不写。
- 若界面是纯信息展示（如套装词条、说明页、结果页），布局可能只有标题区、内容区、返回按钮等，不要强行加入道具栏或背包。

请直接输出改写后的低保真提示词正文。`,
    danqingshou: `你是丹青手，游戏界面低保真原型生成助手。根据用户提供的提示词，你将调用生图模型生成低保真界面。
用户会提供描述或提示词，请直接据此生成。生成规格：896×1600像素，黑白灰线框图风格，符合移动端界面设计规范。`
  },

  /**
   * 初始化
   */
  init() {
    this.createContainer();
    this.bindEvents();
    console.log('AgentChatPanel initialized');
  },

  /**
   * 创建容器
   */
  createContainer() {
    let container = document.getElementById('agent-chat-panel');
    if (!container) {
      container = document.createElement('aside');
      container.id = 'agent-chat-panel';
      container.className = 'agent-chat-panel';
      document.body.appendChild(container);
    }
    this.container = container;
  },

  /**
   * 显示指定 Agent 的对话窗口
   * @param {string} agentId - wenquxing | qianliyan | danqingshou
   */
  show(agentId) {
    this.currentAgentId = agentId;
    if (!this.history[agentId]) this.history[agentId] = [];
    this.render();
    this.container.classList.add('active');
  },

  /**
   * 关闭对话窗口
   */
  close() {
    this.container.classList.remove('active');
  },

  /**
   * 渲染面板
   */
  render() {
    if (!this.container || !this.currentAgentId) return;
    const info = this.AGENT_INFO[this.currentAgentId] || { name: 'Agent', icon: '💬' };
    const supportsImage = this.currentAgentId === 'qianliyan';
    const isDanqing = this.currentAgentId === 'danqingshou';

    const messagesHtml = this.renderMessages(this.history[this.currentAgentId] || []);

    this.container.innerHTML = `
      <div class="agent-chat-header">
        <h3><span class="agent-chat-icon">${info.icon}</span> ${GUXY.Utils.escapeHtml(info.name)}</h3>
        <button type="button" class="agent-chat-close" title="关闭">×</button>
      </div>
      <div class="agent-chat-messages" id="agent-chat-messages">
        ${messagesHtml}
        <div id="agent-chat-message-placeholder"></div>
      </div>
      <div class="agent-chat-input-area">
        <div class="agent-chat-input-row">
          <textarea id="agent-chat-text" rows="2" placeholder="${isDanqing ? '输入生图提示词...' : '输入消息...'}" maxlength="4000"></textarea>
          <button type="button" class="agent-chat-send" id="agent-chat-send" title="发送">发送</button>
        </div>
        ${supportsImage ? `
        <div class="agent-chat-attach-row">
          <label class="agent-chat-upload-btn">
            <input type="file" id="agent-chat-images" accept="image/*" multiple hidden />
            📷 添加图片（支持多图）
          </label>
          <span class="agent-chat-image-hint" id="agent-chat-image-hint"></span>
        </div>
        ` : ''}
        ${isDanqing ? `
        <div class="agent-chat-attach-row">
          <span class="agent-chat-hint">输入界面描述或提示词，将生成 896×1600 低保真界面</span>
        </div>
        ` : ''}
      </div>
    `;

    this.scrollToBottom();
    this.bindPanelEvents();
  },

  /**
   * 渲染消息列表
   */
  renderMessages(messages) {
    return messages
      .map((msg) => {
        const isUser = msg.role === 'user';
        let contentHtml = '';
        if (msg.images && msg.images.length) {
          contentHtml += `<div class="agent-msg-images">${msg.images.map((url) => `<img src="${url}" alt="上传图片" class="agent-msg-img" />`).join('')}</div>`;
        }
        if (msg.content) {
          contentHtml += `<div class="agent-msg-text">${GUXY.Utils.escapeHtml(msg.content).replace(/\n/g, '<br/>')}</div>`;
        }
        if (msg.imageResult) {
          contentHtml += `<div class="agent-msg-result-img"><img src="${msg.imageResult}" alt="生成图片" /></div>`;
        }
        return `
          <div class="agent-msg agent-msg-${msg.role}">
            <div class="agent-msg-body">${contentHtml}</div>
          </div>
        `;
      })
      .join('');
  },

  /**
   * 绑定面板内事件
   */
  bindPanelEvents() {
    const closeBtn = this.container.querySelector('.agent-chat-close');
    closeBtn?.addEventListener('click', () => this.close());

    const sendBtn = this.container.querySelector('#agent-chat-send');
    const textarea = this.container.querySelector('#agent-chat-text');
    const imageInput = this.container.querySelector('#agent-chat-images');

    sendBtn?.addEventListener('click', () => this.handleSend());

    textarea?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    imageInput?.addEventListener('change', (e) => {
      const hint = this.container.querySelector('#agent-chat-image-hint');
      if (hint && e.target.files?.length) {
        hint.textContent = `已选 ${e.target.files.length} 张图片`;
      }
    });
  },

  /**
   * 绑定全局事件（初始化时调用一次）
   */
  bindEvents() {
    document.addEventListener('click', (e) => {
      if (this.container?.classList.contains('active') && !this.container.contains(e.target) && !document.getElementById('agent-island')?.contains(e.target)) {
        this.close();
      }
    });
  },

  /**
   * 处理发送
   */
  async handleSend() {
    const textarea = this.container.querySelector('#agent-chat-text');
    const imageInput = this.container.querySelector('#agent-chat-images');
    const text = textarea?.value?.trim() || '';
    const files = imageInput?.files ? Array.from(imageInput.files) : [];

    const agentId = this.currentAgentId;
    if (!agentId) return;

    // 校验输入
    if (this.currentAgentId === 'qianliyan') {
      if (!text && files.length === 0) {
        GUXY.Toast?.show('请输入文字或上传图片', 'warning');
        return;
      }
    } else if (this.currentAgentId === 'danqingshou') {
      if (!text) {
        GUXY.Toast?.show('请输入生图提示词', 'warning');
        return;
      }
    } else {
      if (!text) {
        GUXY.Toast?.show('请输入消息', 'warning');
        return;
      }
    }

    // 添加用户消息
    let userImages = [];
    if (files.length) {
      userImages = await Promise.all(files.map((f) => this.fileToDataUrl(f)));
    }
    this.history[agentId].push({
      role: 'user',
      content: text,
      images: userImages.length ? userImages : undefined
    });
    this.render();
    textarea.value = '';
    if (imageInput) imageInput.value = '';
    const hintEl = this.container.querySelector('#agent-chat-image-hint');
    if (hintEl) hintEl.textContent = '';
    const sendBtn = this.container.querySelector('#agent-chat-send');
    if (sendBtn) sendBtn.disabled = true;

    // 添加占位消息（加载中）
    const placeholder = this.container.querySelector('#agent-chat-message-placeholder');
    const loadingEl = document.createElement('div');
    loadingEl.className = 'agent-msg agent-msg-assistant agent-msg-loading';
    loadingEl.innerHTML = '<div class="agent-msg-body">思考中...</div>';
    placeholder?.before(loadingEl);

    try {
      const reply = await this.callAgent(agentId, text, userImages);
      this.history[agentId].push(reply);
    } catch (err) {
      this.history[agentId].push({
        role: 'assistant',
        content: `错误: ${err.message || String(err)}`
      });
      GUXY.Toast?.show(err.message || '请求失败', 'error');
    } finally {
      loadingEl?.remove();
      this.render();
      this.scrollToBottom();
      this.container.querySelector('#agent-chat-send')?.removeAttribute('disabled');
    }
  },

  /**
   * 根据 Agent 类型调用 API
   */
  async callAgent(agentId, text, imageDataUrls) {
    if (GUXY.State?.loadConfig) GUXY.State.loadConfig();

    if (agentId === 'wenquxing') {
      return await this.callWenquxing(text);
    }
    if (agentId === 'qianliyan') {
      return await this.callQianliyan(text, imageDataUrls);
    }
    if (agentId === 'danqingshou') {
      return await this.callDanqingshou(text);
    }
    throw new Error('未知的 Agent');
  },

  async callWenquxing(text) {
    const config = GUXY.State?.config?.api;
    if (!config?.apiKey || !config?.baseUrl || !config?.model) {
      throw new Error('请先在 API 配置中填写通用大模型');
    }
    const systemPrompt = this.SYSTEM_PROMPTS.wenquxing;
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(this.buildHistoryMessages('wenquxing')),
      { role: 'user', content: text }
    ];
    const result = await GUXY.Utils.callAIModel(config.model, config.apiKey, config.baseUrl, messages);
    return { role: 'assistant', content: result.content || '' };
  },

  async callQianliyan(text, imageDataUrls) {
    if (!imageDataUrls?.length && !text) {
      throw new Error('千里眼需要上传图片或输入描述');
    }
    const contentParts = [];
    if (text) contentParts.push({ type: 'text', text });
    imageDataUrls?.forEach((url) => {
      contentParts.push({ type: 'image_url', image_url: { url } });
    });
    const userContent = contentParts.length === 1 && typeof contentParts[0].text === 'string'
      ? contentParts[0].text
      : contentParts;

    const systemPrompt = this.SYSTEM_PROMPTS.qianliyan;
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(this.buildHistoryMessages('qianliyan')),
      { role: 'user', content: userContent }
    ];
    const result = await GUXY.Utils.callVisionModel(messages);
    let content = (result.content || '').trim();
    // 与一键AI改写相同：去除「草稿」「分析请求」等多余说明
    if (content && GUXY.NodeDetailSidebar?.stripPromptFromExpandContent) {
      content = GUXY.NodeDetailSidebar.stripPromptFromExpandContent(content);
    }
    return { role: 'assistant', content: content || (result.content || '') };
  },

  async callDanqingshou(text) {
    if (!GUXY.LowFiGeneration?.generateFromPrompt) {
      throw new Error('生图模块未加载');
    }
    const result = await GUXY.LowFiGeneration.generateFromPrompt(text);
    return {
      role: 'assistant',
      content: '已根据提示词生成低保真界面：',
      imageResult: result.dataUrl
    };
  },

  /**
   * 构建历史消息（用于多轮对话，不含图片以控制 token）
   */
  buildHistoryMessages(agentId) {
    const hist = this.history[agentId] || [];
    return hist.slice(-6).map((m) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : (m.content || '')
    }));
  },

  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  },

  scrollToBottom() {
    const msgs = this.container?.querySelector('#agent-chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.AgentChatPanel;
}
