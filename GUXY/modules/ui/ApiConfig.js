/**
 * GUXY API配置管理模块
 * 管理AI API配置
 */

GUXY.ApiConfig = {
  currentTab: 'general', // general, visual, image, interaction

  /**
   * 显示API配置管理模态框
   */
  showConfigModal() {
    // 重新加载配置，确保显示最新值
    if (GUXY.State && GUXY.State.loadConfig) {
      GUXY.State.loadConfig();
    }

    const config = GUXY.State?.config || {};
    console.log('当前API配置:', {
      api: config.api,
      visualModel: config.visualModel,
      imageModel: config.imageModel,
      interactionSpecFile: config.interactionSpecFile
    });

    const generalConfig = config.api || {};
    const visualConfig = config.visualModel || {};
    const imageConfig = config.imageModel || {};
    const specFile = config.interactionSpecFile || {};

    const content = `
      <div class="api-config-container">
        <!-- Tab 导航 -->
        <div class="api-config-tabs">
          <button class="api-tab-btn active" data-tab="general">通用大模型配置</button>
          <button class="api-tab-btn" data-tab="visual">视觉模型配置</button>
          <button class="api-tab-btn" data-tab="image">生图模型配置</button>
          <button class="api-tab-btn" data-tab="interaction">交互规范文件</button>
        </div>

        <!-- 通用大模型配置 -->
        <div class="api-config-content active" data-content="general">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
              API Key
            </label>
            <input
              type="password"
              id="general-api-key-input"
              class="input"
              value="${this.escapeHtml(generalConfig.apiKey || '')}"
              placeholder="输入通用大模型 API Key"
            />
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
              Base URL
            </label>
            <input
              type="text"
              id="general-base-url-input"
              class="input"
              value="${this.escapeHtml(generalConfig.baseUrl || 'https://open.bigmodel.cn/api/paas/v4')}"
              placeholder="https://open.bigmodel.cn/api/paas/v4"
            />
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
              模型名称
            </label>
            <input
              type="text"
              id="general-model-input"
              class="input"
              value="${this.escapeHtml(generalConfig.model || 'glm-4-flash')}"
              placeholder="glm-4-flash"
            />
          </div>

          <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 1rem;">
            <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 0.5rem 0;">
              <strong>通用大模型说明：</strong>
            </p>
            <ul style="font-size: 11px; color: var(--text-muted); margin: 0; padding-left: 1.25rem;">
              <li>通用大模型用于AI分析策划案、生成架构、AI扩写描述等文本任务</li>
              <li>支持模型：智谱GLM-4系列、OpenAI GPT系列等</li>
              <li>智谱GLM-4默认：https://open.bigmodel.cn/api/paas/v4</li>
              <li>OpenAI GPT使用：https://api.openai.com/v1</li>
            </ul>
          </div>
        </div>

        <!-- 视觉模型配置 -->
        <div class="api-config-content" data-content="visual">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
              API Key
            </label>
            <input
              type="password"
              id="visual-api-key-input"
              class="input"
              value="${this.escapeHtml(visualConfig.apiKey || '')}"
              placeholder="输入视觉模型 API Key"
            />
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
              Base URL
            </label>
            <input
              type="text"
              id="visual-base-url-input"
              class="input"
              value="${this.escapeHtml(visualConfig.baseUrl || '')}"
              placeholder="https://api.example.com/v1"
            />
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
              模型名称
            </label>
            <input
              type="text"
              id="visual-model-input"
              class="input"
              value="${this.escapeHtml(visualConfig.model || '')}"
              placeholder="gpt-4-vision"
            />
          </div>

          <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 1rem;">
            <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 0.5rem 0;">
              <strong>视觉模型说明：</strong>
            </p>
            <ul style="font-size: 11px; color: var(--text-muted); margin: 0; padding-left: 1.25rem;">
              <li>视觉模型用于分析界面截图、识别UI元素</li>
              <li>支持模型：GPT-4 Vision、Claude 3.5 Sonnet等</li>
              <li>API格式需兼容OpenAI Vision API</li>
            </ul>
          </div>
        </div>

        <!-- 生图模型配置 -->
        <div class="api-config-content" data-content="image">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
              生图后端类型
            </label>
            <select id="image-provider-select" class="input">
              <option value="openai" ${imageConfig.provider === 'comfyui' ? '' : 'selected'}>
                通用 / OpenAI 兼容生图接口
              </option>
              <option value="comfyui" ${imageConfig.provider === 'comfyui' ? 'selected' : ''}>
                本地 ComfyUI 工作流 (api.json)
              </option>
            </select>
          </div>

          <!-- OpenAI / 通用生图接口配置 -->
          <div id="image-provider-openai-fields" style="${imageConfig.provider === 'comfyui' ? 'display:none;' : ''}">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
                API Key
              </label>
              <input
                type="password"
                id="image-api-key-input"
                class="input"
                value="${this.escapeHtml(imageConfig.apiKey || '')}"
                placeholder="输入生图模型 API Key"
              />
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
                Base URL
              </label>
              <input
                type="text"
                id="image-base-url-input"
                class="input"
                value="${this.escapeHtml(imageConfig.baseUrl || '')}"
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
                模型名称 / 请求格式
              </label>
              <div style="display: flex; gap: 0.5rem;">
                <input
                  type="text"
                  id="image-model-input"
                  class="input"
                  style="flex: 1 1 auto;"
                  value="${this.escapeHtml(imageConfig.model || '')}"
                  placeholder="dall-e-3（POST模式可留空）"
                />
                <select
                  id="image-request-mode-select"
                  class="input"
                  style="flex: 0 0 180px;"
                >
                  <option value="openai" ${imageConfig.requestMode === 'post' ? '' : 'selected'}>
                    OpenAI 兼容(JSON 带 model)
                  </option>
                  <option value="post" ${imageConfig.requestMode === 'post' ? 'selected' : ''}>
                    POST 通用(JSON 不含 model)
                  </option>
                </select>
              </div>
            </div>

            <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 1rem;">
              <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 0.5rem 0;">
                <strong>生图模型说明（通用接口）：</strong>
              </p>
              <ul style="font-size: 11px; color: var(--text-muted); margin: 0; padding-left: 1.25rem;">
                <li>用于通过 OpenAI / 智谱等兼容 Image API 的服务生成低保真交互原型图</li>
                <li>支持模型：DALL-E 3、Stable Diffusion Web API 等</li>
                <li>生成规格：896×1600px，黑白灰配色</li>
                <li>API格式需兼容 OpenAI Image API</li>
              </ul>
            </div>
          </div>

          <!-- 本地 ComfyUI 工作流配置 -->
          <div id="image-provider-comfyui-fields" style="${imageConfig.provider === 'comfyui' ? '' : 'display:none;'}">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
                ComfyUI Base URL
              </label>
              <input
                type="text"
                id="comfy-base-url-input"
                class="input"
                value="${this.escapeHtml(imageConfig.comfyBaseUrl || imageConfig.baseUrl || 'http://127.0.0.1:8188')}"
                placeholder="http://127.0.0.1:8188"
              />
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
                ComfyUI 工作流 api.json
              </label>
              ${imageConfig.comfyWorkflow?.fileName ? `
                <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 0.5rem;">
                  <p style="font-size: 12px; margin: 0 0 0.25rem 0;">
                    <strong>已上传:</strong> ${this.escapeHtml(imageConfig.comfyWorkflow.fileName)}
                  </p>
                  <p style="font-size: 11px; color: var(--text-muted); margin: 0;">
                    上传时间: ${imageConfig.comfyWorkflow.uploadedAt ? new Date(imageConfig.comfyWorkflow.uploadedAt).toLocaleString() : ''}
                  </p>
                </div>
              ` : ''}

              <label class="upload-btn" style="display: inline-block; padding: 0.5rem 1rem; background: var(--bg-secondary); border-radius: var(--radius-sm); cursor: pointer; font-size: 12px;">
                ${imageConfig.comfyWorkflow?.fileName ? '重新上传 api.json' : '上传 api.json'}
                <input type="file" id="comfy-workflow-file-input" accept=".json" style="display: none;" />
              </label>
            </div>

            <div id="comfy-workflow-preview" style="margin-bottom: 1rem;">
              ${imageConfig.comfyWorkflow?.content ? `
                <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
                  工作流 JSON 预览 (前500字符)
                </label>
                <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto;">
                  <pre style="font-size: 11px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(imageConfig.comfyWorkflow.content.substring(0, 500))}${imageConfig.comfyWorkflow.content.length > 500 ? '...' : ''}</pre>
                </div>
              ` : ''}
            </div>

            <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 1rem;">
              <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 0.5rem 0;">
                <strong>ComfyUI 集成说明：</strong>
              </p>
              <ul style="font-size: 11px; color: var(--text-muted); margin: 0; padding-left: 1.25rem;">
                <li>在 ComfyUI 中使用「Save (API)」导出工作流的 api.json，并在此上传。</li>
                <li>GUXY 会在该 JSON 中查找占位符字符串 <code>__GUXY_PROMPT__</code>，并在调用时替换为界面的低保真提示词。</li>
                <li>请在你的工作流中，将需要接收 Prompt 的文本字段设置为 <code>\"__GUXY_PROMPT__\"</code>。</li>
                <li>调用时会向 <code>/prompt</code> 发送请求，并轮询 <code>/history</code> 获取生成的图片。</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 交互规范文件 -->
        <div class="api-config-content" data-content="interaction">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
              交互规范MD文件
            </label>
            ${specFile.fileName ? `
              <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 0.5rem;">
                <p style="font-size: 12px; margin: 0 0 0.25rem 0;">
                  <strong>已上传:</strong> ${this.escapeHtml(specFile.fileName)}
                </p>
                <p style="font-size: 11px; color: var(--text-muted); margin: 0;">
                  上传时间: ${new Date(specFile.uploadedAt).toLocaleString()}
                </p>
                <p style="font-size: 11px; color: var(--text-muted); margin: 0;">
                  内容长度: ${specFile.content?.length || 0} 字符
                </p>
              </div>
            ` : ''}

            <label class="upload-btn" style="display: inline-block; padding: 0.5rem 1rem; background: var(--bg-secondary); border-radius: var(--radius-sm); cursor: pointer; font-size: 12px;">
              ${specFile.fileName ? '重新上传' : '上传MD文件'}
              <input type="file" id="interaction-spec-file-input" accept=".md,.markdown" style="display: none;" />
            </label>
          </div>

          <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 1rem;">
            <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 0.5rem 0;">
              <strong>交互规范说明：</strong>
            </p>
            <ul style="font-size: 11px; color: var(--text-muted); margin: 0; padding-left: 1.25rem;">
              <li>上传Markdown格式的交互规范文档</li>
              <li>规范将用于指导低保真原型图的生成</li>
              <li>文件大小限制：最大500KB</li>
              <li>支持格式：.md, .markdown</li>
            </ul>
          </div>

          <div id="spec-preview" style="margin-top: 1rem;">
            ${specFile.content ? `
              <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
                规范内容预览 (前500字符)
              </label>
              <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto;">
                <pre style="font-size: 11px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(specFile.content.substring(0, 500))}${specFile.content.length > 500 ? '...' : ''}</pre>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    if (!GUXY.Modal) {
      console.error('GUXY.Modal is not available');
      alert('Modal模块未加载，请刷新页面重试');
      return;
    }

    console.log('Showing API config modal');
    GUXY.Modal.show('API 配置', content, {
      onConfirm: () => this.saveAllConfigs(),
      onCancel: () => {
        console.log('API配置已取消');
      }
    });

    // 绑定Tab切换事件
    this.bindTabEvents();
    
    // 绑定交互规范文件上传事件
    this.bindFileUploadEvent();

    // 绑定生图后端类型与 ComfyUI 工作流上传事件
    this.bindImageProviderEvents();

    // 聚焦第一个输入框
    setTimeout(() => {
      const firstInput = document.getElementById('general-api-key-input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  },

  /**
   * 绑定Tab切换事件
   */
  bindTabEvents() {
    const tabBtns = document.querySelectorAll('.api-tab-btn');
    const tabContents = document.querySelectorAll('.api-config-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // 更新按钮状态
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 更新内容显示
        tabContents.forEach(content => {
          if (content.dataset.content === tab) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });

        this.currentTab = tab;
      });
    });
  },

  /**
   * 绑定文件上传事件
   */
  bindFileUploadEvent() {
    const fileInput = document.getElementById('interaction-spec-file-input');
    if (!fileInput) return;

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // 验证文件类型
      const validTypes = ['.md', '.markdown'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!validTypes.includes(fileExt)) {
        alert('请上传 .md 或 .markdown 格式的文件');
        return;
      }

      // 验证文件大小 (500KB)
      if (file.size > 500 * 1024) {
        alert('文件大小不能超过 500KB');
        return;
      }

      try {
        const content = await this.readFileAsText(file);

        // 更新预览
        const previewEl = document.getElementById('spec-preview');
        if (previewEl) {
          previewEl.innerHTML = `
            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
              规范内容预览 (前500字符)
            </label>
            <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto;">
              <pre style="font-size: 11px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(content.substring(0, 500))}${content.length > 500 ? '...' : ''}</pre>
            </div>
          `;
        }

        // 存储文件信息到临时对象
        this.tempSpecFile = {
          fileName: file.name,
          content: content,
          uploadedAt: new Date().toISOString()
        };

        alert('文件上传成功，请点击确认保存配置');
      } catch (error) {
        console.error('文件上传失败:', error);
        alert('文件读取失败: ' + error.message);
      }

      // 清空input，允许重新上传同一文件
      fileInput.value = '';
    });
  },

  /**
   * 绑定生图后端类型切换 & ComfyUI 工作流上传事件
   */
  bindImageProviderEvents() {
    const providerSelect = document.getElementById('image-provider-select');
    if (!providerSelect) return;

    const openaiFields = document.getElementById('image-provider-openai-fields');
    const comfyFields = document.getElementById('image-provider-comfyui-fields');

    const applyProviderVisibility = () => {
      const provider = providerSelect.value || 'openai';
      if (openaiFields) {
        openaiFields.style.display = provider === 'comfyui' ? 'none' : '';
      }
      if (comfyFields) {
        comfyFields.style.display = provider === 'comfyui' ? '' : 'none';
      }
    };

    providerSelect.addEventListener('change', applyProviderVisibility);
    // 初始应用一次
    applyProviderVisibility();

    // 绑定 ComfyUI 工作流文件上传
    const comfyFileInput = document.getElementById('comfy-workflow-file-input');
    if (comfyFileInput) {
      comfyFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        if (fileExt !== '.json') {
          alert('请上传 ComfyUI 导出的 api.json 文件（.json 格式）');
          comfyFileInput.value = '';
          return;
        }

        // 简单大小限制：2MB
        if (file.size > 2 * 1024 * 1024) {
          alert('api.json 文件大小不能超过 2MB');
          comfyFileInput.value = '';
          return;
        }

        try {
          const content = await this.readFileAsText(file);

          // 验证 JSON 合法性
          try {
            JSON.parse(content);
          } catch (err) {
            console.error('ComfyUI 工作流 JSON 解析失败:', err);
            alert('api.json 无法解析为合法 JSON，请检查文件是否正确。');
            comfyFileInput.value = '';
            return;
          }

          // 存储到临时对象，等待保存时写入 config
          this.tempComfyWorkflow = {
            fileName: file.name,
            content,
            uploadedAt: new Date().toISOString()
          };

          // 更新预览
          const previewEl = document.getElementById('comfy-workflow-preview');
          if (previewEl) {
            previewEl.innerHTML = `
              <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 0.5rem;">
                工作流 JSON 预览 (前500字符)
              </label>
              <div style="padding: 0.75rem; background: var(--bg-card); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto;">
                <pre style="font-size: 11px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(content.substring(0, 500))}${content.length > 500 ? '...' : ''}</pre>
              </div>
            `;
          }

          alert('ComfyUI 工作流已上传，请点击确认保存配置');
        } catch (error) {
          console.error('读取 ComfyUI 工作流文件失败:', error);
          alert('读取文件失败: ' + error.message);
        }

        // 允许重新上传同一文件
        comfyFileInput.value = '';
      });
    }
  },

  /**
   * 读取文件为文本
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  /**
   * 保存所有配置
   */
  saveAllConfigs() {
    const modalContainer = document.querySelector('.modal-overlay.active .modal-body');
    if (!modalContainer) {
      console.error('Modal body not found');
      alert('配置界面加载失败');
      return false;
    }

    // 获取通用大模型配置
    const generalApiKeyEl = modalContainer.querySelector('#general-api-key-input');
    const generalBaseUrlEl = modalContainer.querySelector('#general-base-url-input');
    const generalModelEl = modalContainer.querySelector('#general-model-input');

    // 获取视觉模型配置
    const visualApiKeyEl = modalContainer.querySelector('#visual-api-key-input');
    const visualBaseUrlEl = modalContainer.querySelector('#visual-base-url-input');
    const visualModelEl = modalContainer.querySelector('#visual-model-input');

    // 获取生图模型配置
    const imageProviderEl = modalContainer.querySelector('#image-provider-select');
    const imageApiKeyEl = modalContainer.querySelector('#image-api-key-input');
    const imageBaseUrlEl = modalContainer.querySelector('#image-base-url-input');
    const imageModelEl = modalContainer.querySelector('#image-model-input');
    const imageRequestModeEl = modalContainer.querySelector('#image-request-mode-select');
    const comfyBaseUrlEl = modalContainer.querySelector('#comfy-base-url-input');

    if (!generalApiKeyEl || !generalBaseUrlEl || !generalModelEl ||
        !visualApiKeyEl || !visualBaseUrlEl || !visualModelEl ||
        !imageProviderEl || !imageApiKeyEl || !imageBaseUrlEl || !imageModelEl || !imageRequestModeEl || !comfyBaseUrlEl) {
      console.error('配置输入框未找到');
      alert('配置界面加载失败，请刷新页面重试');
      return false;
    }

    const existingImageConfig = GUXY.State?.config?.imageModel || {};

    const configToSave = {
      api: {
        apiKey: generalApiKeyEl.value.trim(),
        baseUrl: generalBaseUrlEl.value.trim(),
        model: generalModelEl.value.trim()
      },
      visualModel: {
        apiKey: visualApiKeyEl.value.trim(),
        baseUrl: visualBaseUrlEl.value.trim(),
        model: visualModelEl.value.trim()
      },
      imageModel: {
        apiKey: imageApiKeyEl.value.trim(),
        baseUrl: imageBaseUrlEl.value.trim(),
        model: imageModelEl.value.trim(),
        provider: imageProviderEl.value || existingImageConfig.provider || 'openai',
        comfyBaseUrl: comfyBaseUrlEl.value.trim() || existingImageConfig.comfyBaseUrl || '',
        requestMode: imageRequestModeEl.value || existingImageConfig.requestMode || 'openai'
      }
    };

    // 如果当前选择的是 ComfyUI，并且上传了新的工作流，则一并保存
    if (configToSave.imageModel.provider === 'comfyui' && this.tempComfyWorkflow) {
      configToSave.imageModel.comfyWorkflow = this.tempComfyWorkflow;
      this.tempComfyWorkflow = null;
    }

    // 如果有上传的交互规范文件，也保存
    if (this.tempSpecFile) {
      configToSave.interactionSpecFile = this.tempSpecFile;
      this.tempSpecFile = null;
    }

    console.log('Saving config:', configToSave);

    // 检查State模块
    if (!GUXY.State) {
      console.error('GUXY.State is not available');
      alert('保存失败：State模块未加载');
      return false;
    }

    if (typeof GUXY.State.saveConfig !== 'function') {
      console.error('GUXY.State.saveConfig is not a function');
      alert('保存失败：saveConfig方法不存在');
      return false;
    }

    try {
      // 保存配置
      GUXY.State.saveConfig(configToSave);

      // 立即验证保存结果
      const savedInStorage = localStorage.getItem(GUXY.Constants.STORAGE_KEYS.API_CONFIG);
      console.log('Saved to localStorage:', savedInStorage);

      // 重新加载配置
      if (GUXY.State.loadConfig) {
        GUXY.State.loadConfig();
      }

      // 再次验证
      const savedConfig = GUXY.State.config;
      console.log('Config after reload:', {
        hasGeneralModel: !!savedConfig.api?.apiKey,
        hasVisualModel: !!savedConfig.visualModel?.apiKey,
        hasImageModel: !!savedConfig.imageModel?.apiKey,
        hasInteractionSpec: !!savedConfig.interactionSpecFile?.fileName
      });

      alert('✅ API 配置已保存成功！');
      return true;
    } catch (saveError) {
      console.error('保存配置时出错:', saveError);
      alert('保存失败: ' + saveError.message);
      return false;
    }
  },
  
  /**
   * 转义HTML
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
   * 获取当前API配置
   * @returns {object} API配置
   */
  getConfig() {
    return GUXY.State?.config?.api || {};
  },
  
  /**
   * 检查API配置是否完整
   * @returns {boolean} 是否配置完整
   */
  isConfigured() {
    const config = this.getConfig();
    return !!(config.apiKey && config.baseUrl);
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.ApiConfig;
}
