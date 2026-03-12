/**
 * GUXY Ralph Loop 模块
 * 自动迭代优化交互架构
 */

GUXY.RalphLoop = {
  // 状态
  isRunning: false,
  isPaused: false,
  currentRound: 0,
  maxRounds: 3,

  // 回调
  onProgress: null,
  onRoundComplete: null,
  onComplete: null,
  onError: null,

  /**
   * 初始化
   */
  init() {
    console.log('RalphLoop initialized');
  },

  /**
   * 启动迭代循环
   * @param {number} maxRounds - 最大轮次
   * @param {object} options - 配置选项
   */
  async start(maxRounds = 3, options = {}) {
    if (this.isRunning) {
      GUXY.Toast?.show('Ralph Loop 正在运行中', 'warning');
      return;
    }

    // 检查是否有架构数据
    const architecture = GUXY.State?.currentProject?.architecture;
    if (!architecture || !architecture.cards?.length) {
      GUXY.Toast?.show('请先生成交互架构', 'warning');
      return;
    }

    // 检查 API 配置
    const config = GUXY.State?.config?.api;
    if (!config?.apiKey || !config?.baseUrl) {
      GUXY.Toast?.show('请先配置 AI API', 'warning');
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.currentRound = 0;
    this.maxRounds = maxRounds;
    this.onProgress = options.onProgress;
    this.onRoundComplete = options.onRoundComplete;
    this.onComplete = options.onComplete;
    this.onError = options.onError;

    GUXY.Toast?.show(`Ralph Loop 启动，将进行 ${maxRounds} 轮优化`, 'info');

    try {
      while (this.currentRound < this.maxRounds && this.isRunning) {
        if (this.isPaused) {
          await this.wait(500);
          continue;
        }

        this.currentRound++;

        // 通知进度
        this.notifyProgress({
          round: this.currentRound,
          maxRounds: this.maxRounds,
          status: 'running',
          message: `正在执行第 ${this.currentRound} 轮优化...`
        });

        // 执行单轮迭代
        await this.runIteration();

        // 通知轮次完成
        this.notifyRoundComplete({
          round: this.currentRound,
          maxRounds: this.maxRounds
        });

        // 轮次间隔
        if (this.currentRound < this.maxRounds && this.isRunning) {
          await this.wait(1000);
        }
      }

      // 完成
      this.isRunning = false;
      this.notifyProgress({
        round: this.currentRound,
        maxRounds: this.maxRounds,
        status: 'completed',
        message: '优化完成'
      });

      GUXY.Toast?.show(`Ralph Loop 完成，共优化 ${this.currentRound} 轮`, 'success');

      if (this.onComplete) {
        this.onComplete({ rounds: this.currentRound });
      }

    } catch (error) {
      this.isRunning = false;
      console.error('Ralph Loop error:', error);

      this.notifyProgress({
        round: this.currentRound,
        maxRounds: this.maxRounds,
        status: 'error',
        message: error.message
      });

      if (this.onError) {
        this.onError(error);
      }

      GUXY.Toast?.show(`优化失败: ${error.message}`, 'error');
    }
  },

  /**
   * 执行单轮迭代
   */
  async runIteration() {
    const architecture = GUXY.State?.currentProject?.architecture;
    if (!architecture) {
      throw new Error('没有可优化的架构');
    }

    // 获取优化建议
    const suggestions = await this.getOptimizationSuggestions(architecture);

    // 应用优化
    const optimizedArchitecture = await this.applyOptimization(architecture, suggestions);

    // 更新项目架构
    if (GUXY.State?.currentProject) {
      GUXY.State.updateProject(GUXY.State.currentProject.id, {
        architecture: optimizedArchitecture
      });
    }

    // 重新渲染画布
    if (GUXY.ArchitectureGen) {
      GUXY.ArchitectureGen.applyToCanvas(optimizedArchitecture);
    }

    // 刷新侧栏
    if (GUXY.Sidebar) {
      GUXY.Sidebar.refresh();
    }

    return optimizedArchitecture;
  },

  /**
   * 获取优化建议
   * @param {object} architecture - 当前架构
   * @returns {Promise<object>} 优化建议
   */
  async getOptimizationSuggestions(architecture) {
    const config = GUXY.State?.config?.api;
    if (!config?.apiKey || !config?.baseUrl) {
      throw new Error('API 未配置');
    }

    // 构建架构摘要
    const archSummary = this.buildArchitectureSummary(architecture);

    const prompt = `你是一个游戏交互架构优化专家。请分析以下交互架构，并提供优化建议。

## 当前架构摘要

**集合 (${architecture.collections?.length || 0} 个):**
${(architecture.collections || []).map(c => `- ${c.id}: ${c.title} (${c.type || 'system'})`).join('\n')}

**卡片 (${architecture.cards?.length || 0} 个):**
${(architecture.cards || []).map(c => `- ${c.id}: ${c.title} [${c.interface_level || 1}级] (属于: ${c.collection_id})`).join('\n')}

**卡片连线 (${architecture.cardLinks?.length || 0} 条):**
${(architecture.cardLinks || []).map(l => `- ${l.from_card_id} -> ${l.to_card_id}: ${l.label || '无标签'}`).join('\n')}

**集合连线 (${architecture.collectionLinks?.length || 0} 条):**
${(architecture.collectionLinks || []).map(l => `- ${l.from_collection_id} -> ${l.to_collection_id}: ${l.label || '无标签'}`).join('\n')}

## 优化目标

请从以下几个维度提供优化建议：

1. **完整性优化**：检查是否有孤立节点、缺失的连线、不完整的层级关系
2. **一致性优化**：检查ID引用是否正确、层级关系是否合理
3. **丰富度优化**：为描述简短的卡片补充详细内容，为连线添加更明确的标签

## 输出格式

请以JSON格式返回优化建议：

\`\`\`json
{
  "analysis": {
    "score": 85,
    "issues": ["问题1", "问题2"],
    "strengths": ["优点1"]
  },
  "suggestions": [
    {
      "type": "add_card",
      "data": {
        "id": "new_card_id",
        "title": "新卡片标题",
        "description": "卡片描述",
        "type": "screen",
        "interface_level": 2,
        "collection_id": "所属集合ID"
      },
      "reason": "添加原因"
    },
    {
      "type": "add_link",
      "data": {
        "id": "new_link_id",
        "from_card_id": "来源卡片",
        "to_card_id": "目标卡片",
        "label": "连线标签"
      },
      "reason": "添加原因"
    },
    {
      "type": "update_card",
      "target_id": "card_id",
      "data": {
        "description": "更新后的描述"
      },
      "reason": "更新原因"
    },
    {
      "type": "update_link",
      "target_id": "link_id",
      "data": {
        "label": "更新后的标签"
      },
      "reason": "更新原因"
    }
  ]
}
\`\`\`

注意：
- 每次优化建议不要超过 5 条
- 优先解决架构的完整性和一致性问题
- 新增的 ID 必须唯一，不能与现有 ID 重复`;

    const response = await GUXY.Utils.callAIModel(
      config.model || 'glm-4-flash',
      config.apiKey.trim(),
      config.baseUrl.trim(),
      [{ role: 'user', content: prompt }],
      {
        max_tokens: 4000,
        temperature: 0.5
      }
    );

    // 解析响应
    return this.parseOptimizationResponse(response.content);
  },

  /**
   * 解析优化响应
   * @param {string} content - AI 响应内容
   * @returns {object} 解析后的建议
   */
  parseOptimizationResponse(content) {
    try {
      // 提取 JSON
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }

      // 尝试直接解析
      const jsonObj = content.match(/\{[\s\S]*\}/);
      if (jsonObj) {
        return JSON.parse(jsonObj[0]);
      }

      throw new Error('无法解析 AI 响应');
    } catch (e) {
      console.error('Parse optimization response error:', e);
      return {
        analysis: { score: 0, issues: ['解析失败'], strengths: [] },
        suggestions: []
      };
    }
  },

  /**
   * 应用优化建议
   * @param {object} architecture - 当前架构
   * @param {object} suggestions - 优化建议
   * @returns {object} 优化后的架构
   */
  async applyOptimization(architecture, suggestions) {
    // 深拷贝架构
    const newArch = JSON.parse(JSON.stringify(architecture));

    if (!suggestions.suggestions || !suggestions.suggestions.length) {
      console.log('No suggestions to apply');
      return newArch;
    }

    // 获取现有 ID 集合
    const existingIds = new Set([
      ...(newArch.collections || []).map(c => c.id),
      ...(newArch.cards || []).map(c => c.id),
      ...(newArch.cardLinks || []).map(l => l.id),
      ...(newArch.collectionLinks || []).map(l => l.id)
    ]);

    // 应用每条建议
    for (const suggestion of suggestions.suggestions) {
      try {
        switch (suggestion.type) {
          case 'add_card':
            if (suggestion.data && !existingIds.has(suggestion.data.id)) {
              newArch.cards = newArch.cards || [];
              newArch.cards.push(suggestion.data);
              existingIds.add(suggestion.data.id);
              console.log(`[Ralph Loop] 添加卡片: ${suggestion.data.id}`);
            }
            break;

          case 'add_link':
            if (suggestion.data && !existingIds.has(suggestion.data.id)) {
              // 验证连线引用是否存在
              const fromExists = newArch.cards?.some(c => c.id === suggestion.data.from_card_id);
              const toExists = newArch.cards?.some(c => c.id === suggestion.data.to_card_id);
              if (fromExists && toExists) {
                newArch.cardLinks = newArch.cardLinks || [];
                newArch.cardLinks.push(suggestion.data);
                existingIds.add(suggestion.data.id);
                console.log(`[Ralph Loop] 添加连线: ${suggestion.data.id}`);
              }
            }
            break;

          case 'update_card':
            if (suggestion.target_id && suggestion.data) {
              const card = newArch.cards?.find(c => c.id === suggestion.target_id);
              if (card) {
                Object.assign(card, suggestion.data);
                console.log(`[Ralph Loop] 更新卡片: ${suggestion.target_id}`);
              }
            }
            break;

          case 'update_link':
            if (suggestion.target_id && suggestion.data) {
              const link = newArch.cardLinks?.find(l => l.id === suggestion.target_id);
              if (link) {
                Object.assign(link, suggestion.data);
                console.log(`[Ralph Loop] 更新连线: ${suggestion.target_id}`);
              }
            }
            break;

          case 'add_collection':
            if (suggestion.data && !existingIds.has(suggestion.data.id)) {
              newArch.collections = newArch.collections || [];
              newArch.collections.push(suggestion.data);
              existingIds.add(suggestion.data.id);
              console.log(`[Ralph Loop] 添加集合: ${suggestion.data.id}`);
            }
            break;

          case 'add_collection_link':
            if (suggestion.data && !existingIds.has(suggestion.data.id)) {
              const fromExists = newArch.collections?.some(c => c.id === suggestion.data.from_collection_id);
              const toExists = newArch.collections?.some(c => c.id === suggestion.data.to_collection_id);
              if (fromExists && toExists) {
                newArch.collectionLinks = newArch.collectionLinks || [];
                newArch.collectionLinks.push(suggestion.data);
                existingIds.add(suggestion.data.id);
                console.log(`[Ralph Loop] 添加集合连线: ${suggestion.data.id}`);
              }
            }
            break;
        }
      } catch (e) {
        console.warn('[Ralph Loop] 应用建议失败:', e);
      }
    }

    // 保存分析分数到状态
    if (suggestions.analysis) {
      newArch.ralphLoopMeta = {
        lastAnalysis: suggestions.analysis,
        lastRoundAt: new Date().toISOString()
      };
    }

    return newArch;
  },

  /**
   * 构建架构摘要
   * @param {object} architecture - 架构数据
   * @returns {string} 摘要文本
   */
  buildArchitectureSummary(architecture) {
    let summary = '';

    summary += `集合数: ${architecture.collections?.length || 0}\n`;
    summary += `卡片数: ${architecture.cards?.length || 0}\n`;
    summary += `卡片连线数: ${architecture.cardLinks?.length || 0}\n`;
    summary += `集合连线数: ${architecture.collectionLinks?.length || 0}\n`;

    return summary;
  },

  /**
   * 停止循环
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    GUXY.Toast?.show('Ralph Loop 已停止', 'info');

    this.notifyProgress({
      round: this.currentRound,
      maxRounds: this.maxRounds,
      status: 'stopped',
      message: '已停止'
    });
  },

  /**
   * 暂停循环
   */
  pause() {
    this.isPaused = true;
    GUXY.Toast?.show('Ralph Loop 已暂停', 'info');
  },

  /**
   * 恢复循环
   */
  resume() {
    this.isPaused = false;
    GUXY.Toast?.show('Ralph Loop 继续运行', 'info');
  },

  /**
   * 获取当前状态
   * @returns {object} 状态信息
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      progress: this.maxRounds > 0 ? Math.round((this.currentRound / this.maxRounds) * 100) : 0
    };
  },

  /**
   * 通知进度更新
   * @param {object} data - 进度数据
   */
  notifyProgress(data) {
    if (this.onProgress) {
      this.onProgress(data);
    }

    // 分发自定义事件
    const event = new CustomEvent('ralphLoopProgress', { detail: data });
    document.dispatchEvent(event);
  },

  /**
   * 通知轮次完成
   * @param {object} data - 轮次数据
   */
  notifyRoundComplete(data) {
    if (this.onRoundComplete) {
      this.onRoundComplete(data);
    }
  },

  /**
   * 等待
   * @param {number} ms - 毫秒数
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 显示 Ralph Loop 面板
   */
  showPanel() {
    // 创建面板
    let panel = document.getElementById('ralph-loop-panel');

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'ralph-loop-panel';
      panel.className = 'ralph-loop-panel';
      panel.innerHTML = `
        <div class="ralph-loop-header">
          <span class="ralph-loop-title">Ralph Loop</span>
          <button class="ralph-loop-close" onclick="GUXY.RalphLoop.hidePanel()">×</button>
        </div>
        <div class="ralph-loop-body">
          <div class="ralph-loop-status">
            <span class="ralph-loop-status-text">就绪</span>
          </div>
          <div class="ralph-loop-rounds">
            <label>迭代轮次:</label>
            <input type="number" id="ralph-loop-rounds-input" value="3" min="1" max="10">
          </div>
          <div class="ralph-loop-progress">
            <div class="ralph-loop-progress-bar">
              <div class="ralph-loop-progress-fill" style="width: 0%"></div>
            </div>
            <span class="ralph-loop-progress-text">0%</span>
          </div>
          <div class="ralph-loop-actions">
            <button class="btn btn-primary btn-ralph-start" onclick="GUXY.RalphLoop.startFromPanel()">
              开始优化
            </button>
            <button class="btn btn-secondary btn-ralph-pause" onclick="GUXY.RalphLoop.togglePause()" style="display:none;">
              暂停
            </button>
            <button class="btn btn-danger btn-ralph-stop" onclick="GUXY.RalphLoop.stop()" style="display:none;">
              停止
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(panel);

      // 监听进度事件
      document.addEventListener('ralphLoopProgress', (e) => {
        this.updatePanelUI(e.detail);
      });
    }

    panel.style.display = 'block';
    this.updatePanelUI(this.getStatus());
  },

  /**
   * 从面板启动
   */
  startFromPanel() {
    const input = document.getElementById('ralph-loop-rounds-input');
    const rounds = parseInt(input?.value || '3', 10);

    this.start(rounds, {
      onProgress: (data) => this.updatePanelUI(data)
    });
  },

  /**
   * 切换暂停
   */
  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }

    this.updatePanelUI(this.getStatus());
  },

  /**
   * 更新面板 UI
   * @param {object} data - 状态数据
   */
  updatePanelUI(data) {
    const panel = document.getElementById('ralph-loop-panel');
    if (!panel) return;

    const statusText = panel.querySelector('.ralph-loop-status-text');
    const progressFill = panel.querySelector('.ralph-loop-progress-fill');
    const progressText = panel.querySelector('.ralph-loop-progress-text');
    const startBtn = panel.querySelector('.btn-ralph-start');
    const pauseBtn = panel.querySelector('.btn-ralph-pause');
    const stopBtn = panel.querySelector('.btn-ralph-stop');

    if (statusText) {
      if (data.status === 'running') {
        statusText.textContent = data.message || `第 ${data.round}/${data.maxRounds} 轮`;
        statusText.className = 'ralph-loop-status-text running';
      } else if (data.status === 'completed') {
        statusText.textContent = '优化完成';
        statusText.className = 'ralph-loop-status-text completed';
      } else if (data.status === 'error') {
        statusText.textContent = data.message || '出错了';
        statusText.className = 'ralph-loop-status-text error';
      } else if (data.status === 'stopped') {
        statusText.textContent = '已停止';
        statusText.className = 'ralph-loop-status-text stopped';
      } else {
        statusText.textContent = '就绪';
        statusText.className = 'ralph-loop-status-text';
      }
    }

    const progress = data.progress || (data.maxRounds > 0 ? Math.round((data.round / data.maxRounds) * 100) : 0);
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    if (progressText) {
      progressText.textContent = `${progress}%`;
    }

    // 更新按钮状态
    if (startBtn && pauseBtn && stopBtn) {
      if (this.isRunning) {
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        stopBtn.style.display = 'inline-block';
      } else {
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
      }
    }
  },

  /**
   * 隐藏面板
   */
  hidePanel() {
    const panel = document.getElementById('ralph-loop-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  },

  /**
   * 销毁
   */
  destroy() {
    this.stop();
    this.hidePanel();
    const panel = document.getElementById('ralph-loop-panel');
    if (panel) {
      panel.remove();
    }
    console.log('RalphLoop destroyed');
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.RalphLoop;
}
