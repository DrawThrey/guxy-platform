/**
 * GUXY模态框组件
 * 显示弹窗对话框
 */

GUXY.Modal = {
  container: null,
  
  /**
   * 初始化模态框
   */
  init() {
    this.createContainer();
    console.log('Modal initialized');
  },
  
  /**
   * 创建容器
   */
  createContainer() {
    if (this.container) return;
    
    const container = document.createElement('div');
    container.className = 'modal-overlay';
    container.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">标题</h3>
          <button class="modal-close" title="关闭">×</button>
        </div>
        <div class="modal-body">
          内容
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-cancel">取消</button>
          <button class="btn btn-primary btn-confirm">确认</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    this.container = container;
    
    this.bindEvents();
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;
    
    // 点击遮罩关闭
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.hide();
      }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
    
    // 关闭按钮
    const closeBtn = this.container.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.hide());
  },
  
  /**
   * 显示模态框
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {object} options - 选项
   */
  show(title, content, options = {}) {
    console.log('Modal.show called with:', { title, content: content.substring(0, 50) + '...', options });
    
    if (!this.container) {
      this.createContainer();
    }
    
    // 保存options到实例，确保在事件处理中可以访问
    this.currentOptions = options;
    
    // 更新标题
    const titleEl = this.container.querySelector('.modal-title');
    if (titleEl) {
      titleEl.textContent = title;
    } else {
      console.error('Modal title element not found');
    }
    
    // 更新内容
    const bodyEl = this.container.querySelector('.modal-body');
    if (bodyEl) {
      bodyEl.innerHTML = content;
    } else {
      console.error('Modal body element not found');
    }
    
    // 更新按钮
    const footerEl = this.container.querySelector('.modal-footer');
    if (footerEl) {
      const cancelBtn = footerEl.querySelector('.btn-cancel');
      const confirmBtn = footerEl.querySelector('.btn-confirm');
      
      console.log('Found buttons:', { cancelBtn: !!cancelBtn, confirmBtn: !!confirmBtn });
      
      // 取消按钮
      if (cancelBtn) {
        cancelBtn.textContent = options.cancelText || '取消';
        cancelBtn.style.display = options.showCancel !== false ? 'inline-block' : 'none';
      }
      
      // 确认按钮
      if (confirmBtn) {
        confirmBtn.textContent = options.confirmText || '确认';
        confirmBtn.className = `btn ${options.confirmClass || 'btn-primary'} btn-confirm`;
        confirmBtn.style.display = options.showConfirm !== false ? 'inline-block' : 'none';
      }
      
      // 绑定按钮事件
      this.bindButtonEvents();
    } else {
      console.error('Modal footer element not found');
    }
    
    // 显示
    this.container.classList.add('active');
    console.log('Modal shown, container:', this.container);
    
    // 聚焦确认按钮
    const confirmBtn = footerEl?.querySelector('.btn-confirm');
    if (confirmBtn && options.showConfirm !== false) {
      setTimeout(() => confirmBtn.focus(), 100);
    }
  },
  
  /**
   * 绑定按钮事件
   */
  bindButtonEvents() {
    const footerEl = this.container.querySelector('.modal-footer');
    if (!footerEl) {
      console.error('Modal footer not found');
      return;
    }
    
    const options = this.currentOptions || {};
    console.log('Binding button events with options:', options);
    
    // 取消按钮
    const cancelBtn = footerEl.querySelector('.btn-cancel');
    if (cancelBtn) {
      // 移除所有旧的事件监听器（通过设置onclick为null）
      cancelBtn.onclick = null;
      // 移除所有通过addEventListener添加的监听器
      const newCancelBtn = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
      
      newCancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Cancel button clicked');
        
        if (options.onCancel) {
          try {
            options.onCancel();
          } catch (error) {
            console.error('Modal onCancel error:', error);
          }
        }
        this.hide();
      });
    } else {
      console.warn('Cancel button not found');
    }
    
    // 确认按钮
    const confirmBtn = footerEl.querySelector('.btn-confirm');
    if (confirmBtn) {
      // 移除所有旧的事件监听器
      confirmBtn.onclick = null;
      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
      
      newConfirmBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Confirm button clicked');
        
        if (options.onConfirm) {
          try {
            console.log('Calling onConfirm callback');
            // 使用await支持异步回调
            const result = await Promise.resolve(options.onConfirm());
            console.log('onConfirm returned:', result);
            // 如果返回 false，则不关闭模态框
            if (result === false) {
              console.log('onConfirm returned false, keeping modal open');
              return;
            }
            // 如果返回 true 或 undefined，则关闭模态框
            console.log('Closing modal after successful save');
            this.hide();
          } catch (error) {
            console.error('Modal onConfirm error:', error);
            if (GUXY.Toast) {
              GUXY.Toast.show('操作失败: ' + error.message, 'error');
            } else {
              alert('操作失败: ' + error.message);
            }
            // 出错时不关闭模态框
            return;
          }
        } else {
          console.log('No onConfirm callback, closing modal');
          // 如果没有onConfirm回调，直接关闭
          this.hide();
        }
      });
      
      // 也添加一个直接的onclick作为备用
      newConfirmBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Confirm button onclick (backup)');
      };
    } else {
      console.error('Confirm button not found in footer:', footerEl.innerHTML);
    }
  },
  
  /**
   * 隐藏模态框
   */
  hide() {
    if (this.container) {
      this.container.classList.remove('active');
    }
  },
  
  /**
   * 关闭模态框（hide的别名）
   */
  close() {
    this.hide();
  },
  
  /**
   * 检查是否可见
   * @returns {boolean} 是否可见
   */
  isVisible() {
    return this.container?.classList.contains('active') || false;
  },
  
  /**
   * 显示确认对话框
   * @param {string} title - 标题
   * @param {string} message - 消息
   * @param {object} options - 选项
   * @returns {Promise<boolean>} 用户选择
   */
  confirm(title, message, options = {}) {
    return new Promise((resolve) => {
      const content = `<p>${message}</p>`;
      
      this.show(title, content, {
        ...options,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  },
  
  /**
   * 显示警告对话框
   * @param {string} title - 标题
   * @param {string} message - 消息
   * @param {object} options - 选项
   * @returns {Promise<boolean>} 用户选择
   */
  warning(title, message, options = {}) {
    return new Promise((resolve) => {
      const content = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <p>${message}</p>
        </div>
      `;
      
      this.show(title, content, {
        ...options,
        confirmText: '我知道了',
        showCancel: false,
        onConfirm: () => resolve(true)
      });
    });
  },
  
  /**
   * 显示错误对话框
   * @param {string} title - 标题
   * @param {string} message - 消息
   * @param {object} options - 选项
   * @returns {Promise<boolean>} 用户选择
   */
  error(title, message, options = {}) {
    return new Promise((resolve) => {
      const content = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
          <p>${message}</p>
        </div>
      `;
      
      this.show(title, content, {
        ...options,
        confirmText: '确定',
        showCancel: false,
        onConfirm: () => resolve(true)
      });
    });
  },
  
  /**
   * 显示输入对话框
   * @param {string} title - 标题
   * @param {string} placeholder - 占位符
   * @param {string} defaultValue - 默认值
   * @returns {Promise<string|null>} 用户输入
   */
  prompt(title, placeholder = '', defaultValue = '') {
    return new Promise((resolve) => {
      const inputId = `modal-input-${Date.now()}`;
      const content = `
        <div class="form-group">
          <label for="${inputId}">${placeholder}</label>
          <input type="text" id="${inputId}" class="input" value="${defaultValue}" placeholder="${placeholder}">
        </div>
      `;
      
      this.show(title, content, {
        onConfirm: () => {
          const input = this.container.querySelector(`#${inputId}`);
          const value = input ? input.value : null;
          resolve(value);
        },
        onCancel: () => resolve(null)
      });
      
      // 聚焦输入框
      setTimeout(() => {
        const input = this.container.querySelector(`#${inputId}`);
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    });
  },
  
  /**
   * 显示表单对话框
   * @param {string} title - 标题
   * @param {Array} fields - 表单字段
   * @returns {Promise<object|null>} 表单数据
   */
  form(title, fields) {
    return new Promise((resolve) => {
      const content = `
        <form id="modal-form">
          ${fields.map(field => `
            <div class="form-group">
              <label>${field.label}</label>
              ${field.type === 'textarea' 
                ? `<textarea class="textarea" name="${field.name}" placeholder="${field.placeholder || ''}"></textarea>`
                : `<input type="${field.type || 'text'}" class="input" name="${field.name}" placeholder="${field.placeholder || ''}">`
              }
            </div>
          `).join('')}
        </form>
      `;
      
      this.show(title, content, {
        onConfirm: () => {
          const form = this.container.querySelector('#modal-form');
          const formData = new FormData(form);
          const data = {};
          formData.forEach((value, key) => {
            data[key] = value;
          });
          resolve(data);
        },
        onCancel: () => resolve(null)
      });
    });
  },
  
  /**
   * 销毁模态框
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
    this.container = null;
    
    console.log('Modal destroyed');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.Modal;
}
