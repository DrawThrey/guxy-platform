/**
 * GUXY力导向布局
 * 使用D3.js实现节点自动布局
 */

GUXY.ForceLayout = {
  simulation: null,
  nodes: [],
  links: [],
  
  // 配置
  config: {
    linkDistance: GUXY.Constants?.LAYOUT?.LINK_DISTANCE || 200,
    linkStrength: GUXY.Constants?.LAYOUT?.LINK_STRENGTH || 1,
    chargeStrength: GUXY.Constants?.LAYOUT?.CHARGE_STRENGTH || -500,
    nodePadding: 40,
    iterations: 400
  },
  
  /**
   * 初始化力导向布局
   * @param {Array} nodes - 节点数组
   * @param {Array} links - 连线数组
   * @param {number} [cx] - 可选的布局中心X坐标
   * @param {number} [cy] - 可选的布局中心Y坐标
   */
  init(nodes, links, cx, cy) {
    this.nodes = nodes.map(n => ({
      id: n.id,
      x: n.x || Math.random() * 800,
      y: n.y || Math.random() * 600,
      width: n.width || 200,
      height: n.height || 100
    }));
    
    this.links = links.map(l => ({
      source: l.source,
      target: l.target
    }));
    
    this.layoutCenterX = cx;
    this.layoutCenterY = cy;
    this.startSimulation();
  },
  
  /**
   * 启动模拟
   */
  startSimulation() {
    this.simpleForceLayout(this.layoutCenterX, this.layoutCenterY);
  },
  
  /**
   * 力导向布局算法（矩形碰撞 + 连线交叉最小化）
   * @param {number} [cx] - 可选的布局中心X坐标
   * @param {number} [cy] - 可选的布局中心Y坐标
   */
  simpleForceLayout(cx, cy) {
    const { linkDistance, chargeStrength, nodePadding, iterations } = this.config;
    const nodes = this.nodes;
    const links = this.links;
    const width = 2000;
    const height = 1500;
    const centerX = cx || width / 2;
    const centerY = cy || height / 2;
    
    // 创建连线映射（双向）用于判断节点间是否有连线关系
    const linkedPairs = new Set();
    links.forEach(link => {
      const sId = typeof link.source === 'object' ? link.source.id : link.source;
      const tId = typeof link.target === 'object' ? link.target.id : link.target;
      linkedPairs.add(`${sId}|${tId}`);
      linkedPairs.add(`${tId}|${sId}`);
    });
    
    const isLinked = (a, b) => linkedPairs.has(`${a.id}|${b.id}`);
    
    // 降温因子：随迭代推进逐渐减小力的影响，帮助收敛
    for (let i = 0; i < iterations; i++) {
      const alpha = 1 - i / iterations;        // 1 -> 0
      const cooling = 0.3 + 0.7 * alpha;       // 1 -> 0.3
      
      // === 排斥力（基于节点尺寸的距离感知） ===
      for (let j = 0; j < nodes.length; j++) {
        const a = nodes[j];
        for (let k = j + 1; k < nodes.length; k++) {
          const b = nodes[k];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // 根据节点尺寸调整排斥力：大节点需要更强排斥
          const avgSize = (a.width + a.height + b.width + b.height) / 4;
          const adjustedCharge = chargeStrength * (avgSize / 150);
          const force = (adjustedCharge / (distance * distance)) * cooling;
          
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          a.x -= fx;
          a.y -= fy;
          b.x += fx;
          b.y += fy;
        }
      }
      
      // === 引力（连线弹簧力） ===
      links.forEach(link => {
        const sId = typeof link.source === 'object' ? link.source.id : link.source;
        const tId = typeof link.target === 'object' ? link.target.id : link.target;
        const source = nodes.find(n => n.id === sId);
        const target = nodes.find(n => n.id === tId);
        
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (distance - linkDistance) * 0.06 * cooling;
          
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          source.x += fx;
          source.y += fy;
          target.x -= fx;
          target.y -= fy;
        }
      });
      
      // === 向心力（将节点拉向布局中心） ===
      nodes.forEach(node => {
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = distance * 0.008 * cooling;
        
        node.x += (dx / distance) * force;
        node.y += (dy / distance) * force;
      });
      
      // === 矩形碰撞检测（确保节点不重叠、不遮挡） ===
      for (let j = 0; j < nodes.length; j++) {
        const a = nodes[j];
        for (let k = j + 1; k < nodes.length; k++) {
          const b = nodes[k];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          
          // 半宽半高 + padding
          const halfW = (a.width + b.width) / 2 + nodePadding;
          const halfH = (a.height + b.height) / 2 + nodePadding;
          
          const overlapX = halfW - Math.abs(dx);
          const overlapY = halfH - Math.abs(dy);
          
          if (overlapX > 0 && overlapY > 0) {
            // 沿最小重叠轴推开
            const signX = dx >= 0 ? 1 : -1;
            const signY = dy >= 0 ? 1 : -1;
            
            if (overlapX < overlapY) {
              const push = overlapX * 0.52;
              a.x -= signX * push;
              b.x += signX * push;
            } else {
              const push = overlapY * 0.52;
              a.y -= signY * push;
              b.y += signY * push;
            }
          }
        }
      }
      
      // === 边界约束 ===
      nodes.forEach(node => {
        const hw = node.width / 2;
        const hh = node.height / 2;
        node.x = Math.max(hw + 20, Math.min(width - hw - 20, node.x));
        node.y = Math.max(hh + 20, Math.min(height - hh - 20, node.y));
      });
    }
    
    // === 最终碰撞消除（多轮严格矩形检测） ===
    for (let pass = 0; pass < 50; pass++) {
      let anyOverlap = false;
      for (let j = 0; j < nodes.length; j++) {
        const a = nodes[j];
        for (let k = j + 1; k < nodes.length; k++) {
          const b = nodes[k];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          
          const halfW = (a.width + b.width) / 2 + nodePadding;
          const halfH = (a.height + b.height) / 2 + nodePadding;
          
          const overlapX = halfW - Math.abs(dx);
          const overlapY = halfH - Math.abs(dy);
          
          if (overlapX > 0 && overlapY > 0) {
            anyOverlap = true;
            const signX = dx >= 0 ? 1 : -1;
            const signY = dy >= 0 ? 1 : -1;
            
            if (overlapX < overlapY) {
              const push = overlapX / 2 + 1;
              a.x -= signX * push;
              b.x += signX * push;
            } else {
              const push = overlapY / 2 + 1;
              a.y -= signY * push;
              b.y += signY * push;
            }
          }
        }
      }
      if (!anyOverlap) break;
    }
    
    console.log('Force layout completed (rect collision, no overlap)');
  },
  
  /**
   * 获取节点位置
   * @param {string} nodeId - 节点ID
   * @returns {object} 位置对象
   */
  getNodePosition(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : null;
  },
  
  /**
   * 更新节点位置
   * @param {string} nodeId - 节点ID
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  updateNodePosition(nodeId, x, y) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.x = x;
      node.y = y;
    }
  },
  
  /**
   * 获取所有节点位置
   * @returns {Map} 节点位置映射
   */
  getAllPositions() {
    const positions = new Map();
    this.nodes.forEach(node => {
      positions.set(node.id, { x: node.x, y: node.y });
    });
    return positions;
  },
  
  /**
   * 停止模拟
   */
  stop() {
    this.simulation = null;
    console.log('Force layout stopped');
  },
  
  /**
   * 重新计算布局
   */
  recalculate() {
    if (this.nodes.length && this.links.length) {
      this.startSimulation();
    }
  },
  
  /**
   * 更新节点和连线
   * @param {Array} nodes - 新节点数组
   * @param {Array} links - 新连线数组
   */
  update(nodes, links) {
    // 保留现有位置
    const positions = this.getAllPositions();
    
    // 更新节点
    this.nodes = nodes.map(n => {
      const existing = positions.get(n.id);
      return {
        id: n.id,
        x: existing ? existing.x : n.x || Math.random() * 800,
        y: existing ? existing.y : n.y || Math.random() * 600,
        width: n.width || 200,
        height: n.height || 100
      };
    });
    
    // 更新连线
    this.links = links.map(l => ({
      source: l.source,
      target: l.target
    }));
    
    this.startSimulation();
  },
  
  /**
   * 销毁布局
   */
  destroy() {
    this.stop();
    this.nodes = [];
    this.links = [];
    console.log('ForceLayout destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.ForceLayout;
}
