/**
 * GUXY子画布模块
 * 处理集合的独立画布视图，支持一级/二级/三级界面三块区域
 * 每区域内卡片纵向排列、横向居中，支持拖拽跨区域移动
 */

GUXY.SubCanvas = {
  currentCollectionId: null,
  isSubCanvasMode: false,
  
  /**
   * 打开集合子画布
   * @param {string} collectionId - 集合ID
   */
  open(collectionId) {
    this.currentCollectionId = collectionId;
    this.isSubCanvasMode = true;
    
    // 更新状态
    if (GUXY.State) {
      GUXY.State.canvasScope = 'collection';
      GUXY.State.canvasScopeId = collectionId;
      GUXY.State.saveToStorage();
    }
    
    // 渲染子画布
    this.render();
    
    // 添加返回按钮（一键AI改写、一键AI生成低保真已移至中岛台中间下方）
    this.addBackButton();
    
    // 聚焦到内容
    this.focusOnContent();

    // 子画布模式下中岛台显示「一键AI改写」「一键AI生成低保真」
    if (GUXY.CentralToolbar) GUXY.CentralToolbar.refresh();
    
    console.log('SubCanvas opened for collection:', collectionId);
  },
  
  /**
   * 关闭子画布，返回主画布
   */
  close() {
    // 移除区域容器
    if (GUXY.SubCanvasZones) {
      GUXY.SubCanvasZones.removeZoneContainers();
      GUXY.SubCanvasZones.clearHighlight();
    }
    this.currentCollectionId = null;
    this.isSubCanvasMode = false;
    
    // 更新状态
    if (GUXY.State) {
      GUXY.State.canvasScope = 'project';
      GUXY.State.canvasScopeId = null;
      GUXY.State.saveToStorage();
    }
    
    // 移除返回按钮（中岛台子画布按钮由 CentralToolbar.refresh 自动切换）
    this.removeBackButton();
    
    // 渲染主画布
    this.renderMainCanvas();

    // 恢复中岛台完整按钮
    if (GUXY.CentralToolbar) GUXY.CentralToolbar.refresh();
    
    console.log('SubCanvas closed');
  },
  
  /**
   * 渲染子画布
   */
  render() {
    console.log('[SubCanvas] render() called, collectionId:', this.currentCollectionId);

    if (!this.currentCollectionId || !GUXY.State?.currentProject?.architecture) {
      console.warn('[SubCanvas] Cannot render: missing collectionId or architecture');
      return;
    }

    const arch = GUXY.State.currentProject.architecture;
    const collection = arch.collections?.find(c => c.id === this.currentCollectionId);
    if (!collection) {
      console.warn('[SubCanvas] Collection not found:', this.currentCollectionId);
      return;
    }

    // 获取该集合下的卡片
    const cards = arch.cards?.filter(c => c.collection_id === this.currentCollectionId) || [];
    console.log('[SubCanvas] Found cards:', cards.length);

    // 按界面层级分组（三区域：一级/二级/三级界面，hint 放入三级）
    const getCardType = (c) => c.type || c.card_type || 'screen';
    const level1Cards = cards.filter(c => {
      const t = getCardType(c);
      if (t === 'hint') return false;
      return c.interface_level === 1 || (c.interface_level != 2 && c.interface_level != 3);
    });
    const level2Cards = cards.filter(c => getCardType(c) === 'screen' && c.interface_level === 2);
    const level3Cards = cards.filter(c => (getCardType(c) === 'screen' && c.interface_level === 3) || getCardType(c) === 'hint');

    console.log('[SubCanvas] Cards by level:', {
      level1: level1Cards.length,
      level2: level2Cards.length,
      level3: level3Cards.length
    });

    // 创建三块区域容器（一级/二级/三级界面）
    if (GUXY.SubCanvasZones) {
      const transformEl = document.getElementById('canvas-transform');
      const nodesEl = document.getElementById('nodes-container');
      if (transformEl && nodesEl) {
        GUXY.SubCanvasZones.createZoneContainers(transformEl, nodesEl);
      }
    }

    // 清空画布
    if (GUXY.CanvasNodes) {
      GUXY.CanvasNodes.clear();
      console.log('[SubCanvas] Canvas cleared');
    }
    if (GUXY.CanvasEdges) {
      GUXY.CanvasEdges.clear();
    }

    // 三区域布局：同一区域内卡片纵向排列、横向居中
    const ZONES = GUXY.SubCanvasZones
      ? (GUXY.SubCanvasZones.ZONE_ORIGINS || GUXY.SubCanvasZones.initOrigins())
      : { level1: { x: 20, y: 80 }, level2: { x: 300, y: 80 }, level3: { x: 580, y: 80 } };
    const ZONE_WIDTH = GUXY.SubCanvasZones?.ZONE_COLUMN_WIDTH || 280;
    const CARD_GAP = 60; // 卡片间距，避免重叠
    const DEFAULT_CARD_HEIGHT = 220; // 无低保真图时的卡片高度（含标题+正文区域+footer，避免与下张卡片重合）

    const addCardsInZone = (zoneCards, zoneKey) => {
      const origin = ZONES[zoneKey] || ZONES.level1;
      const cardWidth = 400; // 卡片宽度用于居中计算
      let currentY = origin.y;

      zoneCards.forEach((card, index) => {
        const x = origin.x + (ZONE_WIDTH - cardWidth) / 2;
        const hasLowFiImage = !!card.lowFiImage;
        // 有原型图时使用更大高度（header + 图片 + footer + padding）
        const cardHeight = hasLowFiImage ? 280 : DEFAULT_CARD_HEIGHT;
        
        GUXY.CanvasNodes.addNode({
          ...card,
          type: 'card',
          x: x,
          y: currentY
        });

        currentY += cardHeight + CARD_GAP;
      });
    };

    addCardsInZone(level1Cards, 'level1');
    addCardsInZone(level2Cards, 'level2');
    addCardsInZone(level3Cards, 'level3');

    console.log('[SubCanvas] Nodes added to canvas');

    // 渲染连线：一级右侧→二级左侧，二级右侧→三级左侧
    if (arch.cardLinks) {
      const getLevel = (card) => (card?.interface_level >= 1 && card?.interface_level <= 3) ? card.interface_level : 1;
      const collectionCardLinks = arch.cardLinks.filter(link => {
        const fromCard = cards.find(c => c.id === link.from_card_id);
        const toCard = cards.find(c => c.id === link.to_card_id);
        return fromCard && toCard;
      });

      console.log('[SubCanvas] Rendering edges:', collectionCardLinks.length);

      collectionCardLinks.forEach(link => {
        const fromCard = cards.find(c => c.id === link.from_card_id);
        const toCard = cards.find(c => c.id === link.to_card_id);
        const fromLevel = getLevel(fromCard);
        const toLevel = getLevel(toCard);
        const sourcePosition = fromLevel <= toLevel ? 'right' : 'left';
        const targetPosition = fromLevel <= toLevel ? 'left' : 'right';
        GUXY.CanvasEdges.addEdge({
          id: link.id,
          source: `card-${link.from_card_id}`,
          target: `card-${link.to_card_id}`,
          label: link.label || '',
          iconType: link.iconType || null,
          sourcePosition,
          targetPosition
        });
      });
    }

    // 添加区域标签
    this.addZoneLabels();

    console.log('[SubCanvas] Render complete');
  },
  
  /**
   * 添加区域标签（三块区域）
   */
  addZoneLabels() {
    const transformEl = document.getElementById('canvas-transform');
    if (!transformEl) return;
    
    // 移除旧的标签
    const oldLabels = transformEl.querySelectorAll('.zone-label');
    oldLabels.forEach(label => label.remove());
    
    const origins = GUXY.SubCanvasZones?.ZONE_ORIGINS || { level1: { x: 20 }, level2: { x: 300 }, level3: { x: 580 } };
    const zoneWidth = GUXY.SubCanvasZones?.ZONE_COLUMN_WIDTH || 280;
    const labels = [
      { text: '一级界面', x: origins.level1.x + (zoneWidth / 2) - 30, y: 60 },
      { text: '二级界面', x: origins.level2.x + (zoneWidth / 2) - 30, y: 60 },
      { text: '三级界面', x: origins.level3.x + (zoneWidth / 2) - 30, y: 60 }
    ];
    
    labels.forEach(label => {
      const labelEl = document.createElement('div');
      labelEl.className = 'zone-label';
      labelEl.textContent = label.text;
      labelEl.style.position = 'absolute';
      labelEl.style.left = `${label.x}px`;
      labelEl.style.top = `${label.y}px`;
      labelEl.style.fontSize = '12px';
      labelEl.style.fontWeight = '600';
      labelEl.style.color = 'var(--accent, #8b5cf6)';
      labelEl.style.opacity = '0.9';
      labelEl.style.textShadow = '0 0 8px rgba(0,0,0,0.5)';
      labelEl.style.pointerEvents = 'none';
      labelEl.style.zIndex = '10';
      transformEl.appendChild(labelEl);
    });
  },
  
  /**
   * 渲染主画布
   */
  renderMainCanvas() {
    // 移除区域容器和标签
    if (GUXY.SubCanvasZones) {
      GUXY.SubCanvasZones.removeZoneContainers();
      GUXY.SubCanvasZones.clearHighlight();
    }
    const canvasStage = document.getElementById('canvas-stage');
    if (canvasStage) {
      const labels = canvasStage.querySelectorAll('.zone-label');
      labels.forEach(label => label.remove());
    }

    // 使用 ArchitectureGen.applyToCanvas 重新渲染完整的主画布
    // 这样可以正确显示所有集合、卡片和连线
    if (GUXY.ArchitectureGen && GUXY.State?.currentProject?.architecture) {
      GUXY.ArchitectureGen.applyToCanvas(GUXY.State.currentProject.architecture);
      console.log('主画布已通过 applyToCanvas 重新渲染');
    }
  },
  
  /**
   * 添加返回按钮（固定在子画布左上角，红色醒目大按钮）
   */
  addBackButton() {
    // 先移除旧按钮
    this.removeBackButton();
    
    const canvasPage = document.getElementById('canvas-page');
    if (!canvasPage) return;
    
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-back-to-main-canvas';
    backBtn.textContent = '← 返回主画布';
    backBtn.style.cssText = `
      position: fixed;
      top: 80px;
      left: 12px;
      z-index: 1500;
      background: rgba(239, 68, 68, 0.45);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: #ffffff;
      border: 1px solid rgba(239, 68, 68, 0.5);
      font-size: 16px;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 9999px;
      cursor: pointer;
      letter-spacing: 0.03em;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      box-shadow: inset 0 0 24px rgba(239, 68, 68, 0.15), 0 2px 12px rgba(239, 68, 68, 0.25);
      transition: all 0.2s ease;
    `;
    backBtn.addEventListener('mouseenter', () => {
      backBtn.style.background = 'rgba(239, 68, 68, 0.58)';
      backBtn.style.borderColor = 'rgba(239, 68, 68, 0.65)';
      backBtn.style.boxShadow = 'inset 0 0 28px rgba(239, 68, 68, 0.2), 0 4px 20px rgba(239, 68, 68, 0.35)';
      backBtn.style.transform = 'translateY(-1px)';
    });
    backBtn.addEventListener('mouseleave', () => {
      backBtn.style.background = 'rgba(239, 68, 68, 0.45)';
      backBtn.style.borderColor = 'rgba(239, 68, 68, 0.5)';
      backBtn.style.boxShadow = 'inset 0 0 24px rgba(239, 68, 68, 0.15), 0 2px 12px rgba(239, 68, 68, 0.25)';
      backBtn.style.transform = 'translateY(0)';
    });
    backBtn.addEventListener('click', () => this.close());
    canvasPage.appendChild(backBtn);
  },
  
  /**
   * 移除返回按钮
   */
  removeBackButton() {
    const backBtn = document.querySelector('.btn-back-to-main-canvas');
    if (backBtn) {
      backBtn.remove();
    }
  },
  
  /**
   * 添加子画布「一键AI改写」按钮（旧逻辑，当前入口已迁移到中岛台，仅保留以备兼容）
   */
  addExpandAllButton() {
    this.removeExpandAllButton();
    const canvasPage = document.getElementById('canvas-page');
    if (!canvasPage) return;
    const expandBtn = document.createElement('button');
    expandBtn.className = 'btn btn-subcanvas-expand-all';
    expandBtn.textContent = '一键AI改写';
    expandBtn.title = '对本集合内所有卡片的描述进行改写，生成用于低保真的提示词';
    expandBtn.style.cssText = `
      position: fixed;
      top: 80px;
      left: 360px;
      z-index: 1500;
      background: rgba(255, 255, 14, 0.35);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: #1a1a1a;
      border: 1px solid rgba(255, 255, 14, 0.5);
      font-size: 14px;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 9999px;
      cursor: pointer;
      letter-spacing: 0.03em;
      box-shadow: inset 0 0 20px rgba(255, 255, 14, 0.12), 0 2px 10px rgba(255, 255, 14, 0.2);
      transition: all 0.2s ease;
    `;
    expandBtn.addEventListener('mouseenter', () => {
      if (expandBtn.disabled) return;
      expandBtn.style.background = 'rgba(255, 255, 14, 0.5)';
      expandBtn.style.boxShadow = 'inset 0 0 24px rgba(255, 255, 14, 0.18), 0 4px 14px rgba(255, 255, 14, 0.3)';
      expandBtn.style.transform = 'translateY(-1px)';
    });
    expandBtn.addEventListener('mouseleave', () => {
      expandBtn.style.background = 'rgba(255, 255, 14, 0.35)';
      expandBtn.style.boxShadow = 'inset 0 0 20px rgba(255, 255, 14, 0.12), 0 2px 10px rgba(255, 255, 14, 0.2)';
      expandBtn.style.transform = 'translateY(0)';
    });
    expandBtn.addEventListener('click', () => this.runExpandAll());
    canvasPage.appendChild(expandBtn);
  },
  
  /**
   * 移除一键改写按钮
   */
  removeExpandAllButton() {
    const btn = document.querySelector('.btn-subcanvas-expand-all');
    if (btn) btn.remove();
  },

  /**
   * 添加子画布「一键AI生成低保真」按钮
   */
  addGenerateLowFiAllButton() {
    this.removeGenerateLowFiAllButton();
    const canvasPage = document.getElementById('canvas-page');
    if (!canvasPage) return;
    
    const generateBtn = document.createElement('button');
    generateBtn.className = 'btn btn-subcanvas-generate-lowfi';
    generateBtn.textContent = '一键AI生成低保真';
    generateBtn.title = '为本集合内所有卡片批量生成低保真原型图';
    generateBtn.style.cssText = `
      position: fixed;
      top: 80px;
      left: 540px;
      z-index: 1500;
      background: rgba(147, 197, 253, 0.4);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: #ffffff;
      border: 1px solid rgba(147, 197, 253, 0.5);
      font-size: 14px;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 9999px;
      cursor: pointer;
      letter-spacing: 0.03em;
      box-shadow: 0 2px 10px rgba(147, 197, 253, 0.3);
      transition: all 0.2s ease;
    `;
    generateBtn.addEventListener('mouseenter', () => {
      if (generateBtn.disabled) return;
      generateBtn.style.background = 'rgba(147, 197, 253, 0.6)';
      generateBtn.style.transform = 'translateY(-1px)';
    });
    generateBtn.addEventListener('mouseleave', () => {
      generateBtn.style.background = 'rgba(147, 197, 253, 0.4)';
      generateBtn.style.transform = 'translateY(0)';
    });
    generateBtn.addEventListener('click', () => this.runGenerateLowFiAll());
    canvasPage.appendChild(generateBtn);
  },

  /**
   * 移除一键生成低保真按钮
   */
  removeGenerateLowFiAllButton() {
    const btn = document.querySelector('.btn-subcanvas-generate-lowfi');
    if (btn) btn.remove();
  },

  /**
   * 获取当前集合下所有卡片
   */
  getCurrentCollectionCards() {
    const arch = GUXY.State?.currentProject?.architecture;
    if (!arch || !this.currentCollectionId) return [];
    return arch.cards?.filter(c => (c.collection_id || c.collectionId) === this.currentCollectionId) || [];
  },
  
  /**
   * 获取画布上卡片节点元素（用于添加生成中动效）
   */
  getCardNodeElement(card) {
    if (!GUXY.CanvasNodes || !GUXY.CanvasNodes.nodeMap) return null;
    const rawId = (card.id || '').replace(/^card-/, '');
    const fullId = rawId.startsWith('card-') ? rawId : 'card-' + rawId;
    return GUXY.CanvasNodes.nodeMap.get(fullId) || null;
  },
  
  /**
   * 子画布一键改写：逐卡调用 AI，改写时卡片显示生成中白光动效
   */
  async runExpandAll() {
    if (!GUXY.ApiConfig?.isConfigured?.()) {
      GUXY.Toast?.show('请先在侧栏配置 API 后再使用', 'error');
      if (GUXY.ApiConfig?.showConfigModal) GUXY.ApiConfig.showConfigModal();
      return;
    }
    const cards = this.getCurrentCollectionCards();
    if (!cards.length) {
      GUXY.Toast?.show('当前集合下没有卡片', 'warning');
      return;
    }
    const expandBtn = document.querySelector('.btn-subcanvas-expand-all');
    if (expandBtn) {
      expandBtn.disabled = true;
      expandBtn.textContent = `改写中 0/${cards.length}`;
    }
    const arch = GUXY.State.currentProject.architecture;
    let done = 0;
    let failed = 0;
    for (const card of cards) {
      const nodeEl = this.getCardNodeElement(card);
      if (nodeEl) nodeEl.classList.add('card-node--expanding');
      const newDesc = await (GUXY.NodeDetailSidebar.expandCardDescriptionWithAI(card, arch) || Promise.resolve(null));
      if (nodeEl) nodeEl.classList.remove('card-node--expanding');
      if (newDesc) {
        card.body = newDesc;
        card.description = newDesc;
        if (GUXY.State?.currentProject?.architecture) {
          const cardIdNorm = (card.id || '').replace(/^card-/, '');
          const idx = GUXY.State.currentProject.architecture.cards?.findIndex(c => (c.id || '').replace(/^card-/, '') === cardIdNorm);
          if (idx !== undefined && idx >= 0) {
            GUXY.State.currentProject.architecture.cards[idx].body = newDesc;
            GUXY.State.currentProject.architecture.cards[idx].description = newDesc;
          }
          GUXY.State.saveToStorage();
        }
        if (GUXY.CanvasNodes) {
          const fullId = (card.id || '').startsWith('card-') ? card.id : 'card-' + (card.id || '');
          GUXY.CanvasNodes.updateNode(fullId, { description: newDesc });
        }
        done++;
      } else {
        failed++;
      }
      if (expandBtn) expandBtn.textContent = `改写中 ${done + failed}/${cards.length}`;
    }
    if (expandBtn) {
      expandBtn.disabled = false;
      expandBtn.textContent = '一键AI改写';
    }
    if (failed > 0) {
      GUXY.Toast?.show(`已改写 ${done} 张，失败 ${failed} 张`, failed === cards.length ? 'error' : 'success');
    } else {
      GUXY.Toast?.show(`已为 ${done} 张卡片完成改写`, 'success');
    }
  },

  /**
   * 子画布一键生成低保真：逐卡调用LowFiGeneration，生成中显示动效
   */
  async runGenerateLowFiAll() {
    if (!GUXY.LowFiGeneration?.isImageModelConfigured?.()) {
      GUXY.Toast?.show('请先配置生图模型API', 'error');
      return;
    }
    
    const cards = this.getCurrentCollectionCards();
    if (!cards.length) {
      GUXY.Toast?.show('当前集合下没有卡片', 'warning');
      return;
    }
    
    const generateBtn = document.querySelector('.btn-subcanvas-generate-lowfi');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.textContent = `生成中 0/${cards.length}`;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const card of cards) {
      try {
        const cardId = card.id.startsWith('card-') ? card.id : `card-${card.id}`;
        const nodeEl = this.getCardNodeElement(card);
        if (nodeEl) {
          nodeEl.classList.add('card-node--generating-lowfi');
        }
        
        await GUXY.LowFiGeneration.generateForCard(cardId);
        successCount++;
        
        if (nodeEl) {
          nodeEl.classList.remove('card-node--generating-lowfi');
        }
        
        if (generateBtn) {
          generateBtn.textContent = `生成中 ${successCount}/${cards.length}`;
        }
      } catch (err) {
        console.error(`卡片 ${card.title} 生成失败:`, err);
        failCount++;
        const nodeEl = this.getCardNodeElement(card);
        if (nodeEl) {
          nodeEl.classList.remove('card-node--generating-lowfi');
        }
      }
    }
    
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.textContent = '一键AI生成低保真';
    }
    
    GUXY.Toast?.show(`批量生成完成：成功 ${successCount} 张，失败 ${failCount} 张`, successCount > 0 ? 'success' : 'error');
  },

  /**
   * 聚焦到内容
   */
  focusOnContent() {
    setTimeout(() => {
      if (GUXY.ZoomPan) {
        GUXY.ZoomPan.centerView();
      }
    }, 100);
  },
  
  /**
   * 初始化
   */
  init() {
    // 监听ESC键返回主画布
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isSubCanvasMode) {
        this.close();
      }
    });
    
    // 监听双击集合节点
    document.addEventListener('dblclick', (e) => {
      const node = e.target.closest('.collection-node');
      if (node) {
        const collectionId = node.dataset.id?.replace('collection-', '');
        if (collectionId) {
          this.open(collectionId);
        }
      }
    });
    
    console.log('SubCanvas initialized');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.SubCanvas;
}
