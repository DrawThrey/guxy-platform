/**
 * GUXY工具栏组件
 * 提供常用操作按钮
 */

GUXY.Toolbar = {
  container: null,
  
  /**
   * 初始化工具栏
   * @param {HTMLElement} container - 容器元素
   */
  init(container) {
    this.container = container;
    this.render();
    console.log('Toolbar initialized');
  },
  
  /**
   * 渲染工具栏
   */
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <a href="#" class="btn-back-to-project">◀</a>
      
      <div class="canvas-title" id="project-title">项目名称</div>
      
      <div class="canvas-header-right">
        <span class="editors-count">👥 1</span>
        
        <div class="toolbar">
          <button class="btn btn-secondary btn-sm btn-center-view" title="居中视图">
            🎯 居中
          </button>
          <button class="btn btn-secondary btn-sm btn-reset-view" title="重置视图">
            ↺ 重置
          </button>
          <button class="btn btn-secondary btn-sm btn-clear-canvas" title="清空画布">
            🗑️ 清空
          </button>
          <button class="btn btn-secondary btn-sm btn-delete-project" title="删除项目">
            🗑 删除项目
          </button>
          <button class="btn btn-secondary btn-sm btn-config" title="配置编辑">
            ⚙️ 配置
          </button>
          <button class="btn btn-primary btn-sm btn-save" title="保存">
            💾 保存
          </button>
        </div>
      </div>
    `;
    
    this.updateProjectTitle();
    this.bindEvents();
  },
  
  /**
   * 更新项目标题
   */
  updateProjectTitle() {
    const titleEl = this.container.querySelector('#project-title');
    if (titleEl && GUXY.State?.currentProject) {
      titleEl.textContent = GUXY.State.currentProject.name;
    }
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;
    
    // 返回项目列表
    const backBtn = this.container.querySelector('.btn-back-to-project');
    backBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.backToProjectList();
    });
    
    // 居中视图
    const centerViewBtn = this.container.querySelector('.btn-center-view');
    centerViewBtn?.addEventListener('click', () => this.centerView());
    
    // 重置视图
    const resetViewBtn = this.container.querySelector('.btn-reset-view');
    resetViewBtn?.addEventListener('click', () => this.resetView());
    
    // 清空画布
    const clearCanvasBtn = this.container.querySelector('.btn-clear-canvas');
    clearCanvasBtn?.addEventListener('click', () => this.clearCanvas());
    
    // 删除项目
    const deleteProjectBtn = this.container.querySelector('.btn-delete-project');
    deleteProjectBtn?.addEventListener('click', () => this.deleteProject());
    
    // 配置编辑
    const configBtn = this.container.querySelector('.btn-config');
    configBtn?.addEventListener('click', () => this.openConfig());
    
    // 保存
    const saveBtn = this.container.querySelector('.btn-save');
    saveBtn?.addEventListener('click', () => this.save());
  },
  
  /**
   * 返回项目列表
   */
  backToProjectList() {
    if (GUXY.Sidebar) {
      GUXY.Sidebar.backToList();
    }
  },
  
  /**
   * 添加集合
   */
  addCollection() {
    const collection = {
      id: GUXY.Utils.uid(),
      type: 'collection',
      title: '新集合',
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      children: []
    };

    console.log('[Toolbar] Adding collection:', collection);

    // 添加到架构
    if (GUXY.State?.currentProject?.architecture) {
      const arch = GUXY.State.currentProject.architecture;
      if (!arch.collections) arch.collections = [];
      arch.collections.push(collection);

      GUXY.State.saveToStorage();
    }

    // 添加到画布（确保立即显示）
    if (GUXY.CanvasNodes) {
      const nodeElement = GUXY.CanvasNodes.addNode(collection);
      console.log('[Toolbar] Collection node added to canvas:', nodeElement);
    }

    // 刷新侧栏以显示最新统计
    if (GUXY.Sidebar) {
      GUXY.Sidebar.refresh();
    }

    GUXY.Toast?.show('集合已添加', 'success');
  },
  
  /**
   * 添加卡片
   * 子画布模式下自动关联当前集合并设置 interface_level
   */
  addCard() {
    const arch = GUXY.State?.currentProject?.architecture;
    if (!arch) {
      GUXY.Toast?.show('没有当前项目', 'warning');
      return;
    }

    const cardId = GUXY.Utils.uid();
    const card = {
      id: cardId,
      type: 'card',
      card_type: 'screen',
      title: '新卡片',
      description: '卡片描述',
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100
    };

    // 子画布模式下：自动关联当前集合，默认一级界面
    if (GUXY.SubCanvas?.isSubCanvasMode && GUXY.SubCanvas.currentCollectionId) {
      const collectionId = GUXY.SubCanvas.currentCollectionId;
      card.collection_id = collectionId;
      card.interface_level = 1;

      // 计算在一级界面区域的合适位置
      const zones = GUXY.SubCanvasZones?.ZONE_ORIGINS || { level1: { x: 20, y: 80 } };
      const zoneWidth = GUXY.SubCanvasZones?.ZONE_COLUMN_WIDTH || 280;
      const existingCards = arch.cards?.filter(c =>
        c.collection_id === collectionId && (c.interface_level === 1 || !c.interface_level)
      ) || [];
      const cardWidth = 400;
      card.x = zones.level1.x + (zoneWidth - cardWidth) / 2;
      card.y = zones.level1.y + existingCards.length * 136;

      // 同步更新集合的 children 数组
      const collection = arch.collections?.find(c => c.id === collectionId);
      if (collection) {
        if (!collection.children) collection.children = [];
        collection.children.push({ id: cardId, title: card.title });
      }
    }

    console.log('[Toolbar] Adding card:', card);

    if (!arch.cards) arch.cards = [];
    arch.cards.push(card);
    GUXY.State.saveToStorage();

    // 子画布模式下调用 render 保持三区域布局
    if (GUXY.SubCanvas?.isSubCanvasMode) {
      GUXY.SubCanvas.render?.();
    } else {
      // 主画布直接添加节点
      if (GUXY.CanvasNodes) {
        const nodeElement = GUXY.CanvasNodes.addNode(card);
        console.log('[Toolbar] Card node added to canvas:', nodeElement);
      }
    }

    // 刷新侧栏以显示最新统计
    if (GUXY.Sidebar) {
      GUXY.Sidebar.refresh();
    }

    GUXY.Toast?.show('卡片已添加', 'success');
  },
  
  /**
   * 自动布局（聚集 -> 炸开动画）
   * 子画布模式下使用 SubCanvas.render 保持三区域布局
   */
  async autoLayout() {
    // 子画布模式：仅重新渲染，保持卡片在对应容器内
    if (GUXY.SubCanvas?.isSubCanvasMode) {
      GUXY.SubCanvas.render?.();
      GUXY.Toast?.show('布局已刷新', 'success');
      return;
    }

    const arch = GUXY.State?.currentProject?.architecture;
    if (!arch || (!arch.cards?.length && !arch.collections?.length)) {
      GUXY.Toast?.show('没有可布局的节点', 'warning');
      return;
    }
    
    if (!GUXY.ForceLayout || !GUXY.CanvasNodes) return;
    
    // 防止重复触发
    if (this._layoutAnimating) return;
    this._layoutAnimating = true;
    
    try {
      // ---------- 准备数据 ----------
      const ensurePrefix = (id, type) => {
        if (!id) return id;
        const prefix = type + '-';
        return id.startsWith(prefix) ? id : prefix + id;
      };
      
      const nodeDataList = [
        ...(arch.collections || []).map(c => ({
          id: ensurePrefix(c.id, 'collection'),
          type: 'collection',
          x: c.x || 0,
          y: c.y || 0,
          width: 300,
          height: 200
        })),
        ...(arch.cards || []).map(c => ({
          id: ensurePrefix(c.id, 'card'),
          type: 'card',
          x: c.x || 0,
          y: c.y || 0,
          width: 240,
          height: 120
        }))
      ];
      
      const edges = (arch.edges || []).map(e => ({
        source: e.source,
        target: e.target
      }));
      
      // 收集所有 DOM 元素
      const nodeElements = [];
      nodeDataList.forEach(nd => {
        const el = GUXY.CanvasNodes.nodeMap.get(nd.id);
        if (el) nodeElements.push({ el, data: nd });
      });
      
      if (nodeElements.length === 0) {
        GUXY.Toast?.show('没有可布局的节点', 'warning');
        this._layoutAnimating = false;
        return;
      }
      
      // ---------- 计算画布可视区域中心（画布坐标系） ----------
      const stage = document.getElementById('canvas-stage');
      const zoom = GUXY.ZoomPan?.zoom || 1;
      const panX = GUXY.ZoomPan?.panX || 0;
      const panY = GUXY.ZoomPan?.panY || 0;
      const viewCenterX = (stage.clientWidth / 2 - panX) / zoom;
      const viewCenterY = (stage.clientHeight / 2 - panY) / zoom;
      
      // ---------- 阶段1: 暂停微飘动画，所有节点飞向中心 ----------
      nodeElements.forEach(({ el }) => {
        el.style.animationPlayState = 'paused';
        el.style.transition = 'left 0.6s ease-in, top 0.6s ease-in';
        el.style.left = viewCenterX + 'px';
        el.style.top = viewCenterY + 'px';
      });
      
      // 同步隐藏连线
      const edgesSvg = document.getElementById('edges-svg');
      if (edgesSvg) {
        edgesSvg.style.transition = 'opacity 0.4s ease';
        edgesSvg.style.opacity = '0';
      }
      
      await new Promise(r => setTimeout(r, 650));
      
      // ---------- 阶段2: 计算新布局 ----------
      // 为 ForceLayout 设定中心
      GUXY.ForceLayout.init(nodeDataList, edges, viewCenterX, viewCenterY);
      
      // ---------- 阶段3: 炸开——节点飞向新位置 ----------
      nodeElements.forEach(({ el, data }) => {
        const pos = GUXY.ForceLayout.getNodePosition(data.id);
        if (pos) {
          el.style.transition = 'left 0.8s cubic-bezier(.17,.67,.29,1.2), top 0.8s cubic-bezier(.17,.67,.29,1.2)';
          el.style.left = pos.x + 'px';
          el.style.top = pos.y + 'px';
          el.dataset.x = pos.x;
          el.dataset.y = pos.y;
        }
      });
      
      // 显示连线
      if (edgesSvg) {
        edgesSvg.style.transition = 'opacity 0.6s ease 0.3s';
        edgesSvg.style.opacity = '1';
      }
      
      await new Promise(r => setTimeout(r, 900));
      
      // ---------- 阶段4: 清理动画，恢复正常 ----------
      nodeElements.forEach(({ el }) => {
        el.style.transition = '';
        el.style.animationPlayState = '';
      });
      if (edgesSvg) {
        edgesSvg.style.transition = '';
        edgesSvg.style.opacity = '';
      }
      
      // 更新连线位置（带节点尺寸）
      if (GUXY.CanvasEdges) {
        const posMap = new Map();
        // 从 DOM 元素获取完整节点信息（包括宽高）
        GUXY.CanvasNodes.nodeMap.forEach((el, nodeId) => {
          const x = parseFloat(el.dataset.x) || 0;
          const y = parseFloat(el.dataset.y) || 0;
          const width = el.offsetWidth;
          const height = el.offsetHeight;
          posMap.set(nodeId, { x, y, width, height });
        });
        GUXY.CanvasEdges.updateAllEdges(posMap);
      }
      
      // 同步架构数据中的坐标
      GUXY.ForceLayout.nodes.forEach(n => {
        const col = arch.collections?.find(c => ensurePrefix(c.id, 'collection') === n.id);
        if (col) { col.x = n.x; col.y = n.y; }
        const card = arch.cards?.find(c => ensurePrefix(c.id, 'card') === n.id);
        if (card) { card.x = n.x; card.y = n.y; }
      });
      GUXY.State?.saveToStorage();
      
      GUXY.Toast?.show('自动布局完成', 'success');
    } catch (err) {
      console.error('Auto layout error:', err);
      GUXY.Toast?.show('布局失败: ' + err.message, 'error');
    } finally {
      this._layoutAnimating = false;
    }
  },
  
  /**
   * 居中视图
   */
  centerView() {
    if (GUXY.ZoomPan) {
      GUXY.ZoomPan.centerView();
    }
  },
  
  /**
   * 重置视图
   */
  resetView() {
    if (GUXY.ZoomPan) {
      GUXY.ZoomPan.resetView();
    }
  },
  
  /**
   * 删除当前项目
   */
  async deleteProject() {
    const project = GUXY.State?.currentProject;
    if (!project) return;
    if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) return;
    try {
      await GUXY.ProjectList?.deleteProject(project.id);
      this.backToProjectList();
      GUXY.Toast?.show('项目已删除', 'success');
    } catch (err) {
      console.error('Delete project error:', err);
      GUXY.Toast?.show('删除失败', 'error');
    }
  },

  /**
   * 清空画布
   */
  clearCanvas() {
    if (!confirm('确定要清空画布吗？此操作将删除所有节点和连线。')) {
      return;
    }
    
    // 清空架构
    if (GUXY.State?.currentProject) {
      GUXY.State.currentProject.architecture = {
        collections: [],
        cards: [],
        edges: []
      };
      GUXY.State.saveToStorage();
    }
    
    // 清空画布
    if (GUXY.CanvasNodes) {
      GUXY.CanvasNodes.clear();
    }
    
    if (GUXY.CanvasEdges) {
      GUXY.CanvasEdges.clear();
    }
    
    GUXY.Toast?.show('画布已清空', 'success');
  },
  
  /**
   * 保存
   */
  async save() {
    try {
      // 保存架构到数据库
      if (GUXY.State?.currentProject) {
        await GUXY.DB.saveProject(GUXY.State.currentProject);
      }
      
      GUXY.Toast?.show('保存成功', 'success');
      
      // 记录日志
      await GUXY.Utils.logWorkflowChange(
        GUXY.Workflow?.currentStep || 1,
        'project_saved',
        {}
      );
    } catch (error) {
      GUXY.Toast?.show(`保存失败: ${error.message}`, 'error');
      console.error('Save error:', error);
    }
  },

  /**
   * 打开配置编辑
   */
  openConfig() {
    if (GUXY.ApiConfig) {
      GUXY.ApiConfig.showConfigModal();
    } else {
      GUXY.Toast?.show('API配置模块未加载', 'error');
    }
  },
  
  /**
   * 刷新工具栏
   */
  refresh() {
    this.updateProjectTitle();
  },
  
  /**
   * 销毁工具栏
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
    
    console.log('Toolbar destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.Toolbar;
}
