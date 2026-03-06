/**
 * GUXY 低保真原型图生成模块
 * 使用生图模型生成低保真交互原型图
 */

GUXY.LowFiGeneration = {
  /**
   * 初始化模块
   */
  init() {
    console.log('LowFiGeneration initialized');
  },

  /**
   * 根据提示词直接生成图片（供 Agent 对话等场景调用）
   * @param {string} prompt - 生图提示词
   * @returns {Promise<object>} { dataUrl, width, height, revisedPrompt }
   */
  async generateFromPrompt(prompt) {
    if (!prompt || !prompt.trim()) {
      throw new Error('请输入生图提示词');
    }
    if (!this.isImageModelConfigured()) {
      throw new Error('请先在 API 配置中填写生图模型');
    }
    return await this.callImageModel(prompt.trim());
  },

  /**
   * 为指定卡片生成低保真原型图
   * @param {string} cardId - 卡片ID
   * @returns {Promise<object>} 生成结果
   */
  async generateForCard(cardId) {
    try {
      // 获取卡片数据
      const card = await this.getCardData(cardId);
      if (!card) {
        throw new Error('卡片不存在');
      }

      // 验证生图模型配置
      if (!this.isImageModelConfigured()) {
        throw new Error('请先配置生图模型API');
      }

      // 获取交互规范
      const interactionSpec = this.getInteractionSpec();

      // 显示加载状态
      GUXY.Toast?.show('正在生成低保真原型图...', 'info');

      // 构造Prompt
      const prompt = this.buildPrompt(card, interactionSpec);

      // 调用生图API
      const imageData = await this.callImageModel(prompt);

      // 保存图片数据
      const result = await this.saveLowFiImage(cardId, imageData);

      // 更新卡片显示
      this.updateCardDisplay(cardId, result);

      GUXY.Toast?.show('低保真原型图生成成功', 'success');

      return {
        success: true,
        cardId,
        imageData: result
      };
    } catch (error) {
      console.error('Low-Fi Generation error:', error);
      GUXY.Toast?.show(`生成失败: ${error.message}`, 'error');
      throw error;
    }
  },

  /**
   * 获取卡片数据
   * @param {string} cardId - 卡片ID
   * @returns {object|null} 卡片数据
   */
  getCardData(cardId) {
    const project = GUXY.State?.currentProject;
    if (!project?.architecture) {
      return null;
    }

    const cleanCardId = cardId.replace(/^card-/, '');
    return project.architecture.cards?.find(c => c.id === cleanCardId);
  },

  /**
   * 检查生图模型配置
   * @returns {boolean} 是否已配置
   */
  isImageModelConfigured() {
    const config = GUXY.State?.config?.imageModel;
    if (!config) return false;

    const provider = config.provider || 'openai';
    if (provider === 'comfyui') {
      const base = config.comfyBaseUrl || config.baseUrl;
      const workflowContent = config.comfyWorkflow?.content;
      return !!(base && workflowContent);
    }

    const requestMode = config.requestMode || 'openai';
    if (requestMode === 'post') {
      // POST 通用模式：只需要 API Key 和 Base URL，不要求配置 model
      return !!(config.apiKey && config.baseUrl);
    }

    // OpenAI 兼容模式：需要 API Key、Base URL 和模型名称
    return !!(config.apiKey && config.baseUrl && config.model);
  },

  /**
   * 获取交互规范内容
   * @returns {string} 交互规范内容
   */
  getInteractionSpec() {
    const config = GUXY.State?.config?.interactionSpecFile;
    return config?.content || '';
  },

  /**
   * 构造生图Prompt
   * @param {object} card - 卡片数据
   * @param {string} interactionSpec - 交互规范内容
   * @returns {string} Prompt
   */
  buildPrompt(card, interactionSpec) {
    const cardTitle = card.title || '未命名界面';
    const cardDesc = card.description || card.body || '暂无描述';
    const interfaceLevel = card.interface_level >= 1 && card.interface_level <= 3
      ? ['一级界面', '二级界面', '三级界面'][card.interface_level - 1]
      : '一级界面';

    let prompt = `# 游戏界面低保真原型图生成

【界面信息】
- 界面名称: ${cardTitle}
- 界面层级: ${interfaceLevel}
- 界面描述: ${cardDesc}

`;

    // 添加交互规范
    if (interactionSpec) {
      prompt += `
【交互规范】
${interactionSpec}

`;
    }

    prompt += `
【生成要求】
1. 尺寸: 896×1600像素（竖屏手机界面）
2. 风格: 低保真黑白灰线框图，采用卡片式设计，UI元素使用圆角矩形卡片
3. 颜色: 仅使用黑色、白色、灰色
4. 线条: 使用细线条，清晰勾勒界面结构
5. 布局: 严格按照交互规范中的布局要求
6. 元素: 包含标题栏、内容区、按钮区等基本UI元素
7. 文本: 使用占位文本，标注功能区域
8. 状态: 生成默认状态的界面
9. 仅生成界面内部UI，不要绘制手机外框、圆角边框或设备轮廓，图片应该是896×1600的纯界面内容，上下左右无边距

【设计原则】
- 保持简洁，去除所有装饰性元素
- 专注于功能布局和交互流程
- 使用简单的几何形状代表UI组件
- 清晰标注各个功能区域
- 为重要信息区块添加轻微阴影效果，增加层次感和卡片感
- 符合移动端界面设计规范
请严格按照以上要求生成一张896×1600px的低保真黑白灰界面原型图。`;

    return prompt;
  },

  /**
   * 调用生图模型API
   * @param {string} prompt - 生图Prompt
   * @returns {Promise<object>} 图片数据
   */
  async callImageModel(prompt) {
    const config = GUXY.State?.config?.imageModel;
    if (!config) {
      throw new Error('生图模型配置不存在');
    }

    const provider = config.provider || 'openai';
    const requestMode = config.requestMode || 'openai';
    if (provider === 'comfyui') {
      return await this.callComfyImageModel(prompt, config);
    }

    // 构造请求URL（OpenAI 兼容格式：.../v1/images/generations）
    // 若 baseUrl 误填为聊天接口（含 /chat/completions），先去掉该路径再拼接
    let url = (config.baseUrl || '').trim().replace(/\/+$/, '');
    if (!url) {
      throw new Error('生图模型 baseUrl 未配置，请在 API 配置中填写');
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('生图 baseUrl 必须以 http:// 或 https:// 开头');
    }
    // 移除常见的聊天接口路径，避免误配为 chat/completions 时路径错误
    for (const suffix of ['/chat/completions', '/chat', '/completions']) {
      if (url.toLowerCase().endsWith(suffix)) {
        url = url.slice(0, -suffix.length).replace(/\/+$/, '');
        break;
      }
    }
    if (!url.endsWith('/images/generations')) {
      url = url.endsWith('/') ? url + 'images/generations' : url + '/images/generations';
    }

    const requestBody = {
      // 在 OpenAI 兼容模式下会附加 model 字段，POST 通用模式则不附加
      prompt: prompt,
      n: 1,
      // 智谱生图接口要求宽高为 512-2880 且为 32 的整数倍
      // 原本使用的 900×1600 不满足“32 的倍数”约束，这里改为最接近的 896×1600
      size: '896x1600',
      quality: 'standard',
      response_format: 'b64_json'
    };

    if (requestMode !== 'post' && config.model) {
      requestBody.model = config.model;
    }

    console.log('调用生图API:', {
      url: url,
      model: config.model,
      promptLength: prompt.length
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // 统一用 text() 读取，避免重复消费 body；可识别 HTML 并给出明确错误
      const responseText = await response.text();

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch (e) {
          error = { raw: responseText.substring(0, 500) };
        }

        throw new Error(error.error?.message || `API请求失败: ${response.status}`);
      }

      // 解析 JSON；若为 HTML 则抛出明确错误
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        const trimmed = responseText.trim();
        const looksLikeHtml = trimmed.toLowerCase().startsWith('<!') || trimmed.toLowerCase().startsWith('<html');
        if (looksLikeHtml) {
          throw new Error(
            `生图 API 返回了 HTML 而非 JSON，请检查「生图模型」中的 API 地址是否正确。\n` +
            `请求 URL: ${url}\n` +
            `HTTP 状态: ${response.status}\n` +
            `Content-Type: ${response.headers.get('Content-Type') || '(未设置)'}\n` +
            `响应预览: ${responseText.substring(0, 300).replace(/\s+/g, ' ')}...`
          );
        }
        throw e;
      }

      const firstItem = Array.isArray(data.data) ? data.data[0] : null;

      if (!firstItem) {
        throw new Error('API返回的数据格式不正确');
      }

      // 兼容两种返回格式：
      // 1）data[0].b64_json：Base64 图片数据
      // 2）data[0].url：图片直链地址
      let dataUrl;
      if (firstItem.b64_json) {
        dataUrl = `data:image/png;base64,${firstItem.b64_json}`;
      } else if (firstItem.url) {
        dataUrl = firstItem.url;
      } else {
        throw new Error('API返回的数据格式不正确');
      }

      return {
        dataUrl,
        // 与请求中 size 保持一致，方便前端展示
        width: 896,
        height: 1600,
        revisedPrompt: firstItem.revised_prompt
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('生图超时（60秒），请重试');
      }
      throw error;
    }
  },

  /**
   * 通过本地 ComfyUI 工作流调用生图
   * @param {string} prompt - 文本提示词
   * @param {object} config - imageModel 配置
   * @returns {Promise<object>} 图片数据
   */
  async callComfyImageModel(prompt, config) {
    const baseUrlRaw = config.comfyBaseUrl || config.baseUrl || 'http://127.0.0.1:8188';
    const baseUrl = baseUrlRaw.replace(/\/+$/, '');

    if (!config.comfyWorkflow?.content) {
      throw new Error('未找到 ComfyUI 工作流配置，请在API配置中上传 api.json');
    }

    let requestBody;
    try {
      requestBody = JSON.parse(config.comfyWorkflow.content);
    } catch (err) {
      console.error('解析 ComfyUI 工作流 JSON 失败:', err);
      throw new Error('ComfyUI 工作流 JSON 无法解析，请检查 api.json 是否正确');
    }

    // 在工作流 JSON 中替换占位符 __GUXY_PROMPT__
    let replacedCount = 0;
    const replacePromptPlaceholder = (node) => {
      if (!node || typeof node !== 'object') return;
      for (const key of Object.keys(node)) {
        const value = node[key];
        if (typeof value === 'string' && value === '__GUXY_PROMPT__') {
          node[key] = prompt;
          replacedCount += 1;
        } else if (value && typeof value === 'object') {
          replacePromptPlaceholder(value);
        }
      }
    };
    replacePromptPlaceholder(requestBody);

    if (replacedCount === 0) {
      console.warn('ComfyUI 工作流中未找到占位符 __GUXY_PROMPT__，将原样发送请求');
    }

    // 确保有 client_id，便于从 /history 中拉取结果
    const clientId = requestBody.client_id || `guxy_${Date.now()}`;
    requestBody.client_id = clientId;

    const promptUrl = `${baseUrl}/prompt`;
    console.log('调用 ComfyUI /prompt:', { promptUrl, clientId });

    // 提交任务
    const submitResp = await fetch(promptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!submitResp.ok) {
      let errText;
      try {
        errText = await submitResp.text();
      } catch {
        errText = `HTTP ${submitResp.status}`;
      }
      throw new Error(`ComfyUI /prompt 调用失败: ${errText}`);
    }

    let submitData;
    try {
      submitData = await submitResp.json();
    } catch {
      submitData = null;
    }

    console.log('ComfyUI /prompt 返回:', submitData);

    // 轮询 /history/{client_id} 获取输出
    const historyUrl = `${baseUrl}/history/${encodeURIComponent(clientId)}`;
    const startTime = Date.now();
    const timeoutMs = 60000;

    let historyData = null;
    while (Date.now() - startTime < timeoutMs) {
      const historyResp = await fetch(historyUrl, { method: 'GET' });
      if (historyResp.ok) {
        const json = await historyResp.json();
        // ComfyUI 默认返回 { client_id: { outputs: {...} } } 或 { [clientId]: { ... } }
        const entry = json[clientId] || json.client_id || null;
        if (entry && entry.outputs) {
          historyData = entry;
          break;
        }
      }
      // 每 1 秒轮询一次
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!historyData) {
      throw new Error('在 60 秒内未从 ComfyUI 获取到生成结果，请检查工作流或服务器状态');
    }

    // 从 history 输出中取第一张图片
    const outputs = historyData.outputs || {};
    let imageMeta = null;
    for (const nodeId of Object.keys(outputs)) {
      const nodeOutput = outputs[nodeId];
      if (nodeOutput && Array.isArray(nodeOutput.images) && nodeOutput.images.length > 0) {
        imageMeta = nodeOutput.images[0];
        break;
      }
    }

    if (!imageMeta) {
      console.error('ComfyUI history 输出：', historyData);
      throw new Error('ComfyUI 返回的历史记录中没有找到图片输出');
    }

    const viewUrl = `${baseUrl}/view?filename=${encodeURIComponent(imageMeta.filename)}&subfolder=${encodeURIComponent(imageMeta.subfolder || '')}&type=${encodeURIComponent(imageMeta.type || 'output')}`;
    console.log('从 ComfyUI 拉取图片:', { viewUrl });

    const imageResp = await fetch(viewUrl);
    if (!imageResp.ok) {
      throw new Error(`从 ComfyUI 获取图片失败: HTTP ${imageResp.status}`);
    }

    const blob = await imageResp.blob();
    const dataUrl = await this.blobToDataUrl(blob);

    return {
      dataUrl,
      width: 896,
      height: 1600,
      revisedPrompt: prompt
    };
  },

  /**
   * 将 Blob 转为 dataURL
   * @param {Blob} blob
   * @returns {Promise<string>}
   */
  blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * 保存低保真图片数据
   * @param {string} cardId - 卡片ID
   * @param {object} imageData - 图片数据
   * @returns {Promise<object>} 保存结果
   */
  async saveLowFiImage(cardId, imageData) {
    const cleanCardId = cardId.replace(/^card-/, '');
    const project = GUXY.State?.currentProject;

    if (!project?.architecture) {
      throw new Error('项目数据不存在');
    }

    // 查找卡片
    const card = project.architecture.cards?.find(c => c.id === cleanCardId);
    if (!card) {
      throw new Error('卡片不存在');
    }

    // 更新卡片的低 fidelity 图片数据
    card.lowFiImage = {
      dataUrl: imageData.dataUrl,
      width: imageData.width,
      height: imageData.height,
      generatedAt: new Date().toISOString(),
      revisedPrompt: imageData.revisedPrompt
    };

    // 保存到 localStorage
    GUXY.State.saveToStorage();

    return card.lowFiImage;
  },

  /**
   * 更新卡片显示
   * @param {string} cardId - 卡片ID
   * @param {object} imageData - 图片数据
   */
  updateCardDisplay(cardId, imageData) {
    // 更新画布上的卡片显示
    if (GUXY.CardNode && GUXY.CanvasNodes) {
      const fullNodeId = cardId.startsWith('card-') ? cardId : `card-${cardId}`;
      const nodeEl = GUXY.CanvasNodes.getNodeElement(fullNodeId);

      if (nodeEl) {
        // 添加或更新缩略图
        GUXY.CardNode.updateLowFiImage(nodeEl, imageData);
      }
    }

    // 如果详情页当前显示的是这个卡片，也更新详情页
    const detailSidebar = GUXY.NodeDetailSidebar;
    if (detailSidebar && detailSidebar.currentNode) {
      const currentCardId = detailSidebar.currentNode.id.replace(/^card-/, '');
      const targetCardId = cardId.replace(/^card-/, '');

      if (currentCardId === targetCardId) {
        detailSidebar.currentNode.lowFiImage = imageData;
        detailSidebar.render();
        detailSidebar.bindEvents();
      }
    }
  },

  /**
   * 删除低保真图片
   * @param {string} cardId - 卡片ID
   * @returns {Promise<void>}
   */
  async deleteLowFiImage(cardId) {
    const cleanCardId = cardId.replace(/^card-/, '');
    const project = GUXY.State?.currentProject;

    if (!project?.architecture) {
      return;
    }

    const card = project.architecture.cards?.find(c => c.id === cleanCardId);
    if (card) {
      delete card.lowFiImage;
      GUXY.State.saveToStorage();

      // 更新显示
      this.updateCardDisplay(cardId, null);
    }

    GUXY.Toast?.show('低保真图片已删除', 'success');
  },

  /**
   * 批量生成多个卡片的低保真图
   * @param {Array<string>} cardIds - 卡片ID数组
   * @returns {Promise<object>} 批量生成结果
   */
  async generateBatch(cardIds) {
    const results = {
      success: [],
      failed: []
    };

    for (const cardId of cardIds) {
      try {
        await this.generateForCard(cardId);
        results.success.push(cardId);
      } catch (error) {
        console.error(`卡片 ${cardId} 生成失败:`, error);
        results.failed.push({ cardId, error: error.message });
      }
    }

    return results;
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.LowFiGeneration;
}
