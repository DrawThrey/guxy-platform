/**
 * GUXY分析进度弹窗组件
 * 显示策划案分析的4个阶段和进度
 */

GUXY.AnalysisProgressModal = {
  overlay: null,
  modal: null,
  currentStep: 0,
  isHiding: false, // 防抖标志
  isReviewMode: false, // 是否处于检查模式
  reviewData: null, // 检查数据
  editedTextContent: null, // 用户编辑后的TXT文本
  // 导入策划案后的 5 个阶段
  // 1. 提取文本信息（预处理 DocumentChunk）
  // 2. 文本信息转化（系统/功能/界面语义整理）
  // 3. 交互流程搭建（界面跳转关系）
  // 4. 卡片架构生成（集合 + 卡片 + 连线）
  // 5. 自检测（闭环 / 重叠 / 连线合理性）
  steps: [
    { id: 1, name: '文本提取', status: 'pending' },
    { id: 2, name: '文本转化', status: 'pending' },
    { id: 3, name: '流程搭建', status: 'pending' },
    { id: 4, name: '架构生成', status: 'pending' },
    { id: 5, name: '自检测', status: 'pending' }
  ],
  
  /**
   * 显示分析进度弹窗
   * @param {Function} onComplete - 分析完成回调
   * @returns {Promise<object>} 分析结果
   */
  async show(onComplete) {
    this.createModal();
    this.render();
    this.showOverlay();
    
    return new Promise((resolve, reject) => {
      this.resolveCallback = resolve;
      this.rejectCallback = reject;
      this.onCompleteCallback = onComplete;
    });
  },
  
  /**
   * 创建模态框
   */
  createModal() {
    // 移除已存在的模态框
    const existing = document.getElementById('analysis-progress-modal');
    if (existing) {
      existing.remove();
    }
    
    // 创建覆盖层
    this.overlay = document.createElement('div');
    this.overlay.className = 'analysis-progress-overlay';
    this.overlay.id = 'analysis-progress-overlay';
    
    // 创建模态框
    this.modal = document.createElement('div');
    this.modal.className = 'analysis-progress-modal';
    this.modal.id = 'analysis-progress-modal';
    
    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
  },
  
  /**
   * 渲染模态框内容
   */
  render() {
    if (!this.modal) return;
    
    const progress = Math.round((this.currentStep / this.steps.length) * 100);
    
    // 根据模式渲染不同内容
    if (this.isReviewMode && this.reviewData) {
      // 检查模式 - 可编辑TXT文本
      const textContent = this.reviewData.textContent || this.reviewData || '';
      this.modal.innerHTML = `
        <div class="analysis-progress-header">
          <h3 class="analysis-progress-title">检查并编辑TXT架构</h3>
          <button class="analysis-progress-close" id="btn-close-progress">×</button>
        </div>
        
        <div class="analysis-progress-body" style="padding: 0 16px;">
          <p style="margin: 8px 0; color: #666; font-size: 13px;">以下是AI根据策划案生成的TXT架构，您可以直接编辑内容，确认无误后点击"确认生成交互架构"。</p>
          <textarea id="txt-review-editor" style="width: 100%; height: 400px; font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; line-height: 1.5; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical; background: #fafafa; color: #333; white-space: pre; overflow-wrap: normal; overflow-x: auto;">${this.escapeHtml(typeof textContent === 'string' ? textContent : '')}</textarea>
        </div>
        
        <div class="analysis-progress-footer" style="display: block;">
          <div class="analysis-progress-actions">
            <button class="btn btn-secondary" id="btn-reconvert">重新转换</button>
            <button class="btn btn-primary" id="btn-confirm-continue">确认生成交互架构</button>
          </div>
        </div>
      `;
    } else {
      // 进度模式
      this.modal.innerHTML = `
        <div class="analysis-progress-header">
          <h3 class="analysis-progress-title">AI分析策划案</h3>
          <button class="analysis-progress-close" id="btn-close-progress">×</button>
        </div>
        
        <div class="analysis-progress-body">
          <div class="analysis-progress-bar">
            <div class="analysis-progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="analysis-progress-text">${progress}%</div>
          
          <div class="analysis-progress-steps">
            ${this.steps.map((step, index) => `
              <div class="analysis-progress-step ${step.status}" data-step="${step.id}">
                <div class="step-indicator">
                  ${step.status === 'completed' ? '✓' : step.status === 'active' ? '⟳' : '○'}
                </div>
                <div class="step-content">
                  <div class="step-name">${step.name}</div>
                  ${step.status === 'active' ? '<div class="step-status">处理中...</div>' : ''}
                  ${step.status === 'completed' ? '<div class="step-status">已完成</div>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="analysis-progress-footer" id="progress-footer" style="display: none;">
          <div class="analysis-complete-message">
            <p>分析完成！是否依据分析结果生成卡片架构？</p>
          </div>
          <div class="analysis-progress-actions">
            <button class="btn btn-secondary" id="btn-cancel-generate">取消</button>
            <button class="btn btn-primary" id="btn-confirm-generate">生成架构</button>
          </div>
        </div>
      `;
    }
    
    this.bindEvents();
  },
  
  /**
   * 显示检查结果（可编辑TXT文本）
   * @param {string|object} reviewData - TXT文本内容或包含textContent字段的对象
   */
  showReview(reviewData) {
    this.isReviewMode = true;
    // 支持直接传入字符串或对象
    if (typeof reviewData === 'string') {
      this.reviewData = { textContent: reviewData };
    } else if (reviewData && reviewData.textContent) {
      this.reviewData = reviewData;
    } else {
      this.reviewData = { textContent: '' };
    }
    this.editedTextContent = null;
    this.render();
    this.showOverlay();
  },

  /**
   * 获取用户编辑后的TXT文本
   * @returns {string|null} 编辑后的TXT文本
   */
  getEditedTextContent() {
    return this.editedTextContent;
  },
  
  /**
   * 隐藏检查结果，返回进度模式
   */
  hideReview() {
    this.isReviewMode = false;
    this.reviewData = null;
    this.render();
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
   * 绑定事件
   */
  bindEvents() {
    if (!this.modal) return;
    
    // 检查模式下的按钮
    if (this.isReviewMode) {
      // 重新转换按钮
      const reconvertBtn = this.modal.querySelector('#btn-reconvert');
      reconvertBtn?.addEventListener('click', () => {
        this.hide();
        if (this.resolveCallback) {
          this.resolveCallback({ action: 'reconvert' });
        }
      });
      
      // 确认继续按钮
      const confirmContinueBtn = this.modal.querySelector('#btn-confirm-continue');
      confirmContinueBtn?.addEventListener('click', () => {
        // 获取编辑后的TXT内容
        const editor = this.modal.querySelector('#txt-review-editor');
        if (editor) {
          this.editedTextContent = editor.value;
        }
        this.hideReview();
        this.currentStep = 2;
        this.updateProgress(2, 'active');
        if (this.resolveCallback) {
          this.resolveCallback({ action: 'continue', editedTextContent: this.editedTextContent });
        }
      });
    } else {
      // 进度模式下的按钮
      // 确认生成架构（旧版兼容）
      const confirmBtn = this.modal.querySelector('#btn-confirm-generate');
      confirmBtn?.addEventListener('click', () => {
        this.hide();
        if (this.resolveCallback) {
          this.resolveCallback({ generateArchitecture: true });
        }
        if (this.onCompleteCallback) {
          this.onCompleteCallback(true);
        }
      });
      
      // 取消生成架构（旧版兼容）
      const cancelBtn = this.modal.querySelector('#btn-cancel-generate');
      cancelBtn?.addEventListener('click', () => {
        this.hide();
        if (this.resolveCallback) {
          this.resolveCallback({ generateArchitecture: false });
        }
        if (this.onCompleteCallback) {
          this.onCompleteCallback(false);
        }
      });
    }
    
    // 关闭按钮（检查模式和进度模式都支持）
    const closeBtn = this.modal.querySelector('#btn-close-progress');
    closeBtn?.addEventListener('click', () => {
      if (this.currentStep < this.steps.length && !this.isReviewMode) {
        if (confirm('确定要关闭吗？')) {
          this.hide();
          if (this.rejectCallback) {
            this.rejectCallback(new Error('用户取消'));
          }
        }
      } else {
        this.hide();
      }
    });
  },
  
  /**
   * 更新进度
   * @param {number} step - 当前步骤（1-4）
   * @param {string} status - 状态（pending/active/completed）
   */
  updateProgress(step, status = 'active') {
    if (step < 1 || step > this.steps.length) return;
    
    // 更新当前步骤
    this.currentStep = step;
    
    // 更新步骤状态
    const stepIndex = step - 1;
    this.steps[stepIndex].status = status;
    
    // 如果当前步骤完成，标记为完成
    if (status === 'completed') {
      // 如果还有下一步，激活下一步
      if (step < this.steps.length) {
        this.steps[step].status = 'active';
        this.currentStep = step + 1;
      }
    }
    
    this.render();
  },
  
  /**
   * 完成所有步骤
   * @param {object} result - 分析结果
   */
  complete(result) {
    // 标记所有步骤为完成
    this.steps.forEach(step => {
      step.status = 'completed';
    });
    this.currentStep = this.steps.length;
    
    // 不显示确认对话框，直接关闭弹窗
    // 延迟关闭，让用户看到所有步骤都已完成
    setTimeout(() => {
      this.hide();
    }, 500);
    
    // 保存结果
    this.analysisResult = result;
  },
  
  /**
   * 显示覆盖层
   */
  showOverlay() {
    if (this.overlay) {
      this.overlay.style.display = 'flex';
      setTimeout(() => {
        this.overlay.classList.add('active');
      }, 10);
    }
  },
  
  /**
   * 隐藏模态框
   */
  hide() {
    // 防抖：如果已经在隐藏过程中，不重复执行
    if (this.isHiding) {
      console.log('[AnalysisProgressModal] Already hiding, skipping duplicate call');
      return;
    }
    
    this.isHiding = true;
    
    try {
      // 移除active类
      if (this.overlay) {
        this.overlay.classList.remove('active');
        
        // 延迟移除DOM，确保过渡动画完成
        setTimeout(() => {
          // 彻底移除overlay及其所有子元素
          if (this.overlay) {
            const parent = this.overlay.parentNode;
            if (parent) {
              parent.removeChild(this.overlay);
            }
          }
          
          // 检查并移除任何残留的overlay元素
          const remainingOverlays = document.querySelectorAll('.analysis-progress-overlay');
          remainingOverlays.forEach(el => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });
          
          // 检查并移除任何残留的modal元素
          const remainingModals = document.querySelectorAll('#analysis-progress-modal');
          remainingModals.forEach(el => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });
          
          // 重置状态
          this.currentStep = 0;
          this.steps.forEach(step => {
            step.status = 'pending';
          });
          this.overlay = null;
          this.modal = null;
          this.isHiding = false;
          this.isReviewMode = false;
          this.reviewData = null;
          this.editedTextContent = null;
          
          console.log('[AnalysisProgressModal] Successfully hidden and cleaned up');
        }, 300);
      } else {
        // 如果没有overlay，直接重置状态
        this.currentStep = 0;
        this.steps.forEach(step => {
          step.status = 'pending';
        });
        this.overlay = null;
        this.modal = null;
        this.isHiding = false;
        this.isReviewMode = false;
        this.reviewData = null;
        this.editedTextContent = null;
        
        console.log('[AnalysisProgressModal] No overlay to hide, reset state');
      }
    } catch (error) {
      console.error('[AnalysisProgressModal] Error during hide:', error);
      // 发生错误时也要重置状态
      this.currentStep = 0;
      this.steps.forEach(step => {
        step.status = 'pending';
      });
      this.overlay = null;
      this.modal = null;
      this.isHiding = false;
      this.isReviewMode = false;
      this.reviewData = null;
      this.editedTextContent = null;
    }
  },
  
  /**
   * 销毁组件
   */
  destroy() {
    this.hide();
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.AnalysisProgressModal;
}
