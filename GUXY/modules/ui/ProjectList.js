/**
 * GUXY项目列表组件
 * 显示和管理项目列表
 */

GUXY.ProjectList = {
  container: null,
  projects: [],
  
  /**
   * 初始化项目列表
   * @param {HTMLElement} container - 容器元素
   */
  init(container) {
    this.container = container;
    this.loadProjects();
    this.render();
    console.log('ProjectList initialized');
  },
  
  /**
   * 加载项目列表
   */
  async loadProjects() {
    if (GUXY.State) {
      this.projects = GUXY.State.projects || [];
    }
  },
  
  /**
   * 渲染项目列表
   */
  render() {
    if (!this.container) return;
    
    const container = this.container;
    container.innerHTML = `
      <div class="project-list-header">
        <h1 class="project-list-title">GUXY - 游戏交互设计AI工作流平台</h1>
        <p class="project-list-subtitle">创建新项目或选择现有项目开始设计</p>
      </div>
      
      <div class="create-row">
        <input type="text" class="input project-name-input" placeholder="输入项目名称..." maxlength="100">
        <button class="btn btn-primary btn-create-project">创建项目</button>
      </div>
      
      <ul class="project-cards">
        ${this.renderProjectCards()}
      </ul>
    `;
    
    this.bindEvents();
  },
  
  /**
   * 渲染项目卡片
   * @returns {string} HTML字符串
   */
  renderProjectCards() {
    if (!this.projects.length) {
      return '<li class="empty-hint">暂无项目，请创建新项目</li>';
    }
    
    return this.projects.map((project, index) => {
      const stats = GUXY.State?.getProjectStats(project.id) || {};
      
      return `
        <li style="animation-delay: ${index * 0.05}s">
          <a href="#" class="project-card" data-project-id="${project.id}">
            <div class="project-card-icon">🎮</div>
            <div class="project-card-content">
              <div class="project-card-title">${this.escapeHtml(project.name)}</div>
              <div class="project-card-desc">${this.escapeHtml(project.description || '暂无描述')}</div>
            </div>
            <div class="project-card-meta">
              <span class="project-card-date">${this.formatDate(project.updatedAt)}</span>
              <span class="project-card-status">${stats.completedSteps || 0}/7 步</span>
            </div>
          </a>
        </li>
      `;
    }).join('');
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;
    
    // 创建项目按钮
    const createBtn = this.container.querySelector('.btn-create-project');
    createBtn?.addEventListener('click', () => this.createProject());
    
    // 项目名称输入框回车
    const nameInput = this.container.querySelector('.project-name-input');
    nameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.createProject();
      }
    });
    
    // 项目卡片点击
    const projectCards = this.container.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = card.dataset.projectId;
        this.openProject(projectId);
      });
    });
  },
  
  /**
   * 创建新项目
   */
  createProject() {
    const nameInput = this.container.querySelector('.project-name-input');
    const name = nameInput?.value.trim();
    
    if (!name) {
      GUXY.Toast?.show('请输入项目名称', 'warning');
      return;
    }
    
    if (!GUXY.Utils.validateProjectName(name)) {
      GUXY.Toast?.show('项目名称格式不正确', 'error');
      return;
    }
    
    try {
      // 创建项目
      const project = GUXY.State.createProject(name, '');
      
      // 保存到数据库
      GUXY.DB.addProject(project).then(() => {
        console.log('Project saved to DB');
      }).catch(error => {
        console.error('Failed to save project:', error);
      });
      
      // 更新列表
      this.projects = GUXY.State.projects;
      this.render();
      
      // 清空输入框
      nameInput.value = '';
      
      GUXY.Toast?.show('项目创建成功', 'success');
      
      // 记录日志
      GUXY.Utils.logWorkflowChange(1, 'project_created', {
        projectId: project.id,
        projectName: project.name
      });
    } catch (error) {
      GUXY.Toast?.show(`创建失败: ${error.message}`, 'error');
      console.error('Create project error:', error);
    }
  },
  
  /**
   * 打开项目
   * @param {string} projectId - 项目ID
   */
  openProject(projectId) {
    try {
      // 切换到项目
      GUXY.State.switchProject(projectId);
      
      // 切换视图
      if (GUXY.State) {
        GUXY.State.setView('canvas');
      }
      
      // 切换页面
      this.switchToCanvasView();
      
      // 记录日志
      GUXY.Utils.logWorkflowChange(1, 'project_opened', { projectId });
      
      GUXY.Toast?.show('项目已打开', 'success');
    } catch (error) {
      GUXY.Toast?.show(`打开项目失败: ${error.message}`, 'error');
      console.error('Open project error:', error);
    }
  },
  
  /**
   * 切换到画布视图
   */
  switchToCanvasView() {
    const listPage = document.getElementById('project-list-page');
    const canvasPage = document.getElementById('canvas-page');
    
    // 使用页面容器上的 .active 控制显示，保证与样式规则一致
    if (listPage) listPage.classList.remove('active');
    if (canvasPage) canvasPage.classList.add('active');
  },
  
  /**
   * 删除项目
   * @param {string} projectId - 项目ID
   */
  async deleteProject(projectId) {
    if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      // 从数据库删除
      await GUXY.DB.deleteProject(projectId);
      
      // 从状态删除
      GUXY.State.deleteProject(projectId);
      
      // 更新列表
      this.projects = GUXY.State.projects;
      this.render();
      
      GUXY.Toast?.show('项目已删除', 'success');
      
      // 记录日志
      GUXY.Utils.logWorkflowChange(1, 'project_deleted', { projectId });
    } catch (error) {
      GUXY.Toast?.show(`删除失败: ${error.message}`, 'error');
      console.error('Delete project error:', error);
    }
  },
  
  /**
   * 刷新项目列表
   */
  async refresh() {
    await this.loadProjects();
    this.render();
    GUXY.Toast?.show('项目列表已刷新', 'info');
  },
  
  /**
   * 格式化日期
   * @param {string} dateStr - 日期字符串
   * @returns {string} 格式化的日期
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return GUXY.Utils.formatDate(date, 'YYYY-MM-DD');
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
   * 销毁项目列表
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
    this.projects = [];
    
    console.log('ProjectList destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.ProjectList;
}
