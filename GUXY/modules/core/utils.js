/**
 * GUXY工具函数
 * 提供通用的工具方法
 */

GUXY.Utils = {
  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * 转义HTML特殊字符
   * @param {string} str - 要转义的字符串
   * @returns {string} 转义后的字符串
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 压缩图片为缩略图
   * @param {File} file - 图片文件
   * @param {number} maxSize - 最大尺寸
   * @returns {Promise<string>} Base64缩略图
   */
  compressImageAsThumb(file, maxSize = 200) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * 深拷贝对象
   * @param {any} obj - 要拷贝的对象
   * @returns {any} 拷贝后的对象
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (obj instanceof Object) {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
  },

  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间(ms)
   * @returns {Function} 防抖后的函数
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 时间限制(ms)
   * @returns {Function} 节流后的函数
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @param {string} format - 格式字符串
   * @returns {string} 格式化后的日期
   */
  formatDate(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * 下载文件
   * @param {string} content - 文件内容
   * @param {string} filename - 文件名
   * @param {string} type - MIME类型
   */
  downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 读取文件内容
   * @param {File} file - 文件对象
   * @returns {Promise<string>} 文件内容
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  /**
   * 解析JSON文件
   * @param {File} file - JSON文件
   * @returns {Promise<object>} 解析后的对象
   */
  parseJSONFile(file) {
    return this.readFile(file).then(content => {
      try {
        return JSON.parse(content);
      } catch (error) {
        throw new Error('Invalid JSON file');
      }
    });
  },

  /**
   * 记录工作流程变更
   * @param {number} step - 当前步骤
   * @param {string} action - 执行的操作
   * @param {object} data - 相关数据
   */
  async logWorkflowChange(step, action, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      step,
      action,
      data
    };

    // 保存到本地存储
    const logs = JSON.parse(localStorage.getItem('guxy_workflow_logs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('guxy_workflow_logs', JSON.stringify(logs));

    // 如果有Logger模块，调用它
    if (GUXY.Logger && typeof GUXY.Logger.log === 'function') {
      await GUXY.Logger.log(logEntry);
    }
  },

  /**
   * 调用AI模型API
   * @param {string} model - 模型名称
   * @param {string} apiKey - API密钥
   * @param {string} baseUrl - 基础URL
   * @param {Array} messages - 消息列表
   * @param {object} [options] - 可选参数 { temperature, max_tokens }
   * @returns {Promise<object>} AI响应
   */
  async callAIModel(model, apiKey, baseUrl, messages, options) {
    console.log('='.repeat(60));
    console.log('🔍 callAIModel 开始');
    console.log('='.repeat(60));

    // 清理参数
    const cleanedApiKey = apiKey?.trim() || '';
    const cleanedBaseUrl = baseUrl?.trim() || '';
    const cleanedModel = model?.trim() || 'glm-4-flash';
    const opts = options || {};
    const temperature =
      typeof opts.temperature === 'number' ? opts.temperature : 0.7;
    const maxTokens =
      typeof opts.max_tokens === 'number' ? opts.max_tokens : 2000;

    console.log('📋 参数检查:');
    console.log('  Model:', cleanedModel);
    console.log('  Base URL:', cleanedBaseUrl);
    console.log('  API Key 存在:', !!cleanedApiKey);
    console.log('  API Key 长度:', cleanedApiKey.length);
    console.log('  API Key 前缀:', cleanedApiKey ? cleanedApiKey.substring(0, 8) + '...' : '(空)');
    console.log('  API Key 包含点号:', cleanedApiKey.includes('.'));
    console.log('  消息数量:', messages?.length || 0);
    console.log('  Temperature:', temperature);
    console.log('  Max tokens:', maxTokens);

    // 验证API Key
    if (!cleanedApiKey) {
      console.error('❌ API Key 为空');
      throw new Error('❌ API Key 未配置\n\n请在侧栏点击"⚙️ 配置 API"进行配置');
    }

    // 验证Base URL
    if (!cleanedBaseUrl) {
      console.error('❌ Base URL 为空');
      throw new Error('❌ Base URL 未配置');
    }

    // 构建URL
    let url = cleanedBaseUrl;
    if (!url.endsWith('/chat/completions')) {
      url = url.replace(/\/$/, '') + '/chat/completions';
    }

    console.log('🌐 请求URL:', url);

    // 构建请求体
    const requestBody = {
      model: cleanedModel,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens
    };

    console.log('📤 请求体:');
    console.log('  Model:', requestBody.model);
    console.log('  Messages:', requestBody.messages.length, '条');

    try {
      console.log('📡 发送API请求...');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanedApiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 响应状态:', response.status, response.statusText);

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorText = await response.text();
          console.error('❌ 错误详情:', errorText);
          errorDetail = errorText;
        } catch (e) {
          errorDetail = '无法读取错误详情';
        }

        // 根据状态码提供更友好的错误提示
        let userMessage = '';
        if (response.status === 401) {
          userMessage = '❌ 认证失败 (401 Unauthorized)\n\n可能的原因：\n1. API Key 不正确\n2. API Key 已过期\n3. API Key 格式错误（智谱AI的API Key应包含点号）\n\n请检查您的API Key配置';
        } else if (response.status === 403) {
          userMessage = '❌ 访问被拒绝 (403 Forbidden)\n\n可能的原因：\n1. API Key 没有相应权限\n2. 账户余额不足\n3. 超出API调用限制';
        } else if (response.status === 404) {
          userMessage = '❌ 接口不存在 (404 Not Found)\n\n可能的原因：\n1. Base URL 配置错误\n2. 模型名称不正确\n\n请检查API配置';
        } else if (response.status === 429) {
          userMessage = '❌ 请求过于频繁 (429 Too Many Requests)\n\n请稍后再试';
        } else {
          userMessage = `❌ API 请求失败 (${response.status})\n\n${response.statusText}\n\n错误详情: ${errorDetail}`;
        }

        console.error(userMessage);
        throw new Error(userMessage);
      }

      const data = await response.json();
      console.log('✅ API 请求成功');
      console.log('📄 响应数据:', {
        id: data.id,
        object: data.object,
        created: data.created,
        model: data.model,
        choices: data.choices?.length || 0,
        usage: data.usage
      });

      if (!data.choices || data.choices.length === 0) {
        console.error('❌ 响应中没有choices数据');
        throw new Error('API 返回数据格式错误');
      }

      const choice = data.choices[0];
      // 兼容不同接口：有的用 message，有的直接用 text
      let message = choice.message;

      // 情况1：choices[0] 直接是字符串（极简接口）
      if (typeof message === 'string') {
        message = { role: 'assistant', content: message };
      }

      // 情况2：没有 message，需要从 choice 的其它字段兜底（text / content / delta）
      if (!message) {
        if (typeof choice.text === 'string') {
          message = { role: 'assistant', content: choice.text };
        } else if (typeof choice.content === 'string') {
          message = { role: 'assistant', content: choice.content };
        } else if (choice.delta && typeof choice.delta.content === 'string') {
          message = { role: 'assistant', content: choice.delta.content };
        } else {
          message = { role: 'assistant', content: '' };
        }
      }

      // 兼容不同模型/接口的返回格式：
      // - content 可能是字符串或数组（如 OpenAI 多部分）
      // - 文本可能在 message.text / choice.text / choice.content 中
      let content = message.content;
      if (content == null && message.text != null) {
        content = message.text;
      }
      if (content == null && typeof choice.text === 'string') {
        content = choice.text;
      }
      if (content == null && typeof choice.content === 'string') {
        content = choice.content;
      }
      if (Array.isArray(content)) {
        content = content
          .map(function (part) {
            if (typeof part === 'string') return part;
            return part.text != null ? part.text : (part.content != null ? part.content : '');
          })
          .join('');
      }
      if (typeof content !== 'string') {
        content = String(content != null ? content : '');
      }

      // GLM-5 等模型可能将主要文本放在 reasoning_content 字段中，
      // 当 content 为空或只包含空白时，回退到 reasoning_content。
      if ((!content || !content.trim()) && message && typeof message.reasoning_content === 'string') {
        if (message.reasoning_content.trim()) {
          console.log('ℹ️ 使用 reasoning_content 作为内容（content 为空）');
          content = message.reasoning_content;
        }
      }

      // 部分实现会把 reasoning_content 挂在 choice 上而不是 message 上
      if ((!content || !content.trim()) && typeof choice.reasoning_content === 'string') {
        if (choice.reasoning_content.trim()) {
          console.log('ℹ️ 使用 choice.reasoning_content 作为内容（content 仍为空）');
          content = choice.reasoning_content;
        }
      }
      const normalizedMessage = { ...message, content };

      console.log('='.repeat(60));
      console.log('✨ callAIModel 成功完成');
      console.log('='.repeat(60));

      return normalizedMessage;
    } catch (error) {
      console.error('❌ AI API call failed:', error);
      console.log('='.repeat(60));
      throw error;
    }
  },

  /**
   * 调用视觉模型API（支持图片输入）
   * @param {Array} messages - 消息列表，content 可为字符串或数组 [{ type: "text", text: "..." }, { type: "image_url", image_url: { url: "data:image/...;base64,..." } }]
   * @param {object} [options] - 可选参数 { temperature, max_tokens }
   * @returns {Promise<object>} 归一化后的 assistant message
   */
  async callVisionModel(messages, options) {
    if (GUXY.State && GUXY.State.loadConfig) {
      GUXY.State.loadConfig();
    }
    const config = GUXY.State?.config?.visualModel;
    if (!config || !config.apiKey || !config.baseUrl || !config.model) {
      throw new Error('请先在 API 配置中填写视觉模型的 API Key、Base URL 和模型名称');
    }
    return this.callAIModel(
      config.model,
      config.apiKey,
      config.baseUrl,
      messages,
      { temperature: 0.3, max_tokens: 4096, ...options }
    );
  },

  /**
   * 验证项目名称
   * @param {string} name - 项目名称
   * @returns {boolean} 是否有效
   */
  validateProjectName(name) {
    if (!name || name.trim().length === 0) return false;
    if (name.length > GUXY.Constants.LIMITS.MAX_PROJECT_NAME_LENGTH) return false;
    return /^[a-zA-Z0-9\u4e00-\u9fa5_\-\s]+$/.test(name);
  },

  /**
   * 获取文件扩展名
   * @param {string} filename - 文件名
   * @returns {string} 扩展名（包含点）
   */
  getFileExtension(filename) {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : '';
  },

  /**
   * 检查文件类型是否支持
   * @param {string} filename - 文件名
   * @param {Array} allowedTypes - 允许的文件类型
   * @returns {boolean} 是否支持
   */
  isFileTypeSupported(filename, allowedTypes) {
    const ext = this.getFileExtension(filename);
    return allowedTypes.includes(ext);
  },

  /**
   * 清理空格
   * @param {string} str - 要清理的字符串
   * @returns {string} 清理后的字符串
   */
  trim(str) {
    if (typeof str !== 'string') return '';
    return str.trim();
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.Utils;
}
