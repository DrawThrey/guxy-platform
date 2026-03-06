/**
 * GUXY侧栏组件
 * 显示项目详情和操作
 */

GUXY.Sidebar = {
  container: null,
  currentProject: null,
  
  /**
   * 初始化侧栏
   * @param {HTMLElement} container - 容器元素
   */
  init(container) {
    this.container = container;
    this.loadCurrentProject();
    // 不再渲染整个侧栏，只更新动态内容
    this.updateWorkflowInfo();
    this.updateArchitectureStats();
    this.updateStepActions();
    console.log('Sidebar initialized');
  },
  
  /**
   * 加载当前项目
   */
  loadCurrentProject() {
    if (GUXY.State) {
      this.currentProject = GUXY.State.currentProject;
    }
  },
  
  /**
   * 渲染侧栏
   */
  render() {
    if (!this.container) return;
    
    const project = this.currentProject;
    const workflow = GUXY.Workflow;
    const currentStep = workflow?.currentStep || 1;
    const stepInfo = GUXY.Constants?.WORKFLOW_STEPS[currentStep] || {};
    
    this.container.innerHTML = `
      <div class="sidebar-header">
        <h3 class="sidebar-title">项目详情</h3>
        <button class="btn-icon btn-close-sidebar" title="关闭侧栏">×</button>
      </div>
      
      <div class="sidebar-content">
        <!-- 项目信息 -->
        <div class="sidebar-section">
          <div class="sidebar-section-title">
            项目信息
          </div>
          <div class="sidebar-section-content">
            <p><strong>名称:</strong> ${this.escapeHtml(project?.name || '未命名')}</p>
            <p><strong>描述:</strong> ${this.escapeHtml(project?.description || '暂无描述')}</p>
            <p><strong>创建时间:</strong> ${this.formatDate(project?.createdAt)}</p>
            <p><strong>更新时间:</strong> ${this.formatDate(project?.updatedAt)}</p>
          </div>
        </div>
        
        <!-- 工作流程文件夹 -->
        <div class="sidebar-section">
          <div class="sidebar-section-title">
            工作流目录
            <span class="badge">${workflow?.getProgress() || 0}%</span>
          </div>
          <div class="sidebar-section-content">
            ${this.renderWorkflowFolders(currentStep)}
          </div>
        </div>
        
        <!-- 架构统计 -->
        <div class="sidebar-section">
          <div class="sidebar-section-title">
            架构统计
          </div>
          <div class="sidebar-section-content">
            ${this.renderArchitectureStats()}
          </div>
        </div>
        
            <!-- 当前步骤操作 -->
            <div class="sidebar-section">
              <div class="sidebar-section-title">
                操作
              </div>
              <div class="sidebar-section-content">
                ${this.renderStepActions(currentStep)}
              </div>
            </div>
            
            <!-- API配置 -->
            <div class="sidebar-section">
              <div class="sidebar-section-title">
                系统设置
              </div>
              <div class="sidebar-section-content">
                <button class="btn btn-secondary btn-full btn-api-config">
                  ⚙️ 配置 API
                </button>
                ${GUXY.ApiConfig?.isConfigured() ? 
                  '<p class="text-xs text-light" style="margin-top: 0.5rem; color: var(--color-success);">✓ API 已配置</p>' : 
                  '<p class="text-xs text-light" style="margin-top: 0.5rem; color: var(--color-warning);">⚠ 请先配置 API</p>'
                }
              </div>
            </div>
          </div>
          
          <div class="sidebar-footer">
            <button class="btn btn-outline btn-back-to-list">返回项目列表</button>
            <button class="btn btn-danger btn-delete-project">删除项目</button>
          </div>
    `;
    
    this.bindEvents();
  },
  
  /**
   * 渲染架构统计
   * @returns {string} HTML字符串
   */
  renderArchitectureStats() {
    if (!this.currentProject?.architecture) {
      return '<p>暂无架构数据</p>';
    }
    
    const arch = this.currentProject.architecture;
    
    return `
      <p><strong>集合节点:</strong> ${arch.collections?.length || 0}</p>
      <p><strong>卡片节点:</strong> ${arch.cards?.length || 0}</p>
      <p><strong>连线数量:</strong> ${arch.edges?.length || 0}</p>
    `;
  },
  
  /**
   * 渲染工作流文件夹
   * @param {number} currentStep - 当前步骤
   * @returns {string} HTML字符串
   */
  renderWorkflowFolders(currentStep) {
    const workflowSteps = GUXY.Constants?.WORKFLOW_STEPS || {};
    const expandedFolders = this.expandedFolders || {};
    
    let html = '<div class="workflow-folders">';
    
    for (let step = 1; step <= 7; step++) {
      const stepInfo = workflowSteps[step] || {};
      const isExpanded = expandedFolders[step];
      const files = this.getStepFiles(step);
      const isActive = step === currentStep;
      
      html += `
        <div class="workflow-folder ${isActive ? 'active' : ''}">
          <div class="workflow-folder-header" data-step="${step}">
            <span class="folder-icon">${isExpanded ? '📂' : '📁'}</span>
            <span class="folder-number">${step.toString().padStart(2, '0')}</span>
            <span class="folder-title">${stepInfo.title || '未知步骤'}</span>
            <span class="folder-status ${isActive ? 'active' : ''}">
              ${isActive ? '●' : '○'}
            </span>
          </div>
          ${isExpanded ? `
            <div class="workflow-folder-content">
              ${files.length > 0 ? files.map(file => `
                <div class="workflow-file" data-file="${file.name}">
                  <span class="file-icon">📄</span>
                  <span class="file-name">${file.name}</span>
                  <span class="file-type">${file.type}</span>
                </div>
              `).join('') : '<p class="text-xs text-light" style="padding: 0.5rem;">暂无文件</p>'}
            </div>
          ` : ''}
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  },

  /**
   * 获取步骤文件列表
   * @param {number} step - 步骤号
   * @returns {Array} 文件列表
   */
  getStepFiles(step) {
    const files = [];
    const stepData = GUXY.Workflow?.getStepData(step);
    
    switch (step) {
      case 1: // AI分析策划案
        if (stepData?.fileName) {
          files.push({ name: `${stepData.fileName}`, type: '策划案' });
        }
        if (stepData?.analysis) {
          files.push({ name: 'analysis-result.json', type: 'JSON' });
          files.push({ name: 'modules.json', type: '模块数据' });
          files.push({ name: 'flows.json', type: '流程数据' });
          files.push({ name: 'interfaces.json', type: '界面数据' });
        }
        break;
        
      case 2: // 生成卡片架构
        if (this.currentProject?.architecture) {
          files.push({ name: 'architecture.json', type: '架构数据' });
          files.push({ name: 'collections.json', type: '集合数据' });
          files.push({ name: 'cards.json', type: '卡片数据' });
          files.push({ name: 'edges.json', type: '连线数据' });
        }
        break;
        
      case 3: // 手动调整架构
        if (this.currentProject?.architecture) {
          files.push({ name: 'adjusted-architecture.json', type: '调整后架构' });
        }
        break;
        
      case 4: // 导出AI可读架构
        files.push({ name: 'ai-readable-architecture.json', type: 'AI可读格式' });
        files.push({ name: 'architecture-export.json', type: '导出数据' });
        break;
        
      case 5: // 生成开发规划
        if (stepData?.plan) {
          files.push({ name: 'development-plan.md', type: '开发计划' });
          files.push({ name: 'tasks.json', type: '任务列表' });
        }
        files.push({ name: 'interaction-spec.md', type: '交互规范' });
        break;
        
      case 6: // 开发与自检
        files.push({ name: 'code-review.json', type: '代码审查' });
        files.push({ name: 'test-results.json', type: '测试结果' });
        files.push({ name: 'self-check-report.md', type: '自检报告' });
        break;
        
      case 7: // 生成高保真UI
        if (stepData?.uiData) {
          files.push({ name: 'ui-design.json', type: 'UI设计' });
          files.push({ name: 'interactive-logic-records.md', type: '交互记录' });
        }
        files.push({ name: 'ui-specifications.md', type: 'UI规范' });
        files.push({ name: 'mockups/', type: '文件夹' });
        files.push({ name: 'resources/', type: '资源文件夹' });
        break;
    }
    
    return files;
  },

  /**
   * 渲染步骤操作
   * @param {number} step - 步骤号
   * @returns {string} HTML字符串
   */
  renderStepActions(step) {
    switch (step) {
      case 1:
        // 移除了上传策划案按钮，因为已经通过中岛台工具栏的导入功能完成
        return `
          <p class="text-xs text-light">已完成策划案导入和AI分析</p>
        `;
      case 2:
        return `
          <button class="btn btn-primary btn-full btn-generate-arch">生成架构</button>
          <button class="btn btn-secondary btn-full btn-auto-layout">自动布局</button>
        `;
      case 3:
        return `
          <p class="text-xs text-light">拖拽节点调整位置，点击连接点创建连线</p>
          <button class="btn btn-secondary btn-full btn-add-node">添加卡片</button>
          <button class="btn btn-secondary btn-full btn-add-collection">添加集合</button>
        `;
      case 4:
        return `
          <button class="btn btn-primary btn-full btn-export-plan">导出Plan</button>
          <button class="btn btn-secondary btn-full btn-view-json">查看JSON</button>
        `;
      case 5:
        return `
          <button class="btn btn-primary btn-full btn-generate-dev-plan">生成开发规划</button>
        `;
      case 6:
        return `
          <button class="btn btn-secondary btn-full btn-run-tests">运行测试</button>
          <button class="btn btn-secondary btn-full btn-view-code">查看代码</button>
        `;
      case 7:
        return `
          <button class="btn btn-primary btn-full btn-generate-ui">生成UI</button>
          <button class="btn btn-secondary btn-full btn-view-resources">查看资源</button>
        `;
      default:
        return '<p>暂无操作</p>';
    }
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;
    
    console.log('[Sidebar] Binding events - using static HTML structure');
    
    // 返回项目列表
    const backBtn = this.container.querySelector('.btn-back-to-list');
    backBtn?.addEventListener('click', () => this.backToList());
    
    // 删除项目
    const deleteBtn = this.container.querySelector('.btn-delete-project');
    deleteBtn?.addEventListener('click', () => this.deleteProject());
  },
  
  /**
   * 绑定步骤操作事件
   */
  bindStepActionsEvents() {
    if (!this.container) return;
    
    console.log('[Sidebar] Binding step actions events');
    
    // 根据当前步骤绑定相应的事件
    const workflow = GUXY.Workflow;
    const currentStep = workflow?.currentStep || 1;
    
    switch (currentStep) {
      case 3:
        // 手动调整架构 - 添加卡片和集合按钮
        const addCardBtn = this.container.querySelector('.btn-add-node');
        addCardBtn?.addEventListener('click', () => {
          if (GUXY.Toolbar) GUXY.Toolbar.addCard();
        });
        
        const addCollectionBtn = this.container.querySelector('.btn-add-collection');
        addCollectionBtn?.addEventListener('click', () => {
          if (GUXY.Toolbar) GUXY.Toolbar.addCollection();
        });
        break;
    }
  },
  
  /**
   * 处理文件上传
   * @param {Event} e - 事件对象
   */
  async handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // 调用AI分析
      await GUXY.AIAnalysis?.analyzeFile(file);
      
      // 更新UI
      const uploadBtn = this.container.querySelector('.btn-upload-file');
      const viewBtn = this.container.querySelector('.btn-view-analysis');
      
      if (uploadBtn) uploadBtn.style.display = 'none';
      if (viewBtn) viewBtn.style.display = 'inline-block';
    } catch (error) {
      console.error('File upload error:', error);
    }
    
    // 清空文件输入
    e.target.value = '';
  },
  
  /**
   * 返回项目列表
   */
  backToList() {
    if (GUXY.State) {
      GUXY.State.setView('list');
    }
    
    // 使用页面容器上的 .active 控制显示，保证与样式规则一致
    const listPage = document.getElementById('project-list-page');
    const canvasPage = document.getElementById('canvas-page');
    
    if (listPage) listPage.classList.add('active');
    if (canvasPage) canvasPage.classList.remove('active');
  },
  
  /**
   * 删除项目
   */
  async deleteProject() {
    if (!this.currentProject) return;
    
    if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      await GUXY.ProjectList?.deleteProject(this.currentProject.id);
      this.backToList();
    } catch (error) {
      console.error('Delete project error:', error);
    }
  },
  
  /**
   * 刷新侧栏
   */
  refresh() {
    this.loadCurrentProject();
    this.updateWorkflowInfo();
    this.updateArchitectureStats();
    this.updateStepActions();
  },
  
  /**
   * 更新工作流程信息
   */
  updateWorkflowInfo() {
    const workflow = GUXY.Workflow;
    const currentStep = workflow?.currentStep || 1;
    const stepInfo = GUXY.Constants?.WORKFLOW_STEPS[currentStep] || {};
    
    const stepTitle = document.getElementById('current-step-title');
    if (stepTitle) {
      stepTitle.textContent = stepInfo.title || `步骤${currentStep}`;
    }
    
    const stepDesc = document.getElementById('current-step-desc');
    if (stepDesc) {
      stepDesc.textContent = stepInfo.description || '';
    }
    
    const progressBadge = document.getElementById('workflow-progress-badge');
    if (progressBadge && workflow) {
      progressBadge.textContent = `${workflow.getProgress()}%`;
    }
  },
  
  /**
   * 更新架构统计
   */
  updateArchitectureStats() {
    const arch = this.currentProject?.architecture;
    
    const collectionsCount = document.getElementById('collections-count');
    if (collectionsCount) {
      collectionsCount.textContent = arch?.collections?.length || 0;
    }
    
    const cardsCount = document.getElementById('cards-count');
    if (cardsCount) {
      cardsCount.textContent = arch?.cards?.length || 0;
    }
    
    const edgesCount = document.getElementById('edges-count');
    if (edgesCount) {
      edgesCount.textContent = arch?.edges?.length || 0;
    }
  },
  
  /**
   * 更新步骤操作
   */
  updateStepActions() {
    const stepActions = document.getElementById('step-actions');
    if (!stepActions) return;
    
    const workflow = GUXY.Workflow;
    const currentStep = workflow?.currentStep || 1;
    
    stepActions.innerHTML = this.renderStepActions(currentStep);
    
    // 绑定事件
    this.bindStepActionsEvents();
  },
  
  /**
   * 格式化日期
   * @param {string} dateStr - 日期字符串
   * @returns {string} 格式化的日期
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    return GUXY.Utils.formatDate(new Date(dateStr), 'YYYY-MM-DD HH:mm');
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
   * 切换文件夹展开状态
   * @param {number} step - 步骤号
   */
  toggleFolder(step) {
    if (!this.expandedFolders) {
      this.expandedFolders = {};
    }
    
    this.expandedFolders[step] = !this.expandedFolders[step];
    this.render();
  },

  /**
   * 处理文件点击
   * @param {string} fileName - 文件名
   */
  handleFileClick(fileName) {
    console.log('File clicked:', fileName);
    
    // 根据文件名显示对应的内容或执行相应操作
    if (fileName.endsWith('.json')) {
      // 对于JSON文件，显示数据预览
      this.showJsonPreview(fileName);
    } else if (fileName.endsWith('.md')) {
      // 对于Markdown文件，显示内容预览
      this.showMarkdownPreview(fileName);
    } else if (fileName.endsWith('/')) {
      // 对于文件夹，显示文件夹内容
      GUXY.Toast?.show(`${fileName} 文件夹`, 'info');
    } else {
      GUXY.Toast?.show(`文件: ${fileName}`, 'info');
    }
  },

  /**
   * 显示JSON文件预览
   * @param {string} fileName - 文件名
   */
  showJsonPreview(fileName) {
    let content = null;
    
    // 根据文件名获取对应的数据
    if (fileName === 'analysis-result.json') {
      content = GUXY.Workflow?.getStepData(1)?.analysis;
    } else if (fileName === 'architecture.json' || fileName === 'adjusted-architecture.json') {
      content = this.currentProject?.architecture;
    } else if (fileName === 'ai-readable-architecture.json' || fileName === 'architecture-export.json') {
      content = this.currentProject?.architecture;
    }
    
    if (content) {
      const jsonStr = JSON.stringify(content, null, 2);
      GUXY.Utils?.downloadFile(jsonStr, fileName, 'application/json');
      GUXY.Toast?.show(`已下载: ${fileName}`, 'success');
    } else {
      GUXY.Toast?.show('暂无数据', 'warning');
    }
  },

  /**
   * 显示Markdown文件预览
   * @param {string} fileName - 文件名
   */
  showMarkdownPreview(fileName) {
    let content = '';
    
    // 根据文件名生成对应的Markdown内容
    if (fileName === 'interaction-spec.md') {
      content = '# 交互规范\n\n交互规范文件内容...';
    } else if (fileName === 'ui-specifications.md') {
      content = '# UI规范\n\nUI规范文件内容...';
    }
    
    if (content) {
      GUXY.Utils?.downloadFile(content, fileName, 'text/markdown');
      GUXY.Toast?.show(`已下载: ${fileName}`, 'success');
    } else {
      GUXY.Toast?.show('暂无内容', 'warning');
    }
  },
  
  /**
   * 销毁侧栏
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
    this.currentProject = null;
    
    console.log('Sidebar destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.Sidebar;
}
