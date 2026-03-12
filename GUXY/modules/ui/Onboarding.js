/**
 * GUXY 新手引导模块
 * 首次访问时自动触发交互式引导
 */

GUXY.Onboarding = {
  // 存储键
  STORAGE_KEY: 'guxy_onboarding_completed',
  
  // 当前步骤索引
  currentStep: 0,
  
  // DOM元素
  overlay: null,
  tooltip: null,
  
  // 引导步骤配置
  steps: [
    {
      id: 'api-config',
      title: '配置 AI API',
      content: `
        <p>首先需要配置 AI API 才能使用智能功能。</p>
        <p>点击左侧的 <strong>"API配置"</strong> 按钮，输入您的 API Key。</p>
        <ul>
          <li>支持智谱 GLM-4、OpenAI GPT 等</li>
          <li>配置保存后即可使用 AI 分析功能</li>
        </ul>
      `,
      target: '.btn-api-config',
      placement: 'right',
      canSkip: false
    },
    {
      id: 'import-plan',
      title: '导入策划案',
      content: `
        <p>您可以导入游戏策划案，让 AI 自动分析并生成界面架构。</p>
        <p>点击底部工具栏的 <strong>"导入策划案"</strong> 按钮即可开始。</p>
        <ul>
          <li>支持 Word、Markdown 等格式</li>
          <li>AI 将自动识别功能模块和界面层级</li>
        </ul>
      `,
      target: '#btn-import-design-doc',
      placement: 'top',
      canSkip: true
    },
    {
      id: 'edit-text',
      title: '编辑卡片内容',
      content: `
        <p>点击任意卡片节点，右侧将显示 <strong>详情侧栏</strong>。</p>
        <p>在这里您可以：</p>
        <ul>
          <li>修改卡片标题和描述</li>
          <li>使用 AI 扩写描述内容</li>
          <li>生成低保真原型图</li>
        </ul>
      `,
      target: '#detail-sidebar',
      placement: 'left',
      canSkip: false,
      waitForElement: true,
      elementCheck: () => {
        const sidebar = document.getElementById('detail-sidebar');
        return sidebar && sidebar.classList.contains('active');
      }
    },
    {
      id: 'subcanvas',
      title: '进入子画布',
      content: `
        <p><strong>双击</strong> 任意集合节点，可以进入子画布视图。</p>
        <p>在子画布中您可以：</p>
        <ul>
          <li>查看该集合下的所有卡片</li>
          <li>按界面层级组织卡片（一级/二级/三级界面）</li>
          <li>批量进行 AI 改写和生成低保真</li>
        </ul>
      `,
      target: '.collection-node',
      placement: 'bottom',
      canSkip: false,
      waitForElement: true
    },
    {
      id: 'create-card',
      title: '创建与拖拽卡片',
      content: `
        <p>您可以随时创建新的卡片或集合：</p>
        <ul>
          <li>点击 <strong>"新建卡片"</strong> 按钮创建卡片</li>
          <li>点击 <strong>"新建集合"</strong> 按钮创建集合</li>
          <li><strong>拖拽</strong> 卡片可以自由调整位置</li>
          <li>拖拽卡片边缘可以创建连线</li>
        </ul>
      `,
      target: '#btn-add-card',
      placement: 'top',
      canSkip: false
    }
  ],
  
  /**
   * 初始化引导模块
   */
  init() {
    console.log('Onboarding module initialized');
  },
  
  /**
   * 检查是否已完成引导
   */
  isCompleted() {
    try {
      return localStorage.getItem(this.STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  },
  
  /**
   * 开始引导
   */
  start() {
    if (this.isCompleted()) {
      console.log('Onboarding already completed');
      return;
    }
    
    this.currentStep = 1;
    this.createOverlay();
    this.showStep(this.currentStep);
    console.log('Onboarding started');
  },
  
  /**
   * 创建遮罩层
   */
  createOverlay() {
    // 如果已存在则先移除
    this.destroyOverlay();
    
    // 创建遮罩
    this.overlay = document.createElement('div');
    this.overlay.className = 'onboarding-overlay active';
    
    // 创建镂空高亮区域
    const spotlight = document.createElement('div');
    spotlight.id = 'onboarding-spotlight';
    spotlight.className = 'onboarding-spotlight';
    
    this.overlay.appendChild(spotlight);
    document.body.appendChild(this.overlay);
  },
  
  /**
   * 销毁遮罩层
   */
  destroyOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
    
    // 移除所有高亮
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
  },
  
  /**
   * 显示指定步骤
   */
  showStep(stepIndex) {
    if (stepIndex < 1 || stepIndex > this.steps.length) {
      return;
    }
    
    const step = this.steps[stepIndex - 1];
    
    // 检查是否需要等待元素
    if (step.waitForElement) {
      const targetEl = document.querySelector(step.target);
      const isReady = targetEl && (!step.elementCheck || step.elementCheck());
      
      if (!isReady) {
        this.showWaitingTooltip(stepIndex);
        this.waitForElement(stepIndex);
        return;
      }
    }
    
    this.highlightTarget(step);
    this.showTooltip(step, stepIndex);
  },
  
  /**
   * 等待元素出现
   */
  waitForElement(stepIndex) {
    const step = this.steps[stepIndex - 1];
    let resolved = false;
    
    const checkInterval = setInterval(() => {
      if (resolved) {
        clearInterval(checkInterval);
        return;
      }
      
      const targetEl = document.querySelector(step.target);
      const isReady = targetEl && (!step.elementCheck || step.elementCheck());
      
      if (isReady) {
        resolved = true;
        clearInterval(checkInterval);
        this.showStep(stepIndex);
      }
    }, 500);
    
    // 30秒超时
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        clearInterval(checkInterval);
      }
    }, 30000);
  },
  
  /**
   * 显示等待提示
   */
  showWaitingTooltip(stepIndex) {
    const step = this.steps[stepIndex - 1];
    
    // 移除旧提示
    if (this.tooltip) {
      this.tooltip.remove();
    }
    
    // 创建居中提示
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'onboarding-welcome';
    this.tooltip.innerHTML = `
      <h2>准备进行下一步</h2>
      <p>${this.getWaitingMessage(stepIndex)}</p>
      <div style="display: flex; justify-content: center; gap: 12px; margin-top: 16px;">
        ${step.canSkip ? '<button class="onboarding-btn onboarding-btn-skip" data-action="skip">跳过此步</button>' : ''}
        <button class="onboarding-btn onboarding-btn-secondary" data-action="skip-all">跳过全部</button>
      </div>
    `;
    document.body.appendChild(this.tooltip);
    
    // 绑定按钮事件
    this.bindTooltipEvents();
  },
  
  /**
   * 绑定气泡按钮事件
   */
  bindTooltipEvents() {
    if (!this.tooltip) return;
    
    this.tooltip.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'skip') {
          this.nextStep();
        } else if (action === 'skip-all') {
          this.skipAll();
        } else if (action === 'prev') {
          this.prevStep();
        } else if (action === 'next') {
          this.nextStep();
        }
      });
    });
  },
  
  /**
   * 获取等待提示消息
   */
  getWaitingMessage(stepIndex) {
    const messages = {
      3: '请先点击画布中的任意卡片，以便查看详情侧栏。',
      4: '请先创建或选中一个集合节点，然后双击进入子画布。'
    };
    return messages[stepIndex] || '请完成相应操作后继续...';
  },
  
  /**
   * 高亮目标元素
   */
  highlightTarget(step) {
    const targetEl = document.querySelector(step.target);
    if (!targetEl) {
      console.warn('Target element not found:', step.target);
      return;
    }
    
    // 移除之前的高亮
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    
    // 添加高亮类
    targetEl.classList.add('onboarding-highlight');
    
    // 更新镂空区域
    this.updateSpotlight(targetEl);
    
    // 滚动到可见区域
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
  
  /**
   * 更新镂空区域
   */
  updateSpotlight(targetEl) {
    const spotlight = document.getElementById('onboarding-spotlight');
    if (!spotlight) return;
    
    const rect = targetEl.getBoundingClientRect();
    const padding = 8;
    
    spotlight.style.left = `${rect.left - padding}px`;
    spotlight.style.top = `${rect.top - padding}px`;
    spotlight.style.width = `${rect.width + padding * 2}px`;
    spotlight.style.height = `${rect.height + padding * 2}px`;
    spotlight.style.borderRadius = '12px';
    spotlight.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.85)';
  },
  
  /**
   * 显示气泡提示
   */
  showTooltip(step, stepIndex) {
    // 移除旧提示
    if (this.tooltip) {
      this.tooltip.remove();
    }
    
    // 创建气泡
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'onboarding-tooltip';
    this.tooltip.setAttribute('data-placement', step.placement);
    
    // 生成步骤指示器
    const dotsHtml = this.steps.map((_, i) => {
      let className = 'onboarding-step-dot';
      if (i + 1 < stepIndex) className += ' completed';
      if (i + 1 === stepIndex) className += ' active';
      return `<span class="${className}"></span>`;
    }).join('');
    
    this.tooltip.innerHTML = `
      <div class="onboarding-header">
        <div class="onboarding-step-indicator">
          ${dotsHtml}
          <span>${stepIndex} / ${this.steps.length}</span>
        </div>
      </div>
      <h4 class="onboarding-title">${step.title}</h4>
      <div class="onboarding-content">
        ${step.content}
      </div>
      <div class="onboarding-footer">
        <div class="onboarding-footer-left">
          ${stepIndex > 1 ? '<button class="onboarding-btn onboarding-btn-secondary" data-action="prev">上一步</button>' : ''}
        </div>
        <div class="onboarding-footer-right">
          ${step.canSkip ? '<button class="onboarding-btn onboarding-btn-skip" data-action="skip">跳过</button>' : ''}
          <button class="onboarding-btn onboarding-btn-primary" data-action="next">${stepIndex === this.steps.length ? '完成' : '下一步'}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.tooltip);
    
    // 定位气泡
    this.positionTooltip(step);
    
    // 绑定按钮事件
    this.bindTooltipEvents();
  },
  
  /**
   * 定位气泡
   */
  positionTooltip(step) {
    const targetEl = document.querySelector(step.target);
    if (!targetEl || !this.tooltip) return;
    
    // 如果是居中显示，直接返回
    if (!this.overlay) return;
    
    const targetRect = targetEl.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const margin = 16;
    
    let top, left;
    
    switch (step.placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - margin;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + margin;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - margin;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + margin;
        break;
      default:
        top = targetRect.bottom + margin;
        left = targetRect.left;
    }
    
    // 边界检查
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 10) left = 10;
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }
    if (top < 10) top = 10;
    if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10;
    }
    
    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  },
  
  /**
   * 下一步
   */
  nextStep() {
    this.currentStep++;
    
    if (this.currentStep > this.steps.length) {
      this.complete();
    } else {
      this.showStep(this.currentStep);
    }
  },
  
  /**
   * 上一步
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  },
  
  /**
   * 跳过当前步骤
   */
  skip() {
    this.nextStep();
  },
  
  /**
   * 跳过全部引导
   */
  skipAll() {
    this.complete();
  },
  
  /**
   * 完成引导
   */
  complete() {
    console.log('Onboarding completed');
    
    // 保存完成状态
    try {
      localStorage.setItem(this.STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save onboarding state:', e);
    }
    
    // 显示完成动画
    this.showCompleteAnimation();
  },
  
  /**
   * 显示完成动画
   */
  showCompleteAnimation() {
    this.destroyOverlay();
    
    const animation = document.createElement('div');
    animation.className = 'onboarding-complete-animation';
    animation.innerHTML = `
      <div class="onboarding-complete-content">
        <h2>引导完成</h2>
        <p>您已了解 GUXY 的基本功能，开始创作吧！</p>
      </div>
    `;
    document.body.appendChild(animation);
    
    // 动画结束后移除
    setTimeout(() => {
      animation.remove();
      this.currentStep = 0;
    }, 1500);
  },
  
  /**
   * 重置引导状态（用于测试）
   */
  reset() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset onboarding state:', e);
    }
    this.currentStep = 0;
    this.destroyOverlay();
    console.log('Onboarding state reset');
  },
  
  /**
   * 销毁
   */
  destroy() {
    this.destroyOverlay();
    this.currentStep = 0;
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.Onboarding;
}
