/**
 * GUXY画布舞台
 * 管理画布容器和变换
 */

GUXY.CanvasStage = {
  element: null,
  transformElement: null,
  nodesContainer: null,
  edgesContainer: null,
  
  // 变换状态
  zoom: 1,
  panX: 0,
  panY: 0,
  
  // 配置
  config: {
    minZoom: GUXY.Constants?.CANVAS?.MIN_ZOOM || 0.25,
    maxZoom: GUXY.Constants?.CANVAS?.MAX_ZOOM || 4,
    zoomStep: GUXY.Constants?.CANVAS?.ZOOM_STEP || 0.1,
    wheelZoom: GUXY.Constants?.CANVAS?.WHEEL_ZOOM !== false
  },
  
  /**
   * 初始化画布舞台
   * @param {HTMLElement} container - 容器元素
   */
  init(container) {
    this.element = container;
    
    // 使用HTML中已存在的DOM结构，不重建（避免破坏 #canvas-stage 样式和其他模块的DOM引用）
    this.transformElement = document.getElementById('canvas-transform');
    this.nodesContainer = document.getElementById('nodes-container');
    this.edgesContainer = document.getElementById('edges-container');
    
    // 如果DOM元素不存在则动态创建（兼容纯JS初始化场景）
    if (!this.transformElement) {
      const stageEl = document.createElement('div');
      stageEl.id = 'canvas-stage';
      stageEl.innerHTML = `
        <div class="canvas-transform" id="canvas-transform">
          <div class="edges-container" id="edges-container">
            <svg id="edges-svg"></svg>
          </div>
          <div class="nodes-container" id="nodes-container"></div>
        </div>
      `;
      this.element.appendChild(stageEl);
      this.transformElement = document.getElementById('canvas-transform');
      this.nodesContainer = document.getElementById('nodes-container');
      this.edgesContainer = document.getElementById('edges-container');
    }
    
    // 从状态恢复
    this.loadFromState();
    
    // 缩放平移交互由 ZoomPan 模块统一处理，此处不再绑定 wheel 事件避免重复
    
    console.log('CanvasStage initialized');
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.element) return;
    
    // 鼠标滚轮缩放
    if (this.config.wheelZoom) {
      this.element.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    }
  },
  
  /**
   * 处理鼠标滚轮
   * @param {WheelEvent} e - 滚轮事件
   */
  handleWheel(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = this.zoom + delta * this.config.zoomStep;
    
    // 计算缩放中心
    const rect = this.element.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;
    
    this.zoomAround(newZoom, centerX, centerY);
  },
  
  /**
   * 围绕指定点缩放
   * @param {number} newZoom - 新的缩放比例
   * @param {number} centerX - 中心点X
   * @param {number} centerY - 中心点Y
   */
  zoomAround(newZoom, centerX, centerY) {
    // 限制缩放范围
    newZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, newZoom));
    
    // 计算新的平移位置
    const zoomRatio = newZoom / this.zoom;
    this.panX = centerX - (centerX - this.panX) * zoomRatio;
    this.panY = centerY - (centerY - this.panY) * zoomRatio;
    this.zoom = newZoom;
    
    this.updateTransform();
    this.saveToState();
  },
  
  /**
   * 设置缩放
   * @param {number} zoom - 缩放比例
   */
  setZoom(zoom) {
    this.zoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, zoom));
    this.updateTransform();
    this.saveToState();
  },
  
  /**
   * 设置平移
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPan(x, y) {
    this.panX = x;
    this.panY = y;
    this.updateTransform();
    this.saveToState();
  },
  
  /**
   * 更新变换
   */
  updateTransform() {
    if (this.transformElement) {
      this.transformElement.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }
  },
  
  /**
   * 重置视图
   */
  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateTransform();
    this.saveToState();
  },
  
  /**
   * 居中视图
   */
  centerView() {
    if (!this.nodesContainer || !this.nodesContainer.children.length) {
      this.resetView();
      return;
    }
    
    // 计算边界
    const bounds = this.calculateBounds();
    const containerWidth = this.element.offsetWidth;
    const containerHeight = this.element.offsetHeight;
    
    // 计算居中位置
    const zoom = 1;
    const panX = (containerWidth - bounds.width * zoom) / 2 - bounds.left * zoom;
    const panY = (containerHeight - bounds.height * zoom) / 2 - bounds.top * zoom;
    
    this.zoom = zoom;
    this.panX = panX;
    this.panY = panY;
    
    this.updateTransform();
    this.saveToState();
  },
  
  /**
   * 计算节点边界
   * @returns {object} 边界对象
   */
  calculateBounds() {
    const nodes = Array.from(this.nodesContainer.children);
    if (!nodes.length) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const x = parseFloat(node.dataset.x) || 0;
      const y = parseFloat(node.dataset.y) || 0;
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  },
  
  /**
   * 屏幕坐标转换为画布坐标
   * @param {number} screenX - 屏幕X
   * @param {number} screenY - 屏幕Y
   * @returns {object} 画布坐标
   */
  screenToCanvas(screenX, screenY) {
    const rect = this.element.getBoundingClientRect();
    return {
      x: (screenX - rect.left - this.panX) / this.zoom,
      y: (screenY - rect.top - this.panY) / this.zoom
    };
  },
  
  /**
   * 画布坐标转换为屏幕坐标
   * @param {number} canvasX - 画布X
   * @param {number} canvasY - 画布Y
   * @returns {object} 屏幕坐标
   */
  canvasToScreen(canvasX, canvasY) {
    const rect = this.element.getBoundingClientRect();
    return {
      x: canvasX * this.zoom + this.panX + rect.left,
      y: canvasY * this.zoom + this.panY + rect.top
    };
  },
  
  /**
   * 从状态加载
   */
  loadFromState() {
    if (GUXY.State && GUXY.State.canvas) {
      this.zoom = GUXY.State.canvas.zoom || 1;
      this.panX = GUXY.State.canvas.panX || 0;
      this.panY = GUXY.State.canvas.panY || 0;
      this.updateTransform();
    }
  },
  
  /**
   * 保存到状态
   */
  saveToState() {
    if (GUXY.State) {
      GUXY.State.updateCanvas({
        zoom: this.zoom,
        panX: this.panX,
        panY: this.panY
      });
    }
  },
  
  /**
   * 清空画布
   */
  clear() {
    if (this.nodesContainer) {
      this.nodesContainer.innerHTML = '';
    }
    if (this.edgesContainer) {
      const svg = this.edgesContainer.querySelector('svg');
      if (svg) {
        svg.innerHTML = '';
      }
    }
  },
  
  /**
   * 销毁画布
   */
  destroy() {
    this.clear();
    if (this.element) {
      this.element.innerHTML = '';
    }
    this.element = null;
    this.transformElement = null;
    this.nodesContainer = null;
    this.edgesContainer = null;
    console.log('CanvasStage destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.CanvasStage;
}
