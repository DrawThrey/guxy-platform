/**
 * GUXY集合节点
 * 集合节点的DOM和事件处理
 */

GUXY.CollectionNode = {
  /**
   * 创建集合节点元素
   * @param {object} data - 节点数据
   * @returns {HTMLElement} 节点元素
   */
  create(data) {
    const { id, title, x, y, children = [] } = data;
    const width = GUXY.Constants?.LAYOUT?.COLLECTION_WIDTH || 300;
    const height = GUXY.Constants?.LAYOUT?.COLLECTION_HEIGHT || 200;
    const colors = GUXY.Constants?.NODE_COLORS?.collection || { bg: 'transparent', border: 'rgba(251, 191, 36, 0.3)' };
    
    const element = document.createElement('div');
    element.className = 'collection-node';
    element.dataset.id = id;
    element.dataset.type = 'collection';
    element.dataset.x = x || 0;
    element.dataset.y = y || 0;
    
    element.style.left = `${x || 0}px`;
    element.style.top = `${y || 0}px`;
    element.style.minWidth = `${width}px`;
    element.style.minHeight = `${height}px`;
    // 不设置内联 backgroundColor，让 CSS 的毛玻璃效果生效
    
    element.innerHTML = `
      <div class="collection-node-header">
        <div class="collection-node-title">${this.escapeHtml(title)}</div>
        <div class="collection-node-actions">
          <button class="btn-icon" data-action="add-card" title="添加卡片">+</button>
          <button class="btn-icon btn-delete" data-action="delete" title="delete">×</button>
        </div>
      </div>
      <div class="collection-node-description-wrapper">
        <div class="collection-node-description">
          ${this.parseDescription(data.description || '')}
        </div>
      </div>
      <div class="collection-node-body">
        ${children.length === 0 ? 
          '<div class="empty-hint">拖拽卡片到此处</div>' : 
          children.map(child => `
            <div class="collection-item" data-child-id="${child.id}">
              ${this.escapeHtml(child.title)}
            </div>
          `).join('')}
      </div>
      <!-- 连接点 -->
      <div class="connection-dot-container">
        <div class="connection-dot top" data-position="top" data-node-id="${id}"></div>
        <div class="connection-dot right" data-position="right" data-node-id="${id}"></div>
        <div class="connection-dot bottom" data-position="bottom" data-node-id="${id}"></div>
        <div class="connection-dot left" data-position="left" data-node-id="${id}"></div>
      </div>
    `;

    // 添加描述区域的事件处理
    this.attachDescriptionEvents(element);

    return element;
  },
  
  /**
   * 解析描述文本，支持超链接
   * @param {string} description - 描述文本
   * @returns {string} 解析后的HTML
   */
  parseDescription(description) {
    if (!description) return '';
    
    // 转义HTML防止XSS
    const escaped = this.escapeHtml(description);
    
    // 解析超链接格式 [文本](URL)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const withLinks = escaped.replace(linkRegex, '<a href="$2" target="_blank" class="collection-link" title="点击访问链接">$1</a>');
    
    // 处理换行
    const withLineBreaks = withLinks.replace(/\n/g, '<br>');
    
    return withLineBreaks;
  },
  
  /**
   * 为描述区域添加事件处理
   * @param {HTMLElement} element - 集合节点元素
   */
  attachDescriptionEvents(element) {
    const descWrapper = element.querySelector('.collection-node-description-wrapper');
    if (!descWrapper) return;
    
    // 点击展开/收起描述
    descWrapper.addEventListener('click', () => {
      descWrapper.classList.toggle('expanded');
    });
  },
  
  /**
   * 添加子卡片
   * @param {HTMLElement} element - 集合节点元素
   * @param {object} childData - 子卡片数据
   */
  addChild(element, childData) {
    const body = element.querySelector('.collection-node-body');
    const emptyHint = body.querySelector('.empty-hint');
    
    if (emptyHint) {
      emptyHint.remove();
    }
    
    const item = document.createElement('div');
    item.className = 'collection-item';
    item.dataset.childId = childData.id;
    item.textContent = childData.title;
    
    body.appendChild(item);
  },
  
  /**
   * 移除子卡片
   * @param {HTMLElement} element - 集合节点元素
   * @param {string} childId - 子卡片ID
   */
  removeChild(element, childId) {
    const item = element.querySelector(`.collection-item[data-child-id="${childId}"]`);
    if (item) {
      item.remove();
    }
    
    const body = element.querySelector('.collection-node-body');
    if (body.children.length === 0) {
      const emptyHint = document.createElement('div');
      emptyHint.className = 'empty-hint';
      emptyHint.textContent = '拖拽卡片到此处';
      body.appendChild(emptyHint);
    }
  },
  
  /**
   * 更新标题
   * @param {HTMLElement} element - 集合节点元素
   * @param {string} title - 新标题
   */
  updateTitle(element, title) {
    const titleEl = element.querySelector('.collection-node-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
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
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.CollectionNode;
}
