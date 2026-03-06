/**
 * GUXY平移缩放系统
 * 处理画布的平移和缩放
 */

GUXY.ZoomPan = {
  container: null,
  stage: null,
  isPanning: false,
  panStart: { x: 0, y: 0 },
  
  // 状态
  zoom: 1,
  panX: 0,
  panY: 0,
  
  // 配置
  config: {
    minZoom: GUXY.Constants?.CANVAS?.MIN_ZOOM || 0.25,
    maxZoom: GUXY.Constants?.CANVAS?.MAX_ZOOM || 4,
    zoomStep: GUXY.Constants?.CANVAS?.ZOOM_STEP || 0.1,
    wheelZoom: GUXY.Constants?.CANVAS?.WHEEL_ZOOM !== false,
    panSpeed: GUXY.Constants?.CANVAS?.PAN_SPEED || 1
  },
  
  /**
   * 初始化平移缩放系统
   * @param {HTMLElement} container - 容器元素
   * @param {HTMLElement} stage - 画布舞台元素
   */
  init(container, stage) {
    this.container = container;
    this.stage = stage;
    this.loadFromState();
    this.bindEvents();
    this.updateTransform();
    console.log('ZoomPan initialized');
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;
    
    // 保存绑定的回调引用，以便 destroy 时正确移除
    this._onMouseDown = (e) => this.handleMouseDown(e);
    this._onMouseMove = (e) => this.handleMouseMove(e);
    this._onMouseUp = (e) => this.handleMouseUp(e);
    this._onWheel = (e) => this.handleWheel(e);
    this._onDblClick = (e) => this.handleDoubleClick(e);
    
    // 鼠标按下 - 在空白区域开始平移画布（节点的mousedown会stopPropagation，不会冒泡到此）
    this.container.addEventListener('mousedown', this._onMouseDown);
    
    // 滚轮缩放
    if (this.config.wheelZoom) {
      this.container.addEventListener('wheel', this._onWheel, { passive: false });
    }
    
    // 双击居中
    this.container.addEventListener('dblclick', this._onDblClick);
    
    console.log('[ZoomPan] bindEvents: mousedown + wheel + dblclick');
  },
  
  /**
   * 开始平移
   * @param {number} clientX - 鼠标X
   * @param {number} clientY - 鼠标Y
   */
  startPanning(clientX, clientY) {
    if (this.isPanning) return;
    
    this.isPanning = true;
    this.panStart = {
      x: clientX - this.panX,
      y: clientY - this.panY
    };
    this.container.style.cursor = 'grabbing';
  },
  
  /**
   * 停止平移
   */
  stopPanning() {
    if (!this.isPanning) return;
    
    this.isPanning = false;
    this.container.style.cursor = '';
  },
  
  /**
   * 更新平移位置
   * @param {number} clientX - 鼠标X
   * @param {number} clientY - 鼠标Y
   */
  updatePanPosition(clientX, clientY) {
    if (!this.isPanning) return;
    
    this.panX = clientX - this.panStart.x;
    this.panY = clientY - this.panStart.y;
    
    this.updateTransform();
    this.saveToState();
  },
  
  /**
   * 处理鼠标按下 - 在空白画布区域开始平移
   * 节点的 mousedown 已经 stopPropagation，所以此处只会响应空白区域的点击
   * @param {MouseEvent} e - 鼠标事件
   */
  handleMouseDown(e) {
    // 仅左键触发平移
    if (e.button !== 0) return;
    
    // 安全检查：如果点击的是节点、连接点或连线，不进行画布平移
    if (e.target.closest('.card-node') || e.target.closest('.collection-node') || 
        e.target.closest('.connection-dot') || e.target.closest('.edge-path') || 
        e.target.closest('.edge-label')) {
      return;
    }
    
    e.preventDefault();
    this.startPanning(e.clientX, e.clientY);
    
    // 在 document 上监听移动和松开，确保鼠标移出画布区域也能正常结束平移
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
  },
  
  /**
   * 处理鼠标移动 - 更新画布平移
   * @param {MouseEvent} e - 鼠标事件
   */
  handleMouseMove(e) {
    if (!this.isPanning) return;
    this.updatePanPosition(e.clientX, e.clientY);
  },
  
  /**
   * 处理鼠标松开 - 结束画布平移
   * @param {MouseEvent} e - 鼠标事件
   */
  handleMouseUp(e) {
    if (!this.isPanning) return;
    this.stopPanning();
    
    // 移除 document 上的临时监听
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  },
  
  /**
   * 处理滚轮
   * @param {WheelEvent} e - 滚轮事件
   */
  handleWheel(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = this.zoom + delta * this.config.zoomStep;
    
    // 计算缩放中心
    const rect = this.container.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;
    
    this.zoomAround(newZoom, centerX, centerY);
  },
  
  /**
   * 处理双击
   * @param {MouseEvent} e - 鼠标事件
   */
  handleDoubleClick(e) {
    this.zoomAt(e.clientX, e.clientY, 2);
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
   * 在指定位置缩放
   * @param {number} screenX - 屏幕X
   * @param {number} screenY - 屏幕Y
   * @param {number} newZoom - 新的缩放比例
   */
  zoomAt(screenX, screenY, newZoom) {
    const rect = this.container.getBoundingClientRect();
    const centerX = screenX - rect.left;
    const centerY = screenY - rect.top;
    this.zoomAround(newZoom, centerX, centerY);
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
    if (this.stage) {
      this.stage.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }
  },
  
  /**
   * 放大
   */
  zoomIn() {
    const newZoom = Math.min(this.config.maxZoom, this.zoom + this.config.zoomStep);
    this.setZoom(newZoom);
    this.dispatchZoomChange();
  },
  
  /**
   * 缩小
   */
  zoomOut() {
    const newZoom = Math.max(this.config.minZoom, this.zoom - this.config.zoomStep);
    this.setZoom(newZoom);
    this.dispatchZoomChange();
  },
  
  /**
   * 分发缩放变更事件
   */
  dispatchZoomChange() {
    const event = new CustomEvent('zoomChanged', {
      detail: { zoom: this.zoom }
    });
    document.dispatchEvent(event);
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
    this.dispatchZoomChange();
  },
  
  /**
   * 居中视图
   */
  centerView() {
    if (!this.stage || !this.stage.children.length) {
      this.resetView();
      return;
    }
    
    // 计算边界
    const bounds = this.calculateBounds();
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;
    
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
    const nodes = Array.from(this.stage.querySelectorAll('.card-node, .collection-node'));
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
   * 从状态加载
   */
  loadFromState() {
    if (GUXY.State && GUXY.State.canvas) {
      this.zoom = GUXY.State.canvas.zoom || 1;
      this.panX = GUXY.State.canvas.panX || 0;
      this.panY = GUXY.State.canvas.panY || 0;
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
   * 屏幕坐标转换为画布坐标
   * @param {number} screenX - 屏幕X
   * @param {number} screenY - 屏幕Y
   * @returns {object} 画布坐标
   */
  screenToCanvas(screenX, screenY) {
    const rect = this.container.getBoundingClientRect();
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
    const rect = this.container.getBoundingClientRect();
    return {
      x: canvasX * this.zoom + this.panX + rect.left,
      y: canvasY * this.zoom + this.panY + rect.top
    };
  },
  
  /**
   * 销毁平移缩放系统
   */
  destroy() {
    if (this.container) {
      if (this._onMouseDown) this.container.removeEventListener('mousedown', this._onMouseDown);
      if (this._onWheel) this.container.removeEventListener('wheel', this._onWheel);
      if (this._onDblClick) this.container.removeEventListener('dblclick', this._onDblClick);
    }
    
    if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove);
    if (this._onMouseUp) document.removeEventListener('mouseup', this._onMouseUp);
    
    this._onMouseDown = null;
    this._onMouseMove = null;
    this._onMouseUp = null;
    this._onWheel = null;
    this._onDblClick = null;
    
    this.container = null;
    this.stage = null;
    
    console.log('ZoomPan destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.ZoomPan;
}
