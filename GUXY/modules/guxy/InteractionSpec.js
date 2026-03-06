/**
 * GUXY 交互规范检查模块
 * 基于当前架构做本地静态规则检查
 */

GUXY.InteractionSpec = {
  /**
   * 对当前项目运行交互规范检查
   * @returns {object|null} 检查报告
   */
  runOnCurrentProject() {
    const project = GUXY.State?.currentProject;
    if (!project) {
      GUXY.Toast?.show('请先选择项目', 'warning');
      return null;
    }
    if (!project.architecture) {
      GUXY.Toast?.show('暂无架构数据，无法进行交互规范检查', 'warning');
      return null;
    }

    const report = this.checkArchitecture(project.architecture);

    // 将结果挂到项目上，便于后续自检使用
    GUXY.State.updateProject(project.id, {
      interactionSpecReport: report
    });

    // 使用 Modal 展示结果
    this.showReport(report);

    return report;
  },

  /**
   * 对架构执行静态规则检查
   * @param {object} architecture
   * @returns {object} 报告
   */
  checkArchitecture(architecture) {
    const errors = [];
    const warnings = [];

    const collections = architecture.collections || [];
    const cards = architecture.cards || [];
    const edges = architecture.edges || [];

    // 规则1：所有节点必须有名称
    collections.forEach((c) => {
      if (!c.title || !c.title.trim()) {
        errors.push({
          code: 'MISSING_COLLECTION_TITLE',
          message: `集合节点缺少名称 (id: ${c.id})`
        });
      }
    });
    cards.forEach((card) => {
      if (!card.title || !card.title.trim()) {
        errors.push({
          code: 'MISSING_CARD_TITLE',
          message: `卡片节点缺少标题 (id: ${card.id})`
        });
      }
    });

    // 规则2：界面层级（interface_level）必须在 1~3 之间
    cards.forEach((card) => {
      if (
        card.interface_level !== undefined &&
        (card.interface_level < 1 || card.interface_level > 3)
      ) {
        warnings.push({
          code: 'INTERFACE_LEVEL_OUT_OF_RANGE',
          message: `卡片 ${card.title || card.id} 的 interface_level=${card.interface_level} 不在 1~3 之间`
        });
      }
    });

    // 规则3：检查孤立节点（没有任何连线）
    const connectedIds = new Set();
    edges.forEach((e) => {
      if (e.source) connectedIds.add(e.source);
      if (e.target) connectedIds.add(e.target);
    });

    const allNodeIds = [
      ...collections.map((c) => ({ id: c.id, title: c.title, type: 'collection' })),
      ...cards.map((c) => ({ id: c.id, title: c.title, type: 'card' }))
    ];

    allNodeIds.forEach((node) => {
      if (!connectedIds.has(node.id)) {
        warnings.push({
          code: 'ISOLATED_NODE',
          message: `${node.type === 'collection' ? '集合' : '卡片'} ${
            node.title || node.id
          } 没有任何连线，可能是孤立节点`
        });
      }
    });

    // 规则4：集合包含的子卡片数量过多时提示拆分
    collections.forEach((c) => {
      const childCount = c.children?.length || 0;
      if (childCount > 20) {
        warnings.push({
          code: 'COLLECTION_TOO_LARGE',
          message: `集合 ${c.title || c.id} 包含 ${childCount} 张卡片，建议拆分为多个集合`
        });
      }
    });

    // ---- 新增规则：流程闭环 / 重叠界面 / 连线合理性 ----

    // 构建 cardId -> card、节点ID -> card 映射，兼容是否带前缀的情况
    const cardMap = new Map();
    const nodeIdToCard = new Map();

    const getCardNodeIds = (card) => {
      const ids = [];
      if (card.id) ids.push(card.id);
      if (card.id && !String(card.id).startsWith('card-')) {
        ids.push(`card-${card.id}`);
      }
      return ids;
    };

    cards.forEach((card) => {
      if (!card.id) return;
      cardMap.set(card.id, card);
      const nodeIds = getCardNodeIds(card);
      nodeIds.forEach((nid) => {
        nodeIdToCard.set(nid, card);
      });
    });

    // 构建有向图邻接表
    const adjacency = new Map();
    const outDegree = new Map();
    edges.forEach((e) => {
      if (!e.source || !e.target) return;
      if (!adjacency.has(e.source)) adjacency.set(e.source, new Set());
      adjacency.get(e.source).add(e.target);
      outDegree.set(e.source, (outDegree.get(e.source) || 0) + 1);
    });

    // 辅助函数：从指定起点集合做可达性分析（仅限同一集合内的卡片）
    const computeReachableCards = (startCards) => {
      const reachable = new Set();
      const visitedNodes = new Set();
      const queue = [];

      startCards.forEach((card) => {
        const nodeIds = getCardNodeIds(card);
        nodeIds.forEach((nid) => {
          queue.push(nid);
          visitedNodes.add(nid);
        });
        reachable.add(card.id);
      });

      while (queue.length) {
        const nodeId = queue.shift();
        const neighbors = adjacency.get(nodeId);
        if (!neighbors) continue;
        neighbors.forEach((nextId) => {
          if (visitedNodes.has(nextId)) return;
          visitedNodes.add(nextId);
          queue.push(nextId);
          const targetCard = nodeIdToCard.get(nextId);
          if (targetCard) {
            reachable.add(targetCard.id);
          }
        });
      }

      return reachable;
    };

    // 规则5：流程闭环检查 —— 所有二/三级界面须可从至少一个一级界面到达
    const level1Cards = cards.filter((c) => c.interface_level === 1);
    if (level1Cards.length) {
      const reachableFromAnyL1 = computeReachableCards(level1Cards);

      cards.forEach((card) => {
        if (card.interface_level === 2 || card.interface_level === 3) {
          if (!reachableFromAnyL1.has(card.id)) {
            warnings.push({
              code: 'UNREACHABLE_FROM_LEVEL1',
              message: `界面 ${card.title || card.id} (level=${card.interface_level}) 无法从任何一级界面到达，可能导致流程不闭环`,
              nodeId: card.id
            });
          }
        }
      });
    }

    // 规则6：三级界面必须具备返回/退出路径（至少存在一条外向连线指向非三级界面）
    const level3Cards = cards.filter((c) => c.interface_level === 3);
    level3Cards.forEach((card) => {
      const nodeIds = getCardNodeIds(card);
      let hasReturn = false;

      nodeIds.forEach((nid) => {
        const neighbors = adjacency.get(nid);
        if (!neighbors) return;
        neighbors.forEach((toId) => {
          const targetCard = nodeIdToCard.get(toId);
          if (!targetCard) return;
          if (
            targetCard.interface_level === 1 ||
            targetCard.interface_level === 2
          ) {
            hasReturn = true;
          }
        });
      });

      if (!hasReturn) {
        warnings.push({
          code: 'LEVEL3_NO_RETURN',
          message: `三级界面 ${card.title || card.id} 没有发现返回/退出路径，可能导致用户被困在此界面`,
          nodeId: card.id
        });
      }
    });

    // 规则7：界面重叠与重复检查（同集合 + 同层级 + 相同标题）
    const duplicateKeyMap = new Map();
    cards.forEach((card) => {
      const level = card.interface_level || 0;
      const title = (card.title || '').trim();
      const colId = card.collection_id || '';
      if (!title) return;
      const key = `${colId}::${level}::${title}`;
      if (!duplicateKeyMap.has(key)) {
        duplicateKeyMap.set(key, []);
      }
      duplicateKeyMap.get(key).push(card);
    });

    duplicateKeyMap.forEach((group) => {
      if (group.length > 1) {
        const names = group.map((c) => c.title || c.id).join('，');
        warnings.push({
          code: 'DUPLICATE_SCREEN',
          message: `同一系统/层级下存在疑似重复界面：${names}，建议合并为单一界面并通过状态区分`,
          nodeIds: group.map((c) => c.id)
        });
      }
    });

    // 规则8：连线合理性检查 —— 检查 1→3 的跨级跳转与孤立终点
    const cardByNodeId = nodeIdToCard;
    edges.forEach((edge) => {
      const fromCard = cardByNodeId.get(edge.source);
      const toCard = cardByNodeId.get(edge.target);

      // 1→3 跨级跳转提示
      if (
        fromCard &&
        toCard &&
        fromCard.interface_level === 1 &&
        toCard.interface_level === 3
      ) {
        warnings.push({
          code: 'CROSS_LEVEL_JUMP_1_TO_3',
          message: `连线 ${fromCard.title || fromCard.id} (L1) → ${
            toCard.title || toCard.id
          } (L3) 为跨级跳转，建议通过二级界面过渡或在文档中明确此为特例设计`,
          edgeId: edge.id
        });
      }

      // 连线引用不存在的节点
      if (!fromCard && !collections.find((c) => c.id === edge.source)) {
        errors.push({
          code: 'EDGE_SOURCE_NOT_FOUND',
          message: `连线源节点不存在: ${edge.source}`,
          edgeId: edge.id
        });
      }
      if (!toCard && !collections.find((c) => c.id === edge.target)) {
        errors.push({
          code: 'EDGE_TARGET_NOT_FOUND',
          message: `连线目标节点不存在: ${edge.target}`,
          edgeId: edge.id
        });
      }
    });

    // 简单评分：从 100 分开始，每个错误 -10，每个警告 -3
    let score = 100 - errors.length * 10 - warnings.length * 3;
    score = Math.max(0, Math.min(100, score));

    return {
      generatedAt: new Date().toISOString(),
      score,
      errors,
      warnings,
      stats: {
        collections: collections.length,
        cards: cards.length,
        edges: edges.length
      }
    };
  },

  /**
   * 使用 Modal 展示检查报告
   * @param {object} report
   */
  showReport(report) {
    if (!report) return;
    if (!GUXY.Modal) {
      console.warn('Modal module not available');
      return;
    }

    const { score, errors, warnings, stats } = report;

    const html = `
      <div class="interaction-spec-report">
        <p><strong>综合得分:</strong> ${score} / 100</p>
        <p><strong>节点统计:</strong> 集合 ${stats.collections} · 卡片 ${stats.cards} · 连线 ${stats.edges}</p>
        <hr />
        <h4>严重问题 (${errors.length})</h4>
        <ul>
          ${
            errors.length
              ? errors
                  .map(
                    (e) =>
                      `<li>[${e.code}] ${GUXY.Utils.escapeHtml?.(e.message) || e.message}</li>`
                  )
                  .join('')
              : '<li>未发现严重问题</li>'
          }
        </ul>
        <h4>建议优化 (${warnings.length})</h4>
        <ul>
          ${
            warnings.length
              ? warnings
                  .map(
                    (w) =>
                      `<li>[${w.code}] ${GUXY.Utils.escapeHtml?.(w.message) || w.message}</li>`
                  )
                  .join('')
              : '<li>暂无需要特别关注的建议</li>'
          }
        </ul>
      </div>
    `;

    GUXY.Modal.show('交互规范检查结果', html);
  }
};

// Node 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.InteractionSpec;
}

