/**
 * GUXY连线渲染
 * 管理画布上的连线绘制
 */

GUXY.CanvasEdges = {
  container: null,
  svg: null,
  edgeMap: new Map(),
  
  /**
   * 初始化连线容器
   * @param {HTMLElement} container - 容器元素
   */
  init(container) {
    this.container = container;
    
    // 创建SVG元素
    this.svg = container.querySelector('svg');
    if (!this.svg) {
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      container.appendChild(this.svg);
    }
    
    // 定义箭头标记
    this.defineMarkers();
    
    console.log('CanvasEdges initialized');
  },
  
  /**
   * 定义箭头标记
   */
  defineMarkers() {
    if (!this.svg) return;
    
    // 移除旧的 defs（防止重复定义）
    const oldDefs = this.svg.querySelector('defs');
    if (oldDefs) oldDefs.remove();
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // 默认箭头
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', '#9CA3AF');
    
    marker.appendChild(path);
    defs.appendChild(marker);
    this.svg.appendChild(defs);
  },
  
  /**
   * 计算连线路径（方向感知的贝塞尔曲线）
   * @param {object} source - 源节点位置 {x, y}
   * @param {object} target - 目标节点位置 {x, y}
   * @param {string} [sourcePosition] - 源连接点方向（top/right/bottom/left）
   * @param {string} [targetPosition] - 目标连接点方向（top/right/bottom/left）
   * @returns {string} SVG路径
   */
  calculatePath(source, target, sourcePosition, targetPosition) {
    const sx = source.x;
    const sy = source.y;
    const tx = target.x;
    const ty = target.y;
    
    const dist = Math.sqrt((tx - sx) ** 2 + (ty - sy) ** 2);
    const curvature = Math.min(dist * 0.4, 150); // 自适应曲率，最大 150

    // 如果有方向信息，根据方向确定控制点
    if (sourcePosition || targetPosition) {
      const cp1 = this.getControlPoint(sx, sy, sourcePosition || 'right', curvature);
      const cp2 = this.getControlPoint(tx, ty, targetPosition || 'left', curvature);
      return `M ${sx} ${sy} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${tx} ${ty}`;
    }
    
    // 降级：基于距离方向自动推断
    const dx = Math.abs(tx - sx);
    const dy = Math.abs(ty - sy);
    
    let cp1x, cp1y, cp2x, cp2y;
    
    if (dx > dy) {
      // 水平方向为主
      const sign = tx > sx ? 1 : -1;
      cp1x = sx + curvature * sign;
      cp1y = sy;
      cp2x = tx - curvature * sign;
      cp2y = ty;
    } else {
      // 垂直方向为主
      const sign = ty > sy ? 1 : -1;
      cp1x = sx;
      cp1y = sy + curvature * sign;
      cp2x = tx;
      cp2y = ty - curvature * sign;
    }
    
    return `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tx} ${ty}`;
  },
  
  /**
   * 根据连接点方向获取控制点坐标
   * @param {number} x - 连接点 x
   * @param {number} y - 连接点 y
   * @param {string} direction - 方向
   * @param {number} offset - 控制点偏移距离
   * @returns {object} 控制点 {x, y}
   */
  getControlPoint(x, y, direction, offset) {
    switch (direction) {
      case 'top':    return { x: x, y: y - offset };
      case 'bottom': return { x: x, y: y + offset };
      case 'left':   return { x: x - offset, y: y };
      case 'right':  return { x: x + offset, y: y };
      default:       return { x: x + offset, y: y };
    }
  },
  
  /**
   * 创建连线路径
   * @param {object} edgeData - 连线数据
   * @param {object} sourcePos - 源节点位置
   * @param {object} targetPos - 目标节点位置
   * @returns {SVGPathElement} 路径元素
   */
  createEdgePath(edgeData, sourcePos, targetPos) {
    const { id, type } = edgeData;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'edge-path');
    path.setAttribute('data-id', id);
    path.setAttribute('data-type', type || 'default');
    path.setAttribute('marker-end', 'url(#arrowhead)');
    // 使连线可交互（点击编辑），pointer-events 由 CSS 统一设置
    path.style.cursor = 'pointer';
    
    const d = this.calculatePath(
      sourcePos,
      targetPos,
      edgeData.sourcePosition,
      edgeData.targetPosition
    );
    path.setAttribute('d', d);
    
    return path;
  },
  
  /**
   * 添加连线
   * @param {object} edgeData - 连线数据
   * @param {object} sourcePos - 源节点位置（可选，如果不提供则从节点获取）
   * @param {object} targetPos - 目标节点位置（可选，如果不提供则从节点获取）
   * @returns {SVGPathElement} 路径元素
   */
  addEdge(edgeData, sourcePos, targetPos) {
    if (!this.svg) return null;

    // 如果没有提供位置，尝试从节点获取
    if (!sourcePos || !targetPos) {
      if (GUXY.CanvasNodes) {
        const sourceNodeId = edgeData.source;
        const targetNodeId = edgeData.target;

        if (!sourcePos && sourceNodeId) {
          const sourcePosObj = GUXY.CanvasNodes.getNodePosition(sourceNodeId);
          if (sourcePosObj) {
            // 根据 sourcePosition 确定连接点坐标
            sourcePos = this.getAnchorPoint(sourcePosObj, edgeData.sourcePosition);
          }
        }

        if (!targetPos && targetNodeId) {
          const targetPosObj = GUXY.CanvasNodes.getNodePosition(targetNodeId);
          if (targetPosObj) {
            targetPos = this.getAnchorPoint(targetPosObj, edgeData.targetPosition);
          }
        }
      }
    }

    // 如果仍然没有位置，使用默认值
    if (!sourcePos) sourcePos = { x: 0, y: 0 };
    if (!targetPos) targetPos = { x: 100, y: 100 };

    const path = this.createEdgePath(edgeData, sourcePos, targetPos);
    path.setAttribute('data-edge-id', edgeData.id);
    path.setAttribute('data-source', edgeData.source);
    path.setAttribute('data-target', edgeData.target);
    // 直接绑定点击事件，避免因 pointer-events 继承等问题导致点击无响应
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      if (GUXY.Connection && !GUXY.Connection.isConnecting) {
        GUXY.Connection.editEdge(edgeData.id);
      }
    });
    path.setAttribute('data-source-x', sourcePos.x);
    path.setAttribute('data-source-y', sourcePos.y);
    path.setAttribute('data-target-x', targetPos.x);
    path.setAttribute('data-target-y', targetPos.y);
    if (edgeData.sourcePosition) path.setAttribute('data-source-pos', edgeData.sourcePosition);
    if (edgeData.targetPosition) path.setAttribute('data-target-pos', edgeData.targetPosition);
    
    this.svg.appendChild(path);

    // 如果有标签，创建标签元素
    if (edgeData.label) {
      const midPoint = this.getMidPoint(sourcePos, targetPos);
      const label = this.createEdgeLabel(edgeData, midPoint);
      if (label) {
        label.addEventListener('click', (e) => {
          e.stopPropagation();
          if (GUXY.Connection && !GUXY.Connection.isConnecting) {
            GUXY.Connection.editEdge(edgeData.id);
          }
        });
        if (path.nextSibling) {
          path.parentNode.insertBefore(label, path.nextSibling);
        } else {
          path.parentNode.appendChild(label);
        }
      }
    }

    this.edgeMap.set(edgeData.id, path);

    return path;
  },
  
  /**
   * 根据节点位置和连接方向获取锚点坐标
   * @param {object} nodePos - 节点位置 {x, y, width, height}
   * @param {string} [position] - 连接方向
   * @returns {object} 锚点坐标 {x, y}
   */
  getAnchorPoint(nodePos, position) {
    const { x, y, width, height } = nodePos;
    switch (position) {
      case 'top':    return { x: x + width / 2, y: y };
      case 'right':  return { x: x + width, y: y + height / 2 };
      case 'bottom': return { x: x + width / 2, y: y + height };
      case 'left':   return { x: x, y: y + height / 2 };
      default:       return { x: x + width / 2, y: y + height / 2 };
    }
  },
  
  /**
   * 计算两点中点
   * @param {object} a - 点A {x, y}
   * @param {object} b - 点B {x, y}
   * @returns {object} 中点 {x, y}
   */
  getMidPoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  },
  
  /**
   * 批量添加连线
   * @param {Array} edgesData - 连线数据数组
   * @param {Map} positionsMap - 节点位置映射
   */
  addEdges(edgesData, positionsMap) {
    if (!this.svg || !positionsMap) return;
    
    edgesData.forEach(edgeData => {
      const sourcePos = positionsMap.get(edgeData.source);
      const targetPos = positionsMap.get(edgeData.target);
      
      if (sourcePos && targetPos) {
        this.addEdge(edgeData, sourcePos, targetPos);
      }
    });
  },
  
  /**
   * 创建连线标签元素
   * @param {object} edgeData - 连线数据
   * @param {object} midPoint - 连线中点坐标
   * @returns {SVGGElement} 标签元素
   */
  createEdgeLabel(edgeData, midPoint) {
    if (!this.svg) return null;

    const { label, iconType } = edgeData;
    if (!label) return null;

    // 创建标签组
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'edge-label');
    group.setAttribute('data-edge-id', edgeData.id);

    // 获取图标（如果有的话）
    const iconText = this.getIconText(iconType);
    const labelText = iconText ? `${iconText} ${label}` : label;

    // 估算文本宽度
    const textWidth = labelText.length * 8 + 24;
    const labelX = midPoint.x;
    const labelY = midPoint.y - 16;

    // 创建背景矩形（胶囊形毛玻璃效果）
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', labelX - textWidth / 2);
    bg.setAttribute('y', labelY - 12);
    bg.setAttribute('width', textWidth);
    bg.setAttribute('height', 24);
    bg.setAttribute('rx', 12);
    bg.setAttribute('ry', 12);
    bg.setAttribute('fill', 'rgba(255, 255, 255, 0.88)');
    bg.setAttribute('stroke', 'rgba(0, 0, 0, 0.06)');
    bg.setAttribute('stroke-width', '1');
    bg.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))');

    // 创建文本
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', labelX);
    text.setAttribute('y', labelY + 4);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#1a1a1a');
    text.setAttribute('font-size', '12px');
    text.setAttribute('font-family', 'Segoe UI, Microsoft YaHei, sans-serif');
    text.setAttribute('font-weight', '500');
    text.textContent = labelText;

    group.appendChild(bg);
    group.appendChild(text);

    return group;
  },

  /**
   * 获取图标文本
   * @param {string} iconType - 图标类型
   * @returns {string} 图标emoji或空字符串
   */
  getIconText(iconType) {
    const icons = {
      navigate: '→',
      back: '←',
      popup: '◻',
      refresh: '↻',
      coin: '🪙',
      silver: '💰',
      diamond: '💎',
      gem: '💎'
    };
    return icons[iconType] || '';
  },

  /**
   * 更新连线
   * @param {string} edgeId - 连线ID
   * @param {object} edgeData - 连线数据（可选，用于更新标签等）
   * @param {object} sourcePos - 源节点位置（可选）
   * @param {object} targetPos - 目标节点位置（可选）
   */
  updateEdge(edgeId, edgeData, sourcePos, targetPos) {
    const path = this.edgeMap.get(edgeId);
    if (!path) return;

    // 更新标签等属性
    if (edgeData) {
      path.setAttribute('data-edge-id', edgeId);
      
      // 移除旧标签
      const oldLabel = this.svg.querySelector(`.edge-label[data-edge-id="${edgeId}"]`);
      if (oldLabel) oldLabel.remove();
      
      // 获取源目标坐标
      const sx = sourcePos ? sourcePos.x : parseFloat(path.getAttribute('data-source-x')) || 0;
      const sy = sourcePos ? sourcePos.y : parseFloat(path.getAttribute('data-source-y')) || 0;
      const tx = targetPos ? targetPos.x : parseFloat(path.getAttribute('data-target-x')) || 100;
      const ty = targetPos ? targetPos.y : parseFloat(path.getAttribute('data-target-y')) || 100;

      // 添加新标签
      if (edgeData.label) {
        const midPoint = this.getMidPoint({ x: sx, y: sy }, { x: tx, y: ty });
        const label = this.createEdgeLabel(edgeData, midPoint);
        if (label && path.parentNode) {
          const nextSibling = path.nextSibling;
          if (nextSibling) {
            path.parentNode.insertBefore(label, nextSibling);
          } else {
            path.parentNode.appendChild(label);
          }
        }
      }
    }

    // 保存节点位置以便后续计算
    if (sourcePos && targetPos) {
      path.setAttribute('data-source-x', sourcePos.x);
      path.setAttribute('data-source-y', sourcePos.y);
      path.setAttribute('data-target-x', targetPos.x);
      path.setAttribute('data-target-y', targetPos.y);

      const srcDir = path.getAttribute('data-source-pos') || null;
      const tgtDir = path.getAttribute('data-target-pos') || null;
      const d = this.calculatePath(sourcePos, targetPos, srcDir, tgtDir);
      path.setAttribute('d', d);
    }
  },
  
  /**
   * 批量更新连线
   * @param {Map} positionsMap - 节点位置映射 {x, y, width?, height?}
   */
  updateAllEdges(positionsMap) {
    this.edgeMap.forEach((path, edgeId) => {
      const sourceId = path.getAttribute('data-source');
      const targetId = path.getAttribute('data-target');
      
      const sourcePos = positionsMap.get(sourceId);
      const targetPos = positionsMap.get(targetId);
      
      if (sourcePos && targetPos) {
        let srcDir = path.getAttribute('data-source-pos') || null;
        let tgtDir = path.getAttribute('data-target-pos') || null;
        
        // 如果位置包含宽高且方向未指定，根据相对位置自动推断边缘锚点
        if (sourcePos.width !== undefined && !srcDir) {
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          // 水平方向差异更大 -> 使用左右侧锚点
          if (Math.abs(dx) > Math.abs(dy)) {
            srcDir = dx > 0 ? 'right' : 'left';
          } else {
            // 垂直方向差异更大 -> 使用上下侧锚点
            srcDir = dy > 0 ? 'bottom' : 'top';
          }
        }
        
        if (targetPos.width !== undefined && !tgtDir) {
          const dx = sourcePos.x - targetPos.x;
          const dy = sourcePos.y - targetPos.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            tgtDir = dx > 0 ? 'right' : 'left';
          } else {
            tgtDir = dy > 0 ? 'bottom' : 'top';
          }
        }
        
        // 计算锚点坐标
        let sx = sourcePos.x, sy = sourcePos.y;
        let tx = targetPos.x, ty = targetPos.y;
        
        if (srcDir && sourcePos.width !== undefined) {
          const srcAnchor = this.getAnchorPoint(sourcePos, srcDir);
          sx = srcAnchor.x;
          sy = srcAnchor.y;
        } else if (sourcePos.width !== undefined) {
          sx = sourcePos.x + sourcePos.width / 2;
          sy = sourcePos.y + sourcePos.height / 2;
        }
        
        if (tgtDir && targetPos.width !== undefined) {
          const tgtAnchor = this.getAnchorPoint(targetPos, tgtDir);
          tx = tgtAnchor.x;
          ty = tgtAnchor.y;
        } else if (targetPos.width !== undefined) {
          tx = targetPos.x + targetPos.width / 2;
          ty = targetPos.y + targetPos.height / 2;
        }
        
        const d = this.calculatePath({x: sx, y: sy}, {x: tx, y: ty}, srcDir, tgtDir);
        path.setAttribute('d', d);
      }
    });
  },
  
  /**
   * 移除连线
   * @param {string} edgeId - 连线ID
   */
  removeEdge(edgeId) {
    const path = this.edgeMap.get(edgeId);
    if (!path) return;

    // 移除连线路径
    path.remove();

    // 移除对应标签
    if (this.svg) {
      const label = this.svg.querySelector(`.edge-label[data-edge-id="${edgeId}"]`);
      if (label) label.remove();
    }

    this.edgeMap.delete(edgeId);
  },
  
  /**
   * 移除节点的所有连线
   * @param {string} nodeId - 节点ID
   */
  removeNodeEdges(nodeId) {
    const toRemove = [];
    
    this.edgeMap.forEach((path, edgeId) => {
      const source = path.getAttribute('data-source');
      const target = path.getAttribute('data-target');
      
      if (source === nodeId || target === nodeId) {
        toRemove.push(edgeId);
      }
    });
    
    toRemove.forEach(edgeId => this.removeEdge(edgeId));
  },
  
  /**
   * 选中连线
   * @param {string} edgeId - 连线ID
   */
  selectEdge(edgeId) {
    this.deselectAll();
    const path = this.edgeMap.get(edgeId);
    if (path) {
      path.classList.add('selected');
    }
  },
  
  /**
   * 取消选中所有连线
   */
  deselectAll() {
    this.edgeMap.forEach(path => {
      path.classList.remove('selected');
    });
  },
  
  /**
   * 更新与节点相关的所有连线
   * @param {string} nodeId - 节点ID
   * @param {object} nodePos - 节点位置信息 {x, y, width, height}
   */
  updateEdgesForNode(nodeId, nodePos) {
    this.edgeMap.forEach((path, edgeId) => {
      const sourceId = path.getAttribute('data-source');
      const targetId = path.getAttribute('data-target');
      
      if (sourceId !== nodeId && targetId !== nodeId) return;
      
      // 获取两端位置
      let sx, sy, tx, ty;
      
      if (sourceId === nodeId) {
        const srcDir = path.getAttribute('data-source-pos') || null;
        const anchor = this.getAnchorPoint(nodePos, srcDir);
        sx = anchor.x;
        sy = anchor.y;
        path.setAttribute('data-source-x', sx);
        path.setAttribute('data-source-y', sy);
        tx = parseFloat(path.getAttribute('data-target-x'));
        ty = parseFloat(path.getAttribute('data-target-y'));
        
        // 如果目标位置无效，尝试重新获取（包含完整尺寸）
        if (isNaN(tx) || isNaN(ty)) {
          if (GUXY.CanvasNodes) {
            const tPos = GUXY.CanvasNodes.getNodePosition(targetId);
            if (tPos) {
              const tgtDir = path.getAttribute('data-target-pos') || null;
              const tAnchor = this.getAnchorPoint(tPos, tgtDir);
              tx = tAnchor.x;
              ty = tAnchor.y;
              path.setAttribute('data-target-x', tx);
              path.setAttribute('data-target-y', ty);
            }
          }
        }
      } else {
        const tgtDir = path.getAttribute('data-target-pos') || null;
        const anchor = this.getAnchorPoint(nodePos, tgtDir);
        tx = anchor.x;
        ty = anchor.y;
        path.setAttribute('data-target-x', tx);
        path.setAttribute('data-target-y', ty);
        sx = parseFloat(path.getAttribute('data-source-x'));
        sy = parseFloat(path.getAttribute('data-source-y'));
        
        // 如果源位置无效，尝试重新获取（包含完整尺寸）
        if (isNaN(sx) || isNaN(sy)) {
          if (GUXY.CanvasNodes) {
            const sPos = GUXY.CanvasNodes.getNodePosition(sourceId);
            if (sPos) {
              const srcDir = path.getAttribute('data-source-pos') || null;
              const sAnchor = this.getAnchorPoint(sPos, srcDir);
              sx = sAnchor.x;
              sy = sAnchor.y;
              path.setAttribute('data-source-x', sx);
              path.setAttribute('data-source-y', sy);
            }
          }
        }
      }
      
      // 更新路径
      if (!isNaN(sx) && !isNaN(sy) && !isNaN(tx) && !isNaN(ty)) {
        const srcDir = path.getAttribute('data-source-pos') || null;
        const tgtDir = path.getAttribute('data-target-pos') || null;
        const d = this.calculatePath({ x: sx, y: sy }, { x: tx, y: ty }, srcDir, tgtDir);
        path.setAttribute('d', d);
        
        // 同步更新标签位置
        const labelEl = this.svg?.querySelector(`.edge-label[data-edge-id="${edgeId}"]`);
        if (labelEl) {
          const mid = this.getMidPoint({ x: sx, y: sy }, { x: tx, y: ty });
          const bg = labelEl.querySelector('rect');
          const text = labelEl.querySelector('text');
          if (bg && text) {
            const textWidth = parseFloat(bg.getAttribute('width')) || 60;
            bg.setAttribute('x', mid.x - textWidth / 2);
            bg.setAttribute('y', mid.y - 16 - 12);
            text.setAttribute('x', mid.x);
            text.setAttribute('y', mid.y - 16 + 4);
          }
        }
      }
    });
  },
  
  /**
   * 获取与节点相关的所有连线
   * @param {string} nodeId - 节点ID
   * @returns {Array} 连线数据数组
   */
  getEdgesForNode(nodeId) {
    const edges = [];
    
    this.edgeMap.forEach((path, edgeId) => {
      const source = path.getAttribute('data-source');
      const target = path.getAttribute('data-target');
      
      if (source === nodeId || target === nodeId) {
        edges.push({
          id: edgeId,
          source: source,
          target: target
        });
      }
    });
    
    return edges;
  },
  
  /**
   * 清空所有连线
   */
  clear() {
    if (this.svg) {
      const paths = this.svg.querySelectorAll('.edge-path');
      paths.forEach(path => path.remove());
      const labels = this.svg.querySelectorAll('.edge-label');
      labels.forEach(label => label.remove());
      // 保留预览线和 defs
    }
    this.edgeMap.clear();
  },
  
  /**
   * 销毁连线管理器
   */
  destroy() {
    this.clear();
    this.container = null;
    this.svg = null;
    console.log('CanvasEdges destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.CanvasEdges;
}
