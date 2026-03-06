/**
 * GUXY提示消息组件
 * 显示通知和提示
 */

GUXY.Toast = {
  container: null,
  toasts: [],
  
  /**
   * 初始化Toast
   */
  init() {
    this.createContainer();
    console.log('Toast initialized');
  },
  
  /**
   * 创建容器
   */
  createContainer() {
    if (this.container) return;
    
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    
    this.container = container;
  },
  
  /**
   * 显示Toast
   * @param {string} message - 消息
   * @param {string} type - 类型（success, error, warning, info）
   * @param {number} duration - 持续时间
   * @param {boolean} center - 是否在屏幕中央显示
   */
  show(message, type = 'info', duration = 3000, center = false) {
    if (!this.container) {
      this.createContainer();
    }
    
    // 如果要在中央显示，添加toast-center类
    if (center) {
      this.container.classList.add('toast-center');
    }

    const toast = this.createToast(message, type);
    this.container.appendChild(toast);
    this.toasts.push(toast);
    
    // 自动隐藏
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toast);
        // 如果是最后一个toast，移除center类
        if (this.toasts.filter(t => t !== toast).length === 0) {
          this.container.classList.remove('toast-center');
        }
      }, duration);
    }
    
    return toast;
  },
  
  /**
   * 创建Toast元素
   * @param {string} message - 消息
   * @param {string} type - 类型
   * @returns {HTMLElement} Toast元素
   */
  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
      <div class="toast-content">
        <div class="toast-message">${this.escapeHtml(message)}</div>
      </div>
      <button class="toast-close">×</button>
    `;
    
    // 绑定关闭事件
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => this.hide(toast));
    
    // 点击整个Toast关闭
    toast.addEventListener('click', () => this.hide(toast));
    
    return toast;
  },
  
  /**
   * 隐藏Toast
   * @param {HTMLElement} toast - Toast元素
   */
  hide(toast) {
    if (!toast) return;
    
    // 添加淡出动画
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      toast.remove();
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  },
  
  /**
   * 显示成功消息
   * @param {string} message - 消息
   * @param {number} duration - 持续时间
   */
  success(message, duration) {
    return this.show(message, 'success', duration || GUXY.Constants?.TOAST_DURATION?.SHORT || 2000);
  },
  
  /**
   * 显示错误消息
   * @param {string} message - 消息
   * @param {number} duration - 持续时间
   */
  error(message, duration) {
    return this.show(message, 'error', duration || GUXY.Constants?.TOAST_DURATION?.LONG || 5000);
  },
  
  /**
   * 显示警告消息
   * @param {string} message - 消息
   * @param {number} duration - 持续时间
   */
  warning(message, duration) {
    return this.show(message, 'warning', duration || GUXY.Constants?.TOAST_DURATION?.MEDIUM || 3000);
  },
  
  /**
   * 显示信息消息
   * @param {string} message - 消息
   * @param {number} duration - 持续时间
   */
  info(message, duration) {
    return this.show(message, 'info', duration || GUXY.Constants?.TOAST_DURATION?.MEDIUM || 3000);
  },
  
  /**
   * 隐藏所有Toast
   */
  hideAll() {
    const toastsCopy = [...this.toasts];
    toastsCopy.forEach(toast => this.hide(toast));
  },
  
  /**
   * 清空所有Toast
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.toasts = [];
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
   * 销毁Toast
   */
  destroy() {
    this.clear();
    if (this.container) {
      this.container.remove();
    }
    this.container = null;
    
    console.log('Toast destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.Toast;
}
