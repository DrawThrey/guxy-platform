/**
 * GUXY工作流程进度组件
 * 在左侧侧栏中显示七步进度
 */

GUXY.WorkflowProgress = {
  container: null,
  
  /**
   * 初始化进度组件
   */
  init() {
    const container = document.getElementById('workflow-steps');
    if (container) {
      this.container = container;
      this.render();
      console.log('WorkflowProgress initialized');
    } else {
      console.warn('WorkflowProgress container not found');
    }
  },
  
  /**
   * 渲染进度条
   */
  render() {
    if (!this.container) return;
    
    const workflowSteps = GUXY.Constants?.WORKFLOW_STEPS || {};
    const currentStep = GUXY.Workflow?.currentStep || 1;
    const completedSteps = GUXY.Workflow?.completedSteps || [];
    
    // 生成7个步骤
    let html = '';
    for (let step = 1; step <= 7; step++) {
      const stepInfo = workflowSteps[step] || {};
      const isActive = step === currentStep;
      const isCompleted = completedSteps.includes(step);
      
      let className = 'workflow-step';
      if (isActive) className += ' active';
      if (isCompleted) className += ' completed';
      
      html += `
        <div class="${className}" data-step="${step}">
          <span class="workflow-step-number">${step}</span>
          <span class="workflow-step-title">${stepInfo.title || `步骤${step}`}</span>
          <span class="workflow-step-description">${stepInfo.description || ''}</span>
        </div>
      `;
    }
    
    this.container.innerHTML = html;
    this.bindEvents();
    
    // 更新进度徽章
    const progressBadge = document.getElementById('workflow-progress-badge');
    if (progressBadge && GUXY.Workflow) {
      const progress = GUXY.Workflow.getProgress();
      progressBadge.textContent = `${progress}%`;
    }
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;
    
    // 点击步骤导航（允许随时切换到任意步骤）
    const steps = this.container.querySelectorAll('.workflow-step');
    steps.forEach(step => {
      step.addEventListener('click', () => {
        const stepNumber = parseInt(step.dataset.step, 10);
        if (GUXY.Workflow && stepNumber !== GUXY.Workflow.currentStep) {
          // 不再限制前置步骤，直接跳转
          GUXY.Workflow.goToStep(stepNumber);
        }
      });
    });
  },
  
  /**
   * 刷新进度显示
   */
  refresh() {
    this.render();
  },
  
  /**
   * 销毁进度组件
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
    console.log('WorkflowProgress destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.WorkflowProgress;
}
