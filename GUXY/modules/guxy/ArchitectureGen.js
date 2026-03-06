/**
 * GUXY 架构生成模块
 * 基于AI生成的架构JSON数据渲染到画布
 */

GUXY.ArchitectureGen = {
  /**
   * 从架构JSON数据渲染到画布
   * @param {object} architecture - 架构JSON数据
   * @returns {object} 渲染后的架构数据
   */
  applyArchitecture(architecture) {
    const project = GUXY.State?.currentProject;
    if (!project) {
      GUXY.Toast?.show('请先创建并选择项目', 'warning');
      throw new Error('No current project');
    }

    if (!architecture || (!architecture.collections && !architecture.cards)) {
      GUXY.Toast?.show('没有可用的架构数据', 'warning');
      throw new Error('No architecture data');
    }

    // 保存到项目
    GUXY.State.updateProject(project.id, {
      architecture
    });

    // 同步到Workflow步骤②并标记完成
    if (GUXY.Workflow) {
      GUXY.Workflow.saveStepData(2, {
        generatedAt: new Date().toISOString(),
        nodeCounts: {
          collections: architecture.collections?.length || 0,
          cards: architecture.cards?.length || 0,
          edges: architecture.edges?.length || 0
        }
      });
      GUXY.Workflow.completeStep(2);
    }

    // 应用到画布
    this.applyToCanvas(architecture);

    return architecture;
  },

  /**
   * 从分析结果生成架构（兼容旧版方法）
   * @param {object} analysis - AIAnalysis返回的标准化数据
   * @returns {object} 架构JSON
   */
  generateFromAnalysis(analysis) {
    // 如果analysis已经是架构格式，直接使用
    if (analysis.collections || analysis.cards) {
      return this.applyArchitecture(analysis);
    }

    const project = GUXY.State?.currentProject;
    if (!project) {
      GUXY.Toast?.show('请先创建并选择项目', 'warning');
      throw new Error('No current project');
    }

    const data =
      analysis ||
      project.analysis ||
      GUXY.Workflow?.getStepData(1)?.analysis;

    if (!data) {
      GUXY.Toast?.show('没有可用的分析结果，请先完成步骤①', 'warning');
      throw new Error('No analysis data');
    }

    const modules = Array.isArray(data.modules) ? data.modules : [];

    // 布局参数
    const colWidth = GUXY.Constants?.LAYOUT?.COLLECTION_WIDTH || 300;
    const colHeight = GUXY.Constants?.LAYOUT?.COLLECTION_HEIGHT || 200;
    const nodeWidth = GUXY.Constants?.LAYOUT?.DEFAULT_NODE_WIDTH || 240;
    const hGap = 80;
    const vGap = 80;

    const collections = [];
    const cards = [];
    const edges = [];

    modules.forEach((mod, index) => {
      const colId = mod.id || `col-${GUXY.Utils.uid()}`;
      const colX = index * (colWidth + hGap);
      const colY = 0;

      const collection = {
        id: colId,
        title: mod.name || mod.title || `模块 ${index + 1}`,
        type: mod.type || 'system',
        description: mod.description || '',
        x: colX,
        y: colY,
        children: []
      };
      collections.push(collection);

      // 从模块中抽取卡片；兼容多种字段
      const moduleCards =
        mod.screens || mod.cards || mod.features || [];

      if (!Array.isArray(moduleCards) || moduleCards.length === 0) {
        // 至少为模块本身生成 1 张卡片
        const cardId = `card-${GUXY.Utils.uid()}`;
        const card = {
          id: cardId,
          title: collection.title,
          description: collection.description || '根据策划案自动生成的功能卡片',
          type: 'ui',
          interface_level: 1,
          collection_id: colId,
          x: colX + (colWidth - nodeWidth) / 2,
          y: colY + colHeight + vGap
        };
        cards.push(card);
        collection.children.push({ id: cardId, title: card.title });
      } else {
        moduleCards.forEach((mc, idx) => {
          const cardId = mc.id || `card-${GUXY.Utils.uid()}`;
          const card = {
            id: cardId,
            title: mc.name || mc.title || `界面 ${idx + 1}`,
            description: mc.description || '',
            type: mc.type || 'ui',
            interface_level: mc.interface_level || 2,
            collection_id: colId,
            x: colX + (idx % 2) * (nodeWidth + hGap),
            y:
              colY +
              colHeight +
              vGap +
              Math.floor(idx / 2) * (nodeWidth + vGap / 2)
          };
          cards.push(card);
          collection.children.push({ id: cardId, title: card.title });
        });
      }
    });

    // 构建名称->ID映射，用于匹配 AI 连线数据
    const nameToIdMap = new Map();
    cards.forEach(card => {
      nameToIdMap.set(card.title, card.id);
    });
    collections.forEach(col => {
      nameToIdMap.set(col.title, col.id);
    });

    // 辅助：判断 ID 是否属于集合
    const collectionIdSet = new Set(collections.map(c => c.id));
    const getNodeType = (id) => collectionIdSet.has(id) ? 'collection' : 'card';

    // 连线分类数组
    const cardLinks = [];
    const collectionLinks = [];
    const cardCollectionLinks = [];

    // 去重集合：source|target
    const edgeKeySet = new Set();

    /**
     * 添加一条连线到 edges 和对应分类数组
     */
    const addEdge = (sourceId, targetId, label, edgeType) => {
      const key = `${sourceId}|${targetId}`;
      if (edgeKeySet.has(key)) return; // 去重
      edgeKeySet.add(key);

      const sourceType = getNodeType(sourceId);
      const targetType = getNodeType(targetId);

      const edgeId = `edge-${GUXY.Utils.uid()}`;
      edges.push({
        id: edgeId,
        source: sourceId,
        target: targetId,
        sourceType,
        targetType,
        label: label || '',
        type: edgeType || 'default'
      });

      // 根据类型填充分类数组
      if (sourceType === 'card' && targetType === 'card') {
        cardLinks.push({
          id: edgeId,
          from_card_id: sourceId.replace('card-', ''),
          to_card_id: targetId.replace('card-', ''),
          label: label || '',
          iconType: null
        });
      } else if (sourceType === 'collection' && targetType === 'collection') {
        collectionLinks.push({
          id: edgeId,
          from_collection_id: sourceId.replace('collection-', ''),
          to_collection_id: targetId.replace('collection-', ''),
          label: label || '',
          iconType: null
        });
      } else {
        cardCollectionLinks.push({
          id: edgeId,
          from_card_id: sourceType === 'card' ? sourceId.replace('card-', '') : null,
          from_collection_id: sourceType === 'collection' ? sourceId.replace('collection-', '') : null,
          to_card_id: targetType === 'card' ? targetId.replace('card-', '') : null,
          to_collection_id: targetType === 'collection' ? targetId.replace('collection-', '') : null,
          label: label || '',
          iconType: null
        });
      }
    };

    // 1) 根据用户流程补充连线
    const flows = Array.isArray(data.userFlows) ? data.userFlows : [];
    flows.forEach((flow) => {
      const steps = Array.isArray(flow.steps) ? flow.steps : [];
      for (let i = 0; i < steps.length - 1; i++) {
        const fromId = steps[i].cardId || steps[i].id;
        const toId = steps[i + 1].cardId || steps[i + 1].id;
        if (!fromId || !toId || fromId === toId) continue;
        const label = steps[i + 1].action || '';
        addEdge(fromId, toId, label, 'default');
      }
    });

    // 2) 根据 AI 分析的连线数据补充
    const aiConnections = Array.isArray(data.connections) ? data.connections : [];
    aiConnections.forEach((conn) => {
      const fromId = nameToIdMap.get(conn.from);
      const toId = nameToIdMap.get(conn.to);
      if (!fromId || !toId || fromId === toId) return;
      addEdge(fromId, toId, conn.label || '', conn.type || 'navigate');
    });

    const architecture = {
      version: '1.0.0',
      collections,
      cards,
      edges,
      cardLinks,
      collectionLinks,
      cardCollectionLinks
    };

    // 保存到项目与状态
    GUXY.State.updateProject(project.id, {
      architecture
    });

    // 同步到 Workflow 步骤②并标记完成
    if (GUXY.Workflow) {
      GUXY.Workflow.saveStepData(2, {
        generatedAt: new Date().toISOString(),
        nodeCounts: {
          collections: collections.length,
          cards: cards.length,
          edges: edges.length
        }
      });
      GUXY.Workflow.completeStep(2);
    }

    return architecture;
  },

  /**
   * 将架构渲染到画布
   * @param {object} architecture - 架构 JSON
   */
  applyToCanvas(architecture) {
    const arch =
      architecture || GUXY.State?.currentProject?.architecture;

    if (!arch) {
      GUXY.Toast?.show('暂无架构数据', 'warning');
      return;
    }

    if (!GUXY.CanvasStage || !GUXY.CanvasNodes || !GUXY.CanvasEdges) {
      console.warn('Canvas modules not ready');
      return;
    }

    // 清空现有画布
    GUXY.CanvasStage.clear();
    GUXY.CanvasNodes.clear();
    GUXY.CanvasEdges.clear();

    // 重新定义SVG箭头标记（CanvasStage.clear()会清空SVG的innerHTML包括defs）
    if (GUXY.CanvasEdges.defineMarkers) {
      GUXY.CanvasEdges.defineMarkers();
    }

    const container = GUXY.CanvasStage.nodesContainer || GUXY.CanvasNodes.container;
    if (!container) return;

    // 为没有位置信息的节点计算自动布局参数
    const colWidth = GUXY.Constants?.LAYOUT?.COLLECTION_WIDTH || 300;
    const colHeight = GUXY.Constants?.LAYOUT?.COLLECTION_HEIGHT || 200;
    const nodeWidth = GUXY.Constants?.LAYOUT?.DEFAULT_NODE_WIDTH || 240;
    const hGap = 80;
    const vGap = 80;

    const positions = new Map();

    // 渲染集合节点
    (arch.collections || []).forEach((col, index) => {
      // 如果没有位置信息，自动计算布局
      if (col.x === undefined && col.y === undefined) {
        col.x = index * (colWidth + hGap);
        col.y = 0;
      }

      const element = GUXY.CollectionNode
        ? GUXY.CollectionNode.create(col)
        : GUXY.CanvasNodes.addNode({
            id: col.id,
            type: 'collection',
            title: col.title,
            description: col.description,
            x: col.x,
            y: col.y
          });

      if (element) {
        container.appendChild(element);
        // 确保使用带前缀的完整ID（CollectionNode.create设置的可能是裸ID）
        const fullId = (element.dataset.id && element.dataset.id.startsWith('collection-'))
          ? element.dataset.id
          : `collection-${col.id}`;
        element.dataset.id = fullId;
        GUXY.CanvasNodes.nodeMap.set(fullId, element);
        // 同时用裸ID注册，兼容不同格式的连线引用
        if (fullId !== col.id) {
          GUXY.CanvasNodes.nodeMap.set(col.id, element);
        }
        // 绑定拖拽事件（CollectionNode.create 只创建DOM，不绑定交互）
        if (GUXY.CanvasNodes.attachDragEvents) {
          GUXY.CanvasNodes.attachDragEvents(element, col);
        }
        const pos = { x: col.x || 0, y: col.y || 0 };
        positions.set(fullId, pos);
        if (fullId !== col.id) {
          positions.set(col.id, pos);
        }
      }
    });

    // 渲染卡片节点（主画布仅显示不属于任何集合的独立卡片，集合内卡片在子画布中显示）
    const mainCanvasCards = (arch.cards || []).filter(card => !card.collection_id);
    mainCanvasCards.forEach((card, index) => {
      // 如果没有位置信息，自动计算布局
      if (card.x === undefined && card.y === undefined) {
        card.x = index * (nodeWidth + hGap);
        card.y = colHeight + vGap * 2;
      }

      const element = GUXY.CardNode
        ? GUXY.CardNode.create(card)
        : GUXY.CanvasNodes.addNode({
            id: card.id,
            type: card.type || 'card',
            title: card.title,
            description: card.description,
            x: card.x,
            y: card.y
          });

      if (element) {
        container.appendChild(element);
        // 确保使用带前缀的完整ID（CardNode.create设置的可能是裸ID）
        const fullId = (element.dataset.id && element.dataset.id.startsWith('card-'))
          ? element.dataset.id
          : `card-${card.id}`;
        element.dataset.id = fullId;
        // 更新元素位置（确保与计算的位置一致）
        element.dataset.x = card.x || 0;
        element.dataset.y = card.y || 0;
        element.style.left = `${card.x || 0}px`;
        element.style.top = `${card.y || 0}px`;
        GUXY.CanvasNodes.nodeMap.set(fullId, element);
        // 同时用裸ID注册，兼容不同格式的连线引用
        if (fullId !== card.id) {
          GUXY.CanvasNodes.nodeMap.set(card.id, element);
        }
        // 绑定拖拽事件（CardNode.create 只创建DOM，不绑定交互）
        if (GUXY.CanvasNodes.attachDragEvents) {
          GUXY.CanvasNodes.attachDragEvents(element, card);
        }
        const pos = { x: card.x || 0, y: card.y || 0 };
        positions.set(fullId, pos);
        if (fullId !== card.id) {
          positions.set(card.id, pos);
        }
      }
    });

    // 辅助函数：安全地添加前缀，避免重复拼接
    const ensureCardId = (id) => {
      if (!id) return null;
      return id.startsWith('card-') ? id : `card-${id}`;
    };
    const ensureCollectionId = (id) => {
      if (!id) return null;
      return id.startsWith('collection-') ? id : `collection-${id}`;
    };

    // 渲染连线 - 支持新的edges格式和旧的cardLinks/collectionLinks格式
    if (arch.edges && arch.edges.length && GUXY.CanvasEdges) {
      GUXY.CanvasEdges.addEdges(arch.edges, positions);
    } else if ((arch.cardLinks || arch.collectionLinks || arch.cardCollectionLinks) && GUXY.CanvasEdges) {
      // 从cardLinks/collectionLinks格式转换为edges格式
      const convertedEdges = [];

      (arch.cardLinks || []).forEach(link => {
        convertedEdges.push({
          id: link.id,
          source: ensureCardId(link.from_card_id),
          target: ensureCardId(link.to_card_id),
          sourceType: 'card',
          targetType: 'card',
          label: link.label || '',
          type: 'default'
        });
      });

      (arch.collectionLinks || []).forEach(link => {
        convertedEdges.push({
          id: link.id,
          source: ensureCollectionId(link.from_collection_id),
          target: ensureCollectionId(link.to_collection_id),
          sourceType: 'collection',
          targetType: 'collection',
          label: link.label || '',
          type: 'default'
        });
      });

      (arch.cardCollectionLinks || []).forEach(link => {
        const fromId = link.from_card_id ? ensureCardId(link.from_card_id) : null;
        const toId = link.to_card_id ? ensureCardId(link.to_card_id) : null;
        const fromColId = link.from_collection_id ? ensureCollectionId(link.from_collection_id) : null;
        const toColId = link.to_collection_id ? ensureCollectionId(link.to_collection_id) : null;

        if (fromId && toColId) {
          convertedEdges.push({
            id: link.id,
            source: fromId,
            target: toColId,
            sourceType: 'card',
            targetType: 'collection',
            label: link.label || '',
            type: 'default'
          });
        } else if (fromColId && toId) {
          convertedEdges.push({
            id: link.id,
            source: fromColId,
            target: toId,
            sourceType: 'collection',
            targetType: 'card',
            label: link.label || '',
            type: 'default'
          });
        }
      });

      console.log('[applyToCanvas] Converted edges:', convertedEdges.length);
      GUXY.CanvasEdges.addEdges(convertedEdges, positions);
    }

    // 更新侧栏统计
    if (GUXY.Sidebar) {
      GUXY.Sidebar.refresh();
    }
  }
};

// Node 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.ArchitectureGen;
}

