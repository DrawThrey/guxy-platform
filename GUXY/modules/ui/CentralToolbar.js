/**
 * GUXY中岛台工具栏组件
 * 浮岛式设计，位于画布底部中央，包含核心功能按钮
 */

GUXY.CentralToolbar = {
  container: null,
  
  /**
   * 初始化中岛台工具栏
   */
  init() {
    this.createContainer();
    this.render();
    this.bindEvents();
    console.log('CentralToolbar initialized');
  },
  
  /**
   * 创建容器
   */
  createContainer() {
    // 查找或创建容器
    let container = document.getElementById('central-toolbar');
    if (!container) {
      container = document.createElement('div');
      container.id = 'central-toolbar';
      container.className = 'central-toolbar';
      document.body.appendChild(container);
    }
    this.container = container;
  },
  
  /**
   * 渲染工具栏
   */
  render() {
    if (!this.container) return;

    const isSubCanvas = GUXY.SubCanvas?.isSubCanvasMode;
    const mainGroupHtml = isSubCanvas ? `
        <!-- 子画布专用：一键AI改写、一键AI生成低保真（显示在中岛台中间下方） -->
        <div class="toolbar-group toolbar-group-main toolbar-group-subcanvas">
          <button type="button" class="toolbar-btn toolbar-btn-primary btn-subcanvas-expand-all" id="btn-subcanvas-expand-all" title="对本集合内所有卡片的描述进行改写，生成用于低保真的提示词">
            <span class="toolbar-btn-icon">✨</span>
            <span class="toolbar-btn-label">一键AI改写</span>
          </button>
          <button type="button" class="toolbar-btn toolbar-btn-primary btn-subcanvas-generate-lowfi" id="btn-subcanvas-generate-lowfi" title="为本集合内所有卡片批量生成低保真原型图">
            <span class="toolbar-btn-icon">🖼</span>
            <span class="toolbar-btn-label">一键AI生成低保真</span>
          </button>
        </div>
        
        <div class="toolbar-divider"></div>
` : `
        <!-- 核心功能按钮组（主画布显示） -->
        <div class="toolbar-group toolbar-group-main">
          <button class="toolbar-btn toolbar-btn-primary" id="btn-import-design-doc" title="导入策划案">
            <span class="toolbar-btn-icon">📄</span>
            <span class="toolbar-btn-label">导入策划案</span>
          </button>
          <button class="toolbar-btn toolbar-btn-primary" id="btn-import-architecture" title="导入架构">
            <span class="toolbar-btn-icon">📊</span>
            <span class="toolbar-btn-label">导入架构</span>
          </button>
          <button class="toolbar-btn toolbar-btn-primary" id="btn-export-architecture" title="导出AI可读架构">
            <span class="toolbar-btn-icon">📤</span>
            <span class="toolbar-btn-label">导出架构</span>
          </button>
          <button class="toolbar-btn toolbar-btn-primary" id="btn-export-markdown" title="导出画布为Markdown">
            <span class="toolbar-btn-icon">📝</span>
            <span class="toolbar-btn-label">导出MD</span>
          </button>
          <button class="toolbar-btn toolbar-btn-primary" id="btn-generate-plan" title="生成开发规划">
            <span class="toolbar-btn-icon">📋</span>
            <span class="toolbar-btn-label">生成规划</span>
          </button>
        </div>
        
        <div class="toolbar-divider"></div>
`;

    this.container.innerHTML = `
      <div class="central-toolbar-content">
        ${mainGroupHtml}
        <!-- 画布操作按钮组 -->
        <div class="toolbar-group toolbar-group-canvas">
          <button class="toolbar-btn toolbar-btn-secondary" id="btn-auto-layout" title="自动布局">
            <span class="toolbar-btn-icon">🔄</span>
          </button>
          <button class="toolbar-btn toolbar-btn-secondary" id="btn-add-collection" title="新建集合">
            <span class="toolbar-btn-icon">📁</span>
          </button>
          <button class="toolbar-btn toolbar-btn-secondary" id="btn-add-card" title="新建卡片">
            <span class="toolbar-btn-icon">📝</span>
          </button>
        </div>
        
        <!-- 分隔线 -->
        <div class="toolbar-divider"></div>
        
        <!-- 缩放控制按钮组 -->
        <div class="toolbar-group toolbar-group-zoom">
          <button class="toolbar-btn toolbar-btn-secondary" id="btn-zoom-out" title="缩小">
            <span class="toolbar-btn-icon">−</span>
          </button>
          <span class="toolbar-zoom-level" id="zoom-level">100%</span>
          <button class="toolbar-btn toolbar-btn-secondary" id="btn-zoom-in" title="放大">
            <span class="toolbar-btn-icon">+</span>
          </button>
          <button class="toolbar-btn toolbar-btn-secondary" id="btn-zoom-reset" title="重置缩放">
            <span class="toolbar-btn-icon">⌂</span>
          </button>
        </div>
      </div>
    `;
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;
    
    // 导入策划案
    const importDesignDocBtn = this.container.querySelector('#btn-import-design-doc');
    importDesignDocBtn?.addEventListener('click', () => this.handleImportDesignDoc());
    
    // 导入架构
    const importArchBtn = this.container.querySelector('#btn-import-architecture');
    importArchBtn?.addEventListener('click', () => this.handleImportArchitecture());
    
    // 导出架构
    const exportArchBtn = this.container.querySelector('#btn-export-architecture');
    exportArchBtn?.addEventListener('click', () => this.handleExportArchitecture());
    
    // 导出Markdown
    const exportMarkdownBtn = this.container.querySelector('#btn-export-markdown');
    exportMarkdownBtn?.addEventListener('click', () => this.handleExportMarkdown());
    
    // 生成开发规划
    const generatePlanBtn = this.container.querySelector('#btn-generate-plan');
    generatePlanBtn?.addEventListener('click', () => this.handleGeneratePlan());
    
    // 自动布局
    const autoLayoutBtn = this.container.querySelector('#btn-auto-layout');
    autoLayoutBtn?.addEventListener('click', () => this.handleAutoLayout());
    
    // 新建集合
    const addCollectionBtn = this.container.querySelector('#btn-add-collection');
    addCollectionBtn?.addEventListener('click', () => this.handleAddCollection());
    
    // 新建卡片
    const addCardBtn = this.container.querySelector('#btn-add-card');
    addCardBtn?.addEventListener('click', () => this.handleAddCard());
    
    // 子画布中岛台：一键AI改写、一键AI生成低保真
    const expandAllBtn = this.container.querySelector('.btn-subcanvas-expand-all');
    expandAllBtn?.addEventListener('click', () => GUXY.SubCanvas?.runExpandAll?.());
    const generateLowFiBtn = this.container.querySelector('.btn-subcanvas-generate-lowfi');
    generateLowFiBtn?.addEventListener('click', () => GUXY.SubCanvas?.runGenerateLowFiAll?.());

    // 缩放控制
    const zoomOutBtn = this.container.querySelector('#btn-zoom-out');
    zoomOutBtn?.addEventListener('click', () => this.handleZoomOut());
    
    const zoomInBtn = this.container.querySelector('#btn-zoom-in');
    zoomInBtn?.addEventListener('click', () => this.handleZoomIn());
    
    const zoomResetBtn = this.container.querySelector('#btn-zoom-reset');
    zoomResetBtn?.addEventListener('click', () => this.handleZoomReset());
    
    // 监听缩放变化更新显示
    if (GUXY.ZoomPan) {
      document.addEventListener('zoomChanged', (e) => {
        this.updateZoomLevel(e.detail.zoom);
      });
    }
  },
  
  /**
   * 处理导入策划案（使用新的两阶段流程）
   */
  async handleImportDesignDoc() {
    // 创建文件输入
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.json,.xlsx,.xls';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        // 使用新的两阶段导入流程
        if (GUXY.AIAnalysis?.importWithTwoStageFlow) {
          await GUXY.AIAnalysis.importWithTwoStageFlow(file);
        } else {
          // 降级处理：使用旧方法
          if (GUXY.AIAnalysis) {
            await GUXY.AIAnalysis.analyzeFile(file);
          } else {
            GUXY.Toast?.show('AI分析模块未加载', 'error');
          }
        }
      } catch (error) {
        console.error('Import design doc error:', error);
        GUXY.Toast?.show(`导入失败: ${error.message}`, 'error');
      }
    };
    input.click();
  },
  
  /**
   * 处理导入架构
   */
  handleImportArchitecture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await GUXY.Utils.readFile(file);
        const architecture = JSON.parse(text);
        
        if (GUXY.State?.currentProject) {
          GUXY.State.currentProject.architecture = architecture;
          GUXY.State.saveToStorage();
          
          // 应用到画布
          if (GUXY.CanvasNodes && GUXY.CanvasEdges) {
            GUXY.CanvasNodes.clear();
            GUXY.CanvasEdges.clear();
            
            // 添加节点
            if (architecture.collections) {
              architecture.collections.forEach(col => {
                GUXY.CanvasNodes.addNode({
                  id: col.id,
                  type: 'collection',
                  title: col.title,
                  x: col.x || 0,
                  y: col.y || 0
                });
              });
            }
            
            if (architecture.cards) {
              architecture.cards.forEach(card => {
                GUXY.CanvasNodes.addNode({
                  id: card.id,
                  type: 'card',
                  title: card.title,
                  description: card.description,
                  x: card.x || 0,
                  y: card.y || 0
                });
              });
            }
            
            // 添加连线
            if (architecture.edges) {
              architecture.edges.forEach(edge => {
                GUXY.CanvasEdges.addEdge(edge);
              });
            }
          }
          
          GUXY.Toast?.show('架构导入成功', 'success');
        }
      } catch (error) {
        console.error('Import architecture error:', error);
        GUXY.Toast?.show(`导入失败: ${error.message}`, 'error');
      }
    };
    input.click();
  },
  
  /**
   * 处理导出架构
   */
  async handleExportArchitecture() {
    if (!GUXY.State?.currentProject?.architecture) {
      GUXY.Toast?.show('没有可导出的架构', 'warning');
      return;
    }
    
    try {
      // 使用 ExportManager 导出架构
      if (GUXY.ExportManager) {
        await GUXY.ExportManager.exportArchitecture(
          GUXY.State.currentProject.architecture,
          GUXY.State.currentProject
        );
      } else {
        // 降级处理：仅导出JSON格式
        const architecture = GUXY.State.currentProject.architecture;
        const json = JSON.stringify(architecture, null, 2);
        const filename = `architecture_${GUXY.State.currentProject.id}_${Date.now()}.json`;
        
        GUXY.Utils.downloadFile(json, filename, 'application/json');
        GUXY.Toast?.show('架构导出成功（仅JSON）', 'success');
      }
    } catch (error) {
      console.error('Export architecture error:', error);
      GUXY.Toast?.show(`导出失败: ${error.message}`, 'error');
    }
  },
  
  /**
   * 处理导出Markdown
   */
  async handleExportMarkdown() {
    if (!GUXY.State?.currentProject?.architecture) {
      GUXY.Toast?.show('没有可导出的画布', 'warning');
      return;
    }
    
    try {
      if (GUXY.ExportManager?.exportCanvasToMarkdown) {
        await GUXY.ExportManager.exportCanvasToMarkdown(
          GUXY.State.currentProject.architecture,
          GUXY.State.currentProject
        );
      } else {
        GUXY.Toast?.show('导出模块未加载', 'error');
      }
    } catch (error) {
      console.error('Export markdown error:', error);
      GUXY.Toast?.show(`导出失败: ${error.message}`, 'error');
    }
  },
  
  /**
   * 处理生成开发规划
   */
  async handleGeneratePlan() {
    if (!GUXY.State?.currentProject) {
      GUXY.Toast?.show('请先选择项目', 'warning');
      return;
    }
    
    try {
      if (GUXY.PlanImport) {
        await GUXY.PlanImport.exportToPlan(GUXY.State.currentProject.id);
      } else {
        GUXY.Toast?.show('开发规划模块未加载', 'error');
      }
    } catch (error) {
      console.error('Generate plan error:', error);
      GUXY.Toast?.show(`生成失败: ${error.message}`, 'error');
    }
  },
  
  /**
   * 处理自动布局
   */
  handleAutoLayout() {
    if (GUXY.Toolbar) {
      GUXY.Toolbar.autoLayout();
    } else {
      GUXY.Toast?.show('工具栏模块未加载', 'error');
    }
  },
  
  /**
   * 处理新建集合
   */
  handleAddCollection() {
    if (GUXY.Toolbar) {
      GUXY.Toolbar.addCollection();
    } else {
      GUXY.Toast?.show('工具栏模块未加载', 'error');
    }
  },
  
  /**
   * 处理新建卡片
   */
  handleAddCard() {
    if (GUXY.Toolbar) {
      GUXY.Toolbar.addCard();
    } else {
      GUXY.Toast?.show('工具栏模块未加载', 'error');
    }
  },
  
  /**
   * 处理缩小
   */
  handleZoomOut() {
    if (GUXY.ZoomPan) {
      GUXY.ZoomPan.zoomOut();
      this.updateZoomLevel(GUXY.ZoomPan.zoom);
    }
  },
  
  /**
   * 处理放大
   */
  handleZoomIn() {
    if (GUXY.ZoomPan) {
      GUXY.ZoomPan.zoomIn();
      this.updateZoomLevel(GUXY.ZoomPan.zoom);
    }
  },
  
  /**
   * 处理重置缩放
   */
  handleZoomReset() {
    if (GUXY.ZoomPan) {
      GUXY.ZoomPan.resetView();
      this.updateZoomLevel(1);
    }
  },
  
  /**
   * 更新缩放级别显示
   * @param {number} zoom - 缩放级别
   */
  updateZoomLevel(zoom) {
    const zoomLevelEl = this.container?.querySelector('#zoom-level');
    if (zoomLevelEl) {
      zoomLevelEl.textContent = `${Math.round(zoom * 100)}%`;
    }
  },
  
  /**
   * 刷新工具栏
   */
  refresh() {
    this.render();
    this.bindEvents();
  },
  
  /**
   * 销毁工具栏
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
    this.container = null;
    console.log('CentralToolbar destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.CentralToolbar;
}
