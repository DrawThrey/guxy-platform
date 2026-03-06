/**
 * GUXY工作流程模块
 * 管理7步工作流程导航和状态
 */

GUXY.Workflow = {
  currentStep: 1,
  completedSteps: [],
  stepData: {},
  
  /**
   * 初始化工作流程
   */
  init() {
    this.loadFromState();
    this.render();
    console.log('Workflow initialized');
  },
  
  /**
   * 从状态加载
   */
  loadFromState() {
    if (GUXY.State && GUXY.State.workflow) {
      this.currentStep = GUXY.State.workflow.currentStep || 1;
      this.completedSteps = GUXY.State.workflow.completedSteps || [];
      this.stepData = GUXY.State.workflow.stepData || {};
    }
  },
  
  /**
   * 渲染工作流程UI
   * 注意：UI已移除，此方法仅保留逻辑，不再渲染到DOM
   */
  render() {
    // UI已移除，工作流程逻辑保留在内部状态管理中
    // 不再渲染UI组件到DOM
    console.log('Workflow render skipped (UI removed)');
  },
  
  /**
   * 获取步骤CSS类
   * @param {number} step - 步骤号
   * @returns {string} CSS类名
   */
  getStepClass(step) {
    let classes = [];
    
    if (step === this.currentStep) {
      classes.push('active');
    }
    
    if (this.completedSteps.includes(step)) {
      classes.push('completed');
    }
    
    return classes.join(' ');
  },
  
  /**
   * 绑定事件
   * 注意：UI已移除，此方法不再需要绑定UI事件
   */
  bindEvents() {
    // UI已移除，不再绑定事件
    console.log('Workflow bindEvents skipped (UI removed)');
  },
  
  /**
   * 跳转到指定步骤
   * @param {number} step - 步骤号
   */
  goToStep(step) {
    if (step < 1 || step > 7) return;

    // 允许自由跳转到任意步骤，仅更新 currentStep，不强制依赖前置步骤
    this.currentStep = step;
    this.saveToState();
    this.render();
    this.dispatchStepChange();
  },
  
  /**
   * 上一步
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.saveToState();
      this.render();
      this.dispatchStepChange();
    }
  },
  
  /**
   * 下一步
   */
  nextStep() {
    if (this.currentStep < 7) {
      // 标记当前步骤为完成
      if (!this.completedSteps.includes(this.currentStep)) {
        this.completeStep(this.currentStep);
      }
      
      this.currentStep++;
      this.saveToState();
      this.render();
      this.dispatchStepChange();
    }
  },
  
  /**
   * 完成步骤
   * @param {number} step - 步骤号
   */
  completeStep(step) {
    if (!this.completedSteps.includes(step)) {
      this.completedSteps.push(step);
      this.stepData[step] = this.stepData[step] || {};
      this.stepData[step].completedAt = new Date().toISOString();
      
      // 记录日志
      GUXY.Utils.logWorkflowChange(step, 'step_completed', this.stepData[step]);
      
      this.saveToState();
      this.render();
      this.dispatchStepChange();
    }
  },
  
  /**
   * 保存步骤数据
   * @param {number} step - 步骤号
   * @param {object} data - 步骤数据
   */
  saveStepData(step, data) {
    this.stepData[step] = {
      ...this.stepData[step],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToState();
  },
  
  /**
   * 获取步骤数据
   * @param {number} step - 步骤号
   * @returns {object} 步骤数据
   */
  getStepData(step) {
    return this.stepData[step] || {};
  },
  
  /**
   * 保存到状态
   */
  saveToState() {
    if (GUXY.State) {
      GUXY.State.workflow = {
        currentStep: this.currentStep,
        completedSteps: this.completedSteps,
        stepData: this.stepData
      };
      GUXY.State.saveToStorage();
    }
  },
  
  /**
   * 分发步骤变更事件
   */
  dispatchStepChange() {
    const event = new CustomEvent('workflowStepChange', {
      detail: {
        currentStep: this.currentStep,
        stepInfo: GUXY.Constants.WORKFLOW_STEPS[this.currentStep]
      }
    });
    document.dispatchEvent(event);
  },
  
  /**
   * 重置工作流程
   */
  reset() {
    this.currentStep = 1;
    this.completedSteps = [];
    this.stepData = {};
    
    this.saveToState();
    this.render();
    
    GUXY.Utils.logWorkflowChange(1, 'workflow_reset', {});
    
    GUXY.Toast?.show('工作流程已重置', 'info');
  },
  
  /**
   * 获取进度百分比
   * @returns {number} 进度百分比
   */
  getProgress() {
    return Math.round((this.completedSteps.length / 7) * 100);
  },
  
  /**
   * 检查步骤是否完成
   * @param {number} step - 步骤号
   * @returns {boolean} 是否完成
   */
  isStepCompleted(step) {
    return this.completedSteps.includes(step);
  },
  
  /**
   * 检查是否可以进入步骤
   * @param {number} step - 步骤号
   * @returns {boolean} 是否可以进入
   */
  canEnterStep(step) {
    // 第一步总是可以进入
    if (step === 1) return true;
    
    // 前一步必须完成
    const prevStep = step - 1;
    return this.completedSteps.includes(prevStep) || this.isStepCompleted(prevStep);
  },
  
  /**
   * 获取工作流程摘要
   * @returns {object} 摘要信息
   */
  getSummary() {
    const steps = Object.values(GUXY.Constants.WORKFLOW_STEPS);
    
    return {
      currentStep: this.currentStep,
      currentStepTitle: steps[this.currentStep - 1]?.title,
      completedSteps: this.completedSteps.length,
      totalSteps: 7,
      progress: this.getProgress(),
      stepData: this.stepData
    };
  },
  
  /**
   * 销毁工作流程
   */
  destroy() {
    const container = document.querySelector('.workflow-container');
    if (container) {
      container.remove();
    }
    
    console.log('Workflow destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.Workflow;
}
