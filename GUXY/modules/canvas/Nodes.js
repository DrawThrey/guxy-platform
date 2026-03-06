/**
 * GUXY节点渲染
 * 管理画布上的节点创建和更新
 */

GUXY.CanvasNodes = {
  container: null,
  nodeMap: new Map(),
  
  /**
   * 初始化节点容器
   * @param {HTMLElement} container - 容器元素
   */
  init(container) {
    this.container = container;
    console.log('CanvasNodes initialized');
  },
  
  /**
   * 创建节点元素
   * @param {object} nodeData - 节点数据
   * @returns {HTMLElement} 节点元素
   */
  createNodeElement(nodeData) {
    const { id, type, title, description, x, y, color, cover_thumb, module_type } = nodeData;
    
    // 确定节点类型（card或collection）
    const nodeType = type || (id.startsWith('collection-') ? 'collection' : 'card');
    const nodeColors = GUXY.Constants?.NODE_COLORS?.[nodeType] || GUXY.Constants?.NODE_COLORS?.card;
    
    const element = document.createElement('div');
    element.className = `${nodeType}-node`;
    element.dataset.id = id.startsWith(nodeType + '-') ? id : `${nodeType}-${id}`;
    element.dataset.type = nodeType;
    element.dataset.x = x || 0;
    element.dataset.y = y || 0;

    element.style.left = `${x || 0}px`;
    element.style.top = `${y || 0}px`;
    // 不设置内联 backgroundColor，让 CSS 控制深色背景和毛玻璃效果
    
    // 添加连接点容器
    const connectionDotsHtml = `
      <div class="connection-dot-container">
        <div class="connection-dot top" data-position="top" data-node-id="${id}"></div>
        <div class="connection-dot right" data-position="right" data-node-id="${id}"></div>
        <div class="connection-dot bottom" data-position="bottom" data-node-id="${id}"></div>
        <div class="connection-dot left" data-position="left" data-node-id="${id}"></div>
      </div>
    `;
    
    // 模块图标映射
    const MODULE_ICONS = {
      system: '⚙',
      combat: '⚔',
      story: '📖',
      level: '🎯'
    };
    const icon = MODULE_ICONS[module_type] || MODULE_ICONS.system;
    
    // 根据节点类型渲染不同的HTML
    if (nodeType === 'collection') {
      // 集合节点HTML
      const cardsCount = 0; // TODO: 从架构数据获取
      element.innerHTML = `
        <div class="header">
          <span class="collection-toggle">▶</span>
          <span class="module-icon">${icon}</span>
          <span class="collection-node-title">${this.escapeHtml(title || '未命名集合')}</span>
        </div>
        <div class="meta">${cardsCount} 张卡片</div>
        ${connectionDotsHtml}
      `;
    } else {
      // 卡片节点HTML
      const cardTypeClass = nodeData.card_type === 'screen' ? 'card-node--screen' : '';
      const hasLowFiImage = !!nodeData.lowFiImage;
      const nodeClass = `${nodeType}-node${cardTypeClass ? ' ' + cardTypeClass : ''}${hasLowFiImage ? ' card-node--has-lowfi' : ''}`;

      element.className = nodeClass;

      element.innerHTML = `
        <div class="card-node-header">
          <div class="card-node-title">${this.escapeHtml(title || '未命名卡片')}</div>
          <div class="card-node-actions">
            <button class="btn-icon btn-edit" data-action="edit" title="编辑">✎</button>
            <button class="btn-icon btn-delete" data-action="delete" title="删除">×</button>
          </div>
        </div>
        ${hasLowFiImage && nodeData.lowFiImage ? `
          <div class="card-node-media">
            <img src="${nodeData.lowFiImage.dataUrl}" class="card-lowfi-thumb" alt="低保真原型图" />
          </div>
        ` : ''}
        ${description ? `<div class="body card-node-body">${this.escapeHtml(description)}</div>` : ''}
        <div class="card-node-footer">
          <span class="card-node-tag">${this.getCardTypeLabel(nodeData.card_type || 'screen')}</span>
          <span class="card-node-id">#${id.slice(-4)}</span>
        </div>
        ${connectionDotsHtml}
      `;
    }
    
    return element;
  },
  
  /**
   * 添加节点
   * @param {object} nodeData - 节点数据
   * @returns {HTMLElement} 节点元素
   */
  addNode(nodeData) {
    if (!this.container) return null;
    
    const element = this.createNodeElement(nodeData);
    this.container.appendChild(element);
    
    // 添加拖拽事件绑定
    this.attachDragEvents(element, nodeData);
    
    // 如果是集合节点，添加卡片按钮事件
    if (element.dataset.type === 'collection') {
      this.attachAddCardEvent(element);
    }
    
    // 使用dataset中的完整ID作为键（包含前缀）
    const fullNodeId = element.dataset.id;
    this.nodeMap.set(fullNodeId, element);
    
    return element;
  },
  
  /**
   * 批量添加节点
   * @param {Array} nodesData - 节点数据数组
   */
  addNodes(nodesData) {
    if (!this.container) return;
    
    nodesData.forEach(nodeData => {
      this.addNode(nodeData);
    });
  },
  
  /**
   * 更新节点
   * @param {string} nodeId - 节点ID
   * @param {object} updates - 更新内容
   */
  updateNode(nodeId, updates) {
    const element = this.nodeMap.get(nodeId);
    if (!element) return;
    
    if (updates.x !== undefined || updates.y !== undefined) {
      element.dataset.x = updates.x !== undefined ? updates.x : element.dataset.x;
      element.dataset.y = updates.y !== undefined ? updates.y : element.dataset.y;
      element.style.left = `${element.dataset.x}px`;
      element.style.top = `${element.dataset.y}px`;
    }
    
    if (updates.title !== undefined) {
      const titleEl = element.querySelector('.card-node-title');
      if (titleEl) {
        titleEl.textContent = updates.title;
      }
    }
    
    if (updates.description !== undefined) {
      const bodyEl = element.querySelector('.card-node-body');
      if (bodyEl) {
        bodyEl.textContent = updates.description;
      }
    }
  },
  
  /**
   * 更新节点位置
   * @param {string} nodeId - 节点ID
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  updateNodePosition(nodeId, x, y) {
    const element = this.nodeMap.get(nodeId);
    if (!element) return;
    
    element.dataset.x = x;
    element.dataset.y = y;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  },
  
  /**
   * 移除节点
   * @param {string} nodeId - 节点ID
   */
  removeNode(nodeId) {
    const element = this.nodeMap.get(nodeId);
    if (!element) return;
    
    element.remove();
    this.nodeMap.delete(nodeId);
  },
  
  /**
   * 获取节点元素
   * @param {string} nodeId - 节点ID
   * @returns {HTMLElement} 节点元素
   */
  getNodeElement(nodeId) {
    return this.nodeMap.get(nodeId);
  },
  
  /**
   * 获取节点位置
   * @param {string} nodeId - 节点ID
   * @returns {object} 位置对象
   */
  getNodePosition(nodeId) {
    const element = this.nodeMap.get(nodeId);
    if (!element) return null;
    
    return {
      x: parseFloat(element.dataset.x) || 0,
      y: parseFloat(element.dataset.y) || 0,
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  },
  
  /**
   * 获取连接点位置
   * @param {string} nodeId - 节点ID
   * @param {string} position - 位置（top/right/bottom/left）
   * @returns {object} 位置对象
   */
  getConnectionPointPosition(nodeId, position) {
    const nodePos = this.getNodePosition(nodeId);
    if (!nodePos) return null;
    
    const { x, y, width, height } = nodePos;
    
    switch (position) {
      case 'top':
        return { x: x + width / 2, y: y };
      case 'right':
        return { x: x + width, y: y + height / 2 };
      case 'bottom':
        return { x: x + width / 2, y: y + height };
      case 'left':
        return { x: x, y: y + height / 2 };
      default:
        return { x: x + width / 2, y: y + height / 2 };
    }
  },
  
  /**
   * 选中节点
   * @param {string} nodeId - 节点ID
   */
  selectNode(nodeId) {
    this.deselectAll();
    const element = this.nodeMap.get(nodeId);
    if (element) {
      element.classList.add('selected');
    }
  },
  
  /**
   * 取消选中所有节点
   */
  deselectAll() {
    this.nodeMap.forEach(element => {
      element.classList.remove('selected');
    });
  },
  
  /**
   * 清空所有节点
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.nodeMap.clear();
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
   * 获取卡片类型标签
   * @param {string} type - 卡片类型
   * @returns {string} 类型标签
   */
  getCardTypeLabel(type) {
    const labels = {
      system: '系统',
      battle: '战斗',
      story: '剧情',
      level: '关卡',
      ui: '界面',
      data: '数据',
      collection: '集合',
      card: '卡片',
      screen: '界面',
      hint: '提示'
    };
    return labels[type] || type;
  },
  
  /**
   * 为节点添加拖拽事件
   * @param {HTMLElement} element - 节点元素
   * @param {object} nodeData - 节点数据
   */
  attachDragEvents(element, nodeData) {
    const nodeId = element.dataset.id;
    const clickThreshold = 5; // 像素阈值，超过此值认为是拖拽
    let clickStartPos = { x: 0, y: 0 };
    let isDragging = false;
    
    element.onmousedown = (e) => {
      // 过滤：连接点（兼容 connection-dot 和 connection-point 两种类名）、调整手柄、折叠按钮、操作按钮
      if (e.target.classList.contains('connection-dot') || e.target.classList.contains('connection-point')) return;
      if (e.target.classList.contains('handle')) return;
      if (e.target.closest('.collection-toggle')) return;
      if (e.target.closest('[data-action]') || e.target.closest('.btn-icon')) return;
      
      e.stopPropagation();
      e.preventDefault();
      
      // 记录点击起始位置
      clickStartPos = { x: e.clientX, y: e.clientY };
      isDragging = false;
      
      // 记录起始位置
      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = {
        x: parseFloat(element.dataset.x) || 0,
        y: parseFloat(element.dataset.y) || 0
      };
      
      // 计算初始偏移（让节点跟随鼠标点击位置）
      let currentX = startPos.x;
      let currentY = startPos.y;
      
      // 缓存节点尺寸，避免拖拽中反复触发 reflow
      const nodeW = element.offsetWidth;
      const nodeH = element.offsetHeight;
      
      // 定义移动处理函数
      const onMove = (e2) => {
        // 计算移动距离
        const dx = Math.abs(e2.clientX - clickStartPos.x);
        const dy = Math.abs(e2.clientY - clickStartPos.y);
        
        // 如果移动距离超过阈值，开始拖拽
        if (!isDragging && (dx > clickThreshold || dy > clickThreshold)) {
          isDragging = true;
          element.classList.add('dragging');
        }
        
        if (!isDragging) return;
        
        const moveDx = e2.clientX - startX;
        const moveDy = e2.clientY - startY;
        
        // 直接从 ZoomPan 读取缩放值（避免 getComputedStyle 重排，性能提升显著）
        const zoom = GUXY.ZoomPan?.zoom || 1;
        
        // 计算新位置（考虑缩放）
        currentX = startPos.x + moveDx / zoom;
        currentY = startPos.y + moveDy / zoom;
        
        // 子画布模式：检测鼠标所在区域并高亮边缘
        if (GUXY.SubCanvas?.isSubCanvasMode && GUXY.SubCanvasZones && nodeId.startsWith('card-')) {
          const cardCenterX = currentX + nodeW / 2;
          const cardCenterY = currentY + nodeH / 2;
          const highlightedZone = GUXY.SubCanvasZones.detectZoneFromPosition(cardCenterX, cardCenterY);
          GUXY.SubCanvasZones.highlightZone(highlightedZone);
        }
        
        // 更新节点位置
        element.style.left = `${currentX}px`;
        element.style.top = `${currentY}px`;
        element.dataset.x = currentX;
        element.dataset.y = currentY;
        
        // 更新相关连线（使用缓存尺寸避免 reflow）
        if (GUXY.CanvasEdges) {
          GUXY.CanvasEdges.updateEdgesForNode(nodeId, {
            x: currentX,
            y: currentY,
            width: nodeW,
            height: nodeH
          });
        }
      };
      
      // 定义释放处理函数
      const onUp = () => {
        // 移除事件监听
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        
        // 移除拖拽样式
        if (isDragging) {
          element.classList.remove('dragging');
          
          // 子画布模式：若卡片跨区域放置，更新 interface_level 并重新布局
          if (GUXY.SubCanvas?.isSubCanvasMode && GUXY.SubCanvasZones && nodeId.startsWith('card-')) {
            GUXY.SubCanvasZones.clearHighlight();
            const cardCenterX = currentX + (element.offsetWidth || 200) / 2;
            const cardCenterY = currentY + (element.offsetHeight || 100) / 2;
            const newZone = GUXY.SubCanvasZones.detectZoneFromPosition(cardCenterX, cardCenterY);
            const cardId = nodeId.replace('card-', '');
            const arch = GUXY.State?.currentProject?.architecture;
            const card = arch?.cards?.find(c => c.id === cardId || c.id === nodeId);

            if (card) {
              // 确保卡片有 collection_id（修复新建卡片缺失的情况）
              if (!card.collection_id && GUXY.SubCanvas.currentCollectionId) {
                card.collection_id = GUXY.SubCanvas.currentCollectionId;
              }
              if (!card.interface_level) {
                card.interface_level = 1;
              }

              if (newZone) {
                // 拖入了某个区域
                const currentZone = GUXY.SubCanvasZones.getCardZone(card);
                if (newZone !== currentZone) {
                  const newLevel = GUXY.SubCanvasZones.zoneToInterfaceLevel(newZone);
                  card.interface_level = newLevel;
                  if (newZone === 'level3') {
                    card.type = card.card_type || 'screen';
                    card.card_type = 'screen';
                  }
                }
                // 无论是否跨区域，都保存并重新布局
                GUXY.State?.saveToStorage?.();
                GUXY.SubCanvas?.render?.();
                return;
              } else {
                // 拖到了区域外 — 弹回原区域，重新布局
                console.log('[Drag] Card dropped outside zones, snapping back');
                GUXY.State?.saveToStorage?.();
                GUXY.SubCanvas?.render?.();
                return;
              }
            }
          }
          
          // 保存位置到数据
          this.saveNodePosition(nodeId, currentX, currentY);
          
          console.log('[Drag] Node moved:', nodeId, 'to:', { x: currentX, y: currentY });
        } else {
          // 如果没有拖拽，认为是点击
          console.log('[Drag] Node clicked:', nodeId);
          this.handleNodeClick(element, nodeData);
        }
        
        isDragging = false;
      };
      
      // 绑定移动和释放事件
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
  },
  
  /**
   * 处理节点点击
   * @param {HTMLElement} element - 节点元素
   * @param {object} nodeData - 节点数据
   */
  handleNodeClick(element, nodeData) {
    const nodeId = element.dataset.id;
    const dataType = element.dataset.type;
    const isCollection = dataType === 'collection' || nodeId.startsWith('collection-');
    
    // 选中节点
    if (GUXY.CanvasNodes) {
      GUXY.CanvasNodes.selectNode(nodeId);
    }
    
    // 显示详情侧栏
    if (GUXY.NodeDetailSidebar) {
      // 获取节点数据
      if (!GUXY.State?.currentProject?.architecture) return;
      
      const arch = GUXY.State.currentProject.architecture;
      let fullNodeData = null;
      const displayType = isCollection ? 'collection' : 'card';
      
      if (isCollection) {
        // 先用完整ID查找，再用去前缀的ID查找（兼容不同ID格式）
        fullNodeData = arch.collections?.find(c => c.id === nodeId) ||
                       arch.collections?.find(c => c.id === nodeId.replace(/^collection-/, ''));
      } else {
        fullNodeData = arch.cards?.find(c => c.id === nodeId) ||
                       arch.cards?.find(c => c.id === nodeId.replace(/^card-/, ''));
      }
      
      if (fullNodeData) {
        GUXY.NodeDetailSidebar.show(fullNodeData, displayType);
      }
    }
  },
  
  /**
   * 保存节点位置到架构数据
   * @param {string} nodeId - 节点ID
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  saveNodePosition(nodeId, x, y) {
    if (!GUXY.State?.currentProject?.architecture) return;
    
    const arch = GUXY.State.currentProject.architecture;
    
    // 通过元素的 dataset.type 判断节点类型（比仅靠ID前缀更可靠）
    const element = this.nodeMap.get(nodeId);
    const dataType = element?.dataset?.type;
    const isCollection = dataType === 'collection' || nodeId.startsWith('collection-');
    
    if (isCollection) {
      // 先用完整ID查找，再用去前缀的ID查找（兼容不同ID格式）
      const collection = arch.collections?.find(c => c.id === nodeId) ||
                         arch.collections?.find(c => c.id === nodeId.replace(/^collection-/, ''));
      if (collection) {
        collection.x = x;
        collection.y = y;
      }
    } else {
      const card = arch.cards?.find(c => c.id === nodeId) ||
                   arch.cards?.find(c => c.id === nodeId.replace(/^card-/, ''));
      if (card) {
        card.x = x;
        card.y = y;
      }
    }
    
    GUXY.State.saveToStorage();
  },
  
  /**
   * 为集合节点绑定添加卡片事件
   * @param {HTMLElement} element - 集合节点元素
   */
  attachAddCardEvent(element) {
    const addCardBtn = element.querySelector('[data-action="add-card"]');
    if (!addCardBtn) return;
    
    addCardBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 防止触发节点的点击事件
      const collectionId = element.dataset.id;
      console.log('[Nodes] Add card clicked for collection:', collectionId);
      this.addCardToCollection(collectionId);
    });
  },
  
  /**
   * 向集合中添加新卡片
   * @param {string} collectionId - 集合ID
   */
  addCardToCollection(collectionId) {
    if (!GUXY.State?.currentProject?.architecture) {
      GUXY.Toast?.show('没有当前项目', 'warning');
      return;
    }
    
    const arch = GUXY.State.currentProject.architecture;
    
    // 查找集合
    const collection = arch.collections?.find(c => c.id === collectionId) ||
                         arch.collections?.find(c => c.id === collectionId.replace(/^collection-/, ''));
    
    if (!collection) {
      GUXY.Toast?.show('找不到集合', 'error');
      return;
    }
    
    // 创建新卡片数据
    const cardId = GUXY.Utils.uid();
    const realCollectionId = collectionId.replace(/^collection-/, '');
    
    // 子画布模式：默认放到一级界面区域中心
    let defaultX = collection.x + 50;
    let defaultY = collection.y + 250;
    let defaultInterfaceLevel = 1;
    
    if (GUXY.SubCanvas?.isSubCanvasMode) {
      // 在子画布模式下，将新卡片放置到一级界面区域
      const zones = GUXY.SubCanvasZones?.ZONE_ORIGINS || { level1: { x: 20, y: 80 } };
      const zoneWidth = GUXY.SubCanvasZones?.ZONE_COLUMN_WIDTH || 280;
      const existingCards = arch.cards?.filter(c =>
        c.collection_id === realCollectionId && (c.interface_level === 1 || !c.interface_level)
      ) || [];
      const cardWidth = 400;
      defaultX = zones.level1.x + (zoneWidth - cardWidth) / 2;
      defaultY = zones.level1.y + existingCards.length * 136; // CARD_HEIGHT(100) + CARD_GAP(36)
    }
    
    const card = {
      id: cardId,
      type: 'card',
      card_type: 'screen',
      title: `新卡片 ${collection.children?.length + 1 || 1}`,
      description: '卡片描述',
      collection_id: realCollectionId,
      interface_level: defaultInterfaceLevel,
      x: defaultX,
      y: defaultY
    };
    
    console.log('[Nodes] Creating new card for collection:', card);
    
    // 添加到架构的cards数组
    if (!arch.cards) arch.cards = [];
    arch.cards.push(card);
    
    // 添加到集合的children数组
    if (!collection.children) collection.children = [];
    collection.children.push({ id: cardId, title: card.title });
    
    // 保存到存储
    GUXY.State.saveToStorage();
    
    // 子画布模式下调用 SubCanvas.render() 重新布局，确保卡片正确显示在区域中
    if (GUXY.SubCanvas?.isSubCanvasMode) {
      GUXY.SubCanvas.render?.();
      console.log('[Nodes] Card added via SubCanvas.render()');
    } else {
      // 主画布：直接添加节点
      if (this.container) {
        const cardElement = this.addNode(card);
        console.log('[Nodes] Card element created:', cardElement);
      }
      // 更新集合节点显示（卡片计数）
      this.updateCollectionDisplay(collectionId, collection);
    }
    
    // 刷新侧栏统计
    if (GUXY.Sidebar) {
      GUXY.Sidebar.refresh();
    }
    
    GUXY.Toast?.show('卡片已添加到集合', 'success');
  },
  
  /**
   * 更新集合节点的显示（如卡片数量）
   * @param {string} collectionId - 集合ID
   * @param {object} collection - 集合数据
   */
  updateCollectionDisplay(collectionId, collection) {
    const element = this.nodeMap.get(collectionId);
    if (!element) return;
    
    // 更新卡片数量显示
    const metaEl = element.querySelector('.meta');
    if (metaEl) {
      metaEl.textContent = `${collection.children?.length || 0} 张卡片`;
    }
    
    // 如果集合使用CollectionNode组件，也更新其children显示
    if (GUXY.CollectionNode) {
      const body = element.querySelector('.collection-node-body');
      const emptyHint = body?.querySelector('.empty-hint');
      
      if (emptyHint && collection.children?.length > 0) {
        emptyHint.remove();
      }
      
      // 为每个新子卡片添加显示
      if (body && collection.children) {
        // 清空现有内容重新渲染
        const existingItems = body.querySelectorAll('.collection-item');
        existingItems.forEach(item => item.remove());
        
        collection.children.forEach(child => {
          const item = document.createElement('div');
          item.className = 'collection-item';
          item.dataset.childId = child.id;
          item.textContent = child.title;
          body.appendChild(item);
        });
      }
    }
  },
  
  /**
   * 销毁节点管理器
   */
  destroy() {
    this.clear();
    this.container = null;
    console.log('CanvasNodes destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.CanvasNodes;
}
