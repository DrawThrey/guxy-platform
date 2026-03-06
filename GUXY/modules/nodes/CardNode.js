/**
 * GUXY卡片节点
 * 卡片节点的DOM和事件处理
 */

GUXY.CardNode = {
  /**
   * 创建卡片节点元素
   * @param {object} data - 节点数据
   * @returns {HTMLElement} 节点元素
   */
  create(data) {
    const { id, type, title, description, x, y } = data;
    const width = GUXY.Constants?.LAYOUT?.DEFAULT_NODE_WIDTH || 240;
    const hasLowFiImage = !!data.lowFiImage;
    const colors = GUXY.Constants?.NODE_COLORS?.[type] || GUXY.Constants?.NODE_COLORS?.card;

    const element = document.createElement('div');
    element.className = `card-node ${type}-node${hasLowFiImage ? ' card-node--has-lowfi' : ''}`;
    element.dataset.id = id;
    element.dataset.type = type;
    element.dataset.x = x || 0;
    element.dataset.y = y || 0;

    element.style.left = `${x || 0}px`;
    element.style.top = `${y || 0}px`;
    element.style.width = `${width}px`;
    // 不设置内联高度，让内容和CSS控制高度，避免溢出

    element.innerHTML = `
      <div class="card-node-header">
        <div class="card-node-title">${this.escapeHtml(title)}</div>
        <div class="card-node-actions">
          <button class="btn-icon btn-edit" data-action="edit" title="编辑">✎</button>
          <button class="btn-icon btn-delete" data-action="delete" title="删除">×</button>
        </div>
      </div>
      ${hasLowFiImage && data.lowFiImage ? `
        <div class="card-node-media">
          <img src="${data.lowFiImage.dataUrl}" class="card-lowfi-thumb" alt="低保真原型图" />
        </div>
      ` : ''}
      <div class="card-node-body">${this.escapeHtml(description || '')}</div>
      <div class="card-node-footer">
        <span class="card-node-tag">${this.getTypeLabel(type)}</span>
        <span class="card-node-id">#${id.slice(-4)}</span>
      </div>
      <!-- 连接点 -->
      <div class="connection-dot-container">
        <div class="connection-dot top" data-position="top" data-node-id="${id}"></div>
        <div class="connection-dot right" data-position="right" data-node-id="${id}"></div>
        <div class="connection-dot bottom" data-position="bottom" data-node-id="${id}"></div>
        <div class="connection-dot left" data-position="left" data-node-id="${id}"></div>
      </div>
    `;

    return element;
  },
  
  /**
   * 更新内容
   * @param {HTMLElement} element - 卡片节点元素
   * @param {object} updates - 更新内容
   */
  update(element, updates) {
    if (updates.title !== undefined) {
      const titleEl = element.querySelector('.card-node-title');
      if (titleEl) {
        titleEl.textContent = updates.title;
      }
    }
    
    if (updates.description !== undefined) {
      const bodyEl = element.querySelector('.card-node-body');
      if (bodyEl) {
        bodyEl.textContent = updates.description;
      }
    }
    
    if (updates.type !== undefined) {
      // 不设置内联 backgroundColor，让 CSS 控制深色背景
      
      const tagEl = element.querySelector('.card-node-tag');
      if (tagEl) {
        tagEl.textContent = this.getTypeLabel(updates.type);
      }
    }
  },
  
  /**
   * 更新位置
   * @param {HTMLElement} element - 卡片节点元素
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  updatePosition(element, x, y) {
    element.dataset.x = x;
    element.dataset.y = y;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  },
  
  /**
   * 获取类型标签
   * @param {string} type - 节点类型
   * @returns {string} 类型标签
   */
  getTypeLabel(type) {
    const labels = {
      system: '系统',
      battle: '战斗',
      story: '剧情',
      level: '关卡',
      ui: '界面',
      data: '数据',
      collection: '集合',
      card: '卡片'
    };
    return labels[type] || type;
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
   * 更新低保真图片
   * @param {HTMLElement} element - 卡片节点元素
   * @param {object|null} imageData - 图片数据，null表示删除
   */
  updateLowFiImage(element, imageData) {
    if (!element) return;

    let imgEl = element.querySelector('.card-lowfi-thumb');
    let mediaEl = element.querySelector('.card-node-media');
    const bodyEl = element.querySelector('.card-node-body');

    if (imageData) {
      // 添加或更新图片，并标记为“有低保真图”状态
      if (!mediaEl) {
        mediaEl = document.createElement('div');
        mediaEl.className = 'card-node-media';
        const headerEl = element.querySelector('.card-node-header');
        if (headerEl) {
          headerEl.insertAdjacentElement('afterend', mediaEl);
        } else {
          element.insertBefore(mediaEl, element.firstChild);
        }
      }

      if (!imgEl) {
        imgEl = document.createElement('img');
        imgEl.className = 'card-lowfi-thumb';
        imgEl.alt = '低保真原型图';
        mediaEl.appendChild(imgEl);
      }

      imgEl.src = imageData.dataUrl;

      if (!element.classList.contains('card-node--has-lowfi')) {
        element.classList.add('card-node--has-lowfi');
      }
      // 有原型图时不展示描述文本
      if (bodyEl) {
        bodyEl.style.display = 'none';
      }
    } else {
      // 删除图片并还原为“无低保真图”状态
      if (mediaEl) {
        mediaEl.remove();
      } else if (imgEl) {
        imgEl.remove();
      }

      element.classList.remove('card-node--has-lowfi');

      // 恢复描述文本显示
      if (bodyEl) {
        bodyEl.style.display = '';
      }
    }
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.CardNode;
}
