/**
 * GUXY应用入口
 * 初始化应用和协调各模块
 */

(function() {
  'use strict';
  
  /**
   * 应用初始化
   */
  async function init() {
    try {
      console.log('GUXY initializing...');
      
      // 初始化常量
      if (!window.GUXY) {
        window.GUXY = {};
      }
      
      // 初始化核心模块
      await initCoreModules();
      
    // 初始化画布模块
    await initCanvasModules();
    
    // 初始化子画布
    if (GUXY.SubCanvas) {
      GUXY.SubCanvas.init();
    }
      
      // 初始化UI组件
      await initUIComponents();
      
      // 初始化GUXY模块
      await initGUXYModules();
      
      // 初始化应用
      await initApplication();
      
      console.log('GUXY initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize GUXY:', error);
      if (GUXY.Toast) {
        GUXY.Toast.error('应用初始化失败', error.message);
      }
    }
  }
  
  /**
   * 初始化核心模块
   */
  async function initCoreModules() {
    console.log('Initializing core modules...');
    
    // 初始化数据库
    if (GUXY.DB) {
      await GUXY.DB.init();
    }
    
    // 初始化状态管理
    if (GUXY.State) {
      GUXY.State.init();
    }
    
    console.log('Core modules initialized');
  }
  
  /**
   * 初始化画布模块
   */
  async function initCanvasModules() {
    console.log('Initializing canvas modules...');
    
    const canvasContainer = document.getElementById('canvas-container');
    const canvasTransform = document.getElementById('canvas-transform');
    const nodesContainer = document.getElementById('nodes-container');
    const edgesContainer = document.getElementById('edges-container');
    
    // 初始化画布舞台
    if (GUXY.CanvasStage && canvasContainer) {
      GUXY.CanvasStage.init(canvasContainer);
    }
    
    // 初始化节点管理
    if (GUXY.CanvasNodes && nodesContainer) {
      GUXY.CanvasNodes.init(nodesContainer);
    }
    
    // 初始化连线管理
    if (GUXY.CanvasEdges && edgesContainer) {
      GUXY.CanvasEdges.init(edgesContainer);
    }
    
    // 初始化平移缩放
    if (GUXY.ZoomPan && canvasContainer && canvasTransform) {
      GUXY.ZoomPan.init(canvasContainer, canvasTransform);
    }
    
    // 初始化连线
    const canvasStage = document.getElementById('canvas-stage');
    if (GUXY.Connection && canvasStage) {
      GUXY.Connection.init(canvasStage);
    }
    
    console.log('Canvas modules initialized');
  }
  
  /**
   * 初始化UI组件
   */
  async function initUIComponents() {
    console.log('Initializing UI components...');
    
    // 初始化Modal
    if (GUXY.Modal) {
      GUXY.Modal.init();
    }
    
    // 初始化Toast
    if (GUXY.Toast) {
      GUXY.Toast.init();
    }
    
    // 初始化项目列表
    const listPage = document.getElementById('project-list-page');
    // 使用整页容器作为挂载点，避免因内部结构变化导致选择失败
    const projectListContainer = listPage;
    if (GUXY.ProjectList && projectListContainer) {
      GUXY.ProjectList.init(projectListContainer);
    }
    
    // 初始化侧栏
    const sidebar = document.getElementById('sidebar');
    if (GUXY.Sidebar && sidebar) {
      GUXY.Sidebar.init(sidebar);
    }
    
    // 初始化工具栏
    const header = document.querySelector('.canvas-header');
    if (GUXY.Toolbar && header) {
      GUXY.Toolbar.init(header);
    }
    
    // 初始化中岛台工具栏
    if (GUXY.CentralToolbar) {
      GUXY.CentralToolbar.init();
    }
    
    // 初始化工作流程进度
    if (GUXY.WorkflowProgress) {
      GUXY.WorkflowProgress.init();
    }
    
    // 初始化 Agent 对话面板和浮岛
    if (GUXY.AgentChatPanel) {
      GUXY.AgentChatPanel.init();
    }
    if (GUXY.AgentIsland) {
      GUXY.AgentIsland.init();
    }
    
    // 初始化引导模块
    if (GUXY.Onboarding) {
      GUXY.Onboarding.init();
    }
    
    console.log('UI components initialized');
  }
  
  /**
   * 初始化GUXY模块
   */
  async function initGUXYModules() {
    console.log('Initializing GUXY modules...');
    
    // 初始化工作流程
    if (GUXY.Workflow) {
      GUXY.Workflow.init();
    }
    
    // 初始化AI分析
    if (GUXY.AIAnalysis) {
      GUXY.AIAnalysis.init();
    }
    
    // 初始化导出管理器
    if (GUXY.ExportManager) {
      GUXY.ExportManager.init();
    }
    
    // 初始化Plan导入
    if (GUXY.PlanImport) {
      GUXY.PlanImport.init();
    }
    
    // 初始化UI生成
    if (GUXY.UIGeneration) {
      GUXY.UIGeneration.init();
    }
    
    // 初始化日志
    if (GUXY.Logger) {
      GUXY.Logger.init();
    }
    
    console.log('GUXY modules initialized');
  }
  
  /**
   * 初始化应用
   */
  async function initApplication() {
    console.log('Initializing application...');
    
    // 初始化引导模块
    if (GUXY.Onboarding) {
      GUXY.Onboarding.init();
    }
    
    // 绑定全局事件
    bindGlobalEvents();
    
    // 检查URL参数
    checkURLParams();
    
    // 加载当前项目
    if (GUXY.State?.currentProject) {
      switchToCanvasView();
    } else {
      switchToListView();
    }
    
    // 监听工作流程变更
    document.addEventListener('workflowStepChange', handleWorkflowStepChange);
    
    // 监听自定义画布事件
    bindCanvasEvents();
    
    console.log('Application initialized');
  }
  
  /**
   * 绑定全局事件
   */
  function bindGlobalEvents() {
    // 返回项目列表
    const backBtn = document.getElementById('btn-back-to-list');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchToListView();
      });
    }
    
    // 创建项目
    const createBtn = document.getElementById('btn-create-project');
    const projectNameInput = document.getElementById('new-project-name');
    
    if (createBtn) {
      createBtn.addEventListener('click', createProject);
    }
    
    if (projectNameInput) {
      projectNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          createProject();
        }
      });
    }
  }
  
  /**
   * 检查URL参数
   */
  function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    
    if (projectId && GUXY.State) {
      GUXY.State.switchProject(projectId);
    }
  }
  
  /**
   * 绑定画布事件
   */
  function bindCanvasEvents() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    
    // 监听拖拽结束
    canvasContainer.addEventListener('dragend', (e) => {
      console.log('Node dragged:', e.detail);
      // 更新架构数据
      updateArchitectureFromCanvas();
    });
    
    // 监听连线创建
    canvasContainer.addEventListener('edgeCreated', (e) => {
      console.log('Edge created:', e.detail);
      // 更新架构数据
      updateArchitectureFromCanvas();
    });
  }
  
  /**
   * 处理工作流程变更
   */
  function handleWorkflowStepChange(e) {
    const { currentStep, stepInfo } = e.detail;
    console.log('Workflow step changed:', currentStep, stepInfo);
    
    // 更新侧栏
    if (GUXY.Sidebar) {
      GUXY.Sidebar.refresh();
    }
  }
  
  /**
   * 创建项目
   */
  function createProject() {
    const nameInput = document.getElementById('new-project-name');
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
      const project = GUXY.State.createProject(name, '');
      GUXY.DB.addProject(project).catch(err => console.error(err));
      
      nameInput.value = '';
      
      // 刷新项目列表
      if (GUXY.ProjectList) {
        GUXY.ProjectList.render();
      }
      
      GUXY.Toast?.show('项目创建成功', 'success');
    } catch (error) {
      GUXY.Toast?.show(`创建失败: ${error.message}`, 'error');
      console.error('Create project error:', error);
    }
  }
  
  /**
   * 切换到列表视图
   */
  function switchToListView() {
    const listPage = document.getElementById('project-list-page');
    const canvasPage = document.getElementById('canvas-page');
    
    if (listPage) listPage.classList.add('active');
    if (canvasPage) canvasPage.classList.remove('active');
    
    // 隐藏 Agent 浮岛
    if (GUXY.AgentIsland) {
      GUXY.AgentIsland.hide();
    }
    
    // 刷新项目列表
    if (GUXY.ProjectList) {
      GUXY.ProjectList.refresh();
    }
    
    if (GUXY.State) {
      GUXY.State.setView('list');
    }
  }
  
  /**
   * 切换到画布视图
   */
  function switchToCanvasView() {
    const listPage = document.getElementById('project-list-page');
    const canvasPage = document.getElementById('canvas-page');
    
    if (listPage) listPage.classList.remove('active');
    if (canvasPage) canvasPage.classList.add('active');
    
    // 显示 Agent 浮岛
    if (GUXY.AgentIsland) {
      GUXY.AgentIsland.show();
    }
    
    // 更新项目信息
    updateProjectInfo();
    
    // 渲染架构
    renderArchitecture();
    
    if (GUXY.State) {
      GUXY.State.setView('canvas');
    }
  }
  
  /**
   * 更新项目信息
   */
  function updateProjectInfo() {
    const project = GUXY.State?.currentProject;
    if (!project) return;
    
    // 更新标题
    const titleEl = document.getElementById('canvas-project-title');
    if (titleEl) {
      titleEl.textContent = project.name;
    }
    
    // 更新侧栏信息
    if (GUXY.Sidebar) {
      GUXY.Sidebar.refresh();
    }
  }
  
  /**
   * 渲染架构
   */
  function renderArchitecture() {
    const project = GUXY.State?.currentProject;
    if (!project?.architecture) return;
    
    // 统一通过 ArchitectureGen 渲染到画布，确保节点/连线与状态同步
    if (GUXY.ArchitectureGen) {
      GUXY.ArchitectureGen.applyToCanvas(project.architecture);
    }
  }
  
  /**
   * 从画布更新架构
   */
  function updateArchitectureFromCanvas() {
    const project = GUXY.State?.currentProject;
    if (!project) return;
    
    // 更新节点位置
    if (project.architecture?.collections && GUXY.CanvasNodes) {
      project.architecture.collections.forEach(col => {
        const pos = GUXY.CanvasNodes.getNodePosition(col.id);
        if (pos) {
          col.x = pos.x;
          col.y = pos.y;
        }
      });
    }
    
    if (project.architecture?.cards && GUXY.CanvasNodes) {
      project.architecture.cards.forEach(card => {
        const pos = GUXY.CanvasNodes.getNodePosition(card.id);
        if (pos) {
          card.x = pos.x;
          card.y = pos.y;
        }
      });
    }
    
    // 保存状态
    GUXY.State.saveToStorage();
  }
  
  /**
   * 页面加载完成后初始化
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
