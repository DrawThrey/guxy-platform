/**
 * GUXY节点详情侧栏组件
 * 显示和编辑卡片、集合的详细信息
 */

GUXY.NodeDetailSidebar = {
  container: null,
  currentNode: null,
  nodeType: null, // 'card' or 'collection'
  
  /**
   * 显示节点详情
   * @param {object} node - 节点对象
   * @param {string} type - 节点类型
   */
  async show(node, type) {
    this.currentNode = node;
    this.nodeType = type;
    
    if (!this.container) {
      this.createContainer();
    }
    
    // 显示右侧侧栏
    this.container.classList.add('active');
    
    this.render();
    this.bindEvents();
    this.loadCommentsAndAttachments();
  },
  
  /**
   * 创建容器
   */
  createContainer() {
    // 优先使用右侧详情侧栏
    let sidebar = document.getElementById('detail-sidebar');
    
    if (sidebar) {
      this.container = sidebar;
    } else {
      // 如果找不到右侧侧栏，创建一个
      sidebar = document.createElement('aside');
      sidebar.id = 'detail-sidebar';
      sidebar.className = 'detail-sidebar';
      const layout = document.querySelector('.canvas-layout');
      if (layout) {
        layout.appendChild(sidebar);
      } else {
        document.body.appendChild(sidebar);
      }
      this.container = sidebar;
    }
  },
  
  /**
   * 渲染详情面板
   */
  render() {
    if (!this.container || !this.currentNode) return;
    
    const node = this.currentNode;
    const locked = !!node.locked;
    const marked = !!node.marked;
    
    if (this.nodeType === 'collection') {
      this.renderCollection(node, locked, marked);
    } else {
      this.renderCard(node, locked, marked);
    }
  },
  
  /**
   * 渲染集合详情
   */
  renderCollection(node, locked, marked) {
    const MODULE_TYPES = ['system', 'combat', 'story', 'level'];
    const MODULE_LABELS = {
      system: '⚙ 系统',
      combat: '⚔ 战斗',
      story: '📖 剧情',
      level: '🎯 关卡'
    };
    
    this.container.innerHTML = `
      <div class="detail-sidebar-header">
        <h3>集合详情</h3>
        <button class="detail-sidebar-close" title="关闭">×</button>
      </div>
      
      <div class="detail-sidebar-content">
        <div class="detail-panel">
          <label>标题</label>
          <input type="text" id="detail-title" value="${this.escapeHtml(node.title || '')}" ${locked ? 'disabled' : ''} />
          
          <label>类型</label>
          <select id="detail-module-type" ${locked ? 'disabled' : ''}>
            ${MODULE_TYPES.map(t => `<option value="${t}" ${(node.module_type || 'system') === t ? 'selected' : ''}>${MODULE_LABELS[t]}</option>`).join('')}
          </select>
          
          <div class="detail-actions">
            <button class="btn btn-secondary" id="btn-toggle-mark" ${locked ? 'disabled' : ''}>
              ${marked ? '✓ 已标记' : '标记'}
            </button>
            <button class="btn btn-secondary" id="btn-toggle-lock">
              ${locked ? '🔓 解锁' : '🔒 锁定'}
            </button>
          </div>
          
          <div id="collection-comments-section"></div>
          
          <button class="btn btn-primary" id="btn-open-collection-canvas">打开集合画布</button>
          
          <button class="btn btn-danger" id="btn-delete-node" ${locked ? 'disabled' : ''}>删除集合</button>
        </div>
      </div>
    `;
  },
  
  /**
   * 渲染卡片详情
   */
  renderCard(node, locked, marked) {
    const MODULE_TYPES = ['system', 'combat', 'story', 'level'];
    const MODULE_LABELS = {
      system: '系统',
      combat: '战斗',
      story: '剧情',
      level: '关卡'
    };

    const isScreen = node.type === 'screen' || node.card_type === 'screen';
    const level = (node.interface_level >= 1 && node.interface_level <= 3) ? node.interface_level : 1;
    // 在集合画布中才显示界面层级选择
    const isInCollectionCanvas = GUXY.State?.canvasScope === 'collection';
    const interfaceLevelBlock = (isScreen && isInCollectionCanvas) ? `
      <label>界面层级</label>
      <select id="detail-interface-level" ${locked ? 'disabled' : ''}>
        <option value="1" ${level === 1 ? 'selected' : ''}>一级界面</option>
        <option value="2" ${level === 2 ? 'selected' : ''}>二级界面</option>
        <option value="3" ${level === 3 ? 'selected' : ''}>三级界面</option>
      </select>
    ` : '';

    const lowFiImage = node.lowFiImage;
    const lowFiImageBlock = lowFiImage ? `
      <label>低保真原型图</label>
      <div class="detail-lowfi-container">
        <img src="${lowFiImage.dataUrl}" class="detail-lowfi-image" alt="低保真原型图" />
        <button class="btn btn-sm" id="btn-view-full-lowfi">查看大图</button>
        <button class="btn btn-danger btn-sm" id="btn-delete-lowfi" ${locked ? 'disabled' : ''}>删除图片</button>
      </div>
    ` : '';

    this.container.innerHTML = `
      <div class="detail-sidebar-header">
        <h3>卡片详情</h3>
        <button class="detail-sidebar-close" title="关闭">×</button>
      </div>

      <div class="detail-sidebar-content">
        <div class="detail-panel">
          ${node.cover_thumb ? `<img src="${node.cover_thumb}" class="card-cover-preview" alt="封面" />` : ''}

          ${lowFiImageBlock}

          <label>标题</label>
          <input type="text" id="detail-title" value="${this.escapeHtml(node.title || '')}" ${locked ? 'disabled' : ''} />

          <label>描述</label>
          <div class="detail-description-row">
            <textarea id="detail-body" class="detail-body-auto-height" rows="3" ${locked ? 'disabled' : ''}>${this.escapeHtml(node.body || node.description || '')}</textarea>
            ${!locked ? '<button type="button" class="btn btn-secondary btn-sm" id="btn-ai-expand-desc" title="根据连线逻辑、层级、功能与布局，将当前描述改写为可用于生成低保真的提示词">一键AI改写</button>' : ''}
          </div>

          <label>类型</label>
          <select id="detail-module-type" ${locked ? 'disabled' : ''}>
            ${MODULE_TYPES.map(t => `<option value="${t}" ${node.module_type === t ? 'selected' : ''}>${MODULE_LABELS[t]}</option>`).join('')}
          </select>

          ${interfaceLevelBlock}

          <div class="detail-actions">
            <button class="btn btn-secondary" id="btn-toggle-mark" ${locked ? 'disabled' : ''}>
              ${marked ? '✓ 已标记' : '标记'}
            </button>
            <button class="btn btn-secondary" id="btn-toggle-lock">
              ${locked ? '🔓 解锁' : '🔒 锁定'}
            </button>
            <button class="btn btn-primary" id="btn-generate-lowfi" ${locked ? 'disabled' : ''}>生成低保真</button>
          </div>

          <div id="card-comments-section"></div>
          <div id="card-attachments-section"></div>

          <button class="btn btn-danger" id="btn-delete-node" ${locked ? 'disabled' : ''}>删除卡片</button>
        </div>
      </div>
    `;
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;
    
    // 关闭侧栏
    const closeBtn = this.container.querySelector('.detail-sidebar-close');
    closeBtn?.addEventListener('click', () => this.hide());
    
    // 保存标题
    const titleInput = this.container.querySelector('#detail-title');
    titleInput?.addEventListener('blur', () => this.saveTitle());
    
    // 保存描述（仅卡片）
    const bodyInput = this.container.querySelector('#detail-body');
    bodyInput?.addEventListener('blur', () => this.saveBody());
    bodyInput?.addEventListener('input', () => this.resizeDetailBody());
    
    // 右侧栏描述框随内容增高（延迟一帧确保布局完成）
    setTimeout(() => this.resizeDetailBody(), 0);
    
    // 一键AI改写（仅卡片）
    const expandBtn = this.container.querySelector('#btn-ai-expand-desc');
    expandBtn?.addEventListener('click', () => this.expandCardDescription());
    
    // 保存类型
    const typeSelect = this.container.querySelector('#detail-module-type');
    typeSelect?.addEventListener('change', () => this.saveModuleType());
    
    // 保存界面层级（仅卡片）
    const levelSelect = this.container.querySelector('#detail-interface-level');
    levelSelect?.addEventListener('change', () => this.saveInterfaceLevel());
    
    // 标记/取消标记
    const markBtn = this.container.querySelector('#btn-toggle-mark');
    markBtn?.addEventListener('click', () => this.toggleMark());
    
    // 锁定/解锁
    const lockBtn = this.container.querySelector('#btn-toggle-lock');
    lockBtn?.addEventListener('click', () => this.toggleLock());
    
    // 删除节点
    const deleteBtn = this.container.querySelector('#btn-delete-node');
    deleteBtn?.addEventListener('click', () => this.deleteNode());
    
    // 打开集合画布（仅集合）
    const openCanvasBtn = this.container.querySelector('#btn-open-collection-canvas');
    openCanvasBtn?.addEventListener('click', () => this.openCollectionCanvas());

    // 生成低保真（仅卡片）
    const generateLowFiBtn = this.container.querySelector('#btn-generate-lowfi');
    generateLowFiBtn?.addEventListener('click', () => this.generateLowFiImage());

    // 查看低保真大图
    const viewFullLowFiBtn = this.container.querySelector('#btn-view-full-lowfi');
    viewFullLowFiBtn?.addEventListener('click', () => this.showLowFiImageModal());

    // 删除低保真图片
    const deleteLowFiBtn = this.container.querySelector('#btn-delete-lowfi');
    deleteLowFiBtn?.addEventListener('click', () => this.deleteLowFiImage());
  },
  
  /**
   * 加载评论和附件
   */
  async loadCommentsAndAttachments() {
    if (this.nodeType === 'card') {
      await this.loadCardComments();
      await this.loadCardAttachments();
    } else {
      await this.loadCollectionComments();
    }
  },
  
  /**
   * 加载卡片评论
   */
  async loadCardComments() {
    const section = this.container.querySelector('#card-comments-section');
    if (!section) return;
    
    try {
      const cardId = this.currentNode.id.startsWith('card-') 
        ? this.currentNode.id.replace('card-', '') 
        : this.currentNode.id;
      const comments = await GUXY.DB.getComments('card', cardId);
      section.innerHTML = this.renderComments(comments, 'card');
      this.bindCommentEvents('card');
    } catch (error) {
      console.error('Load comments error:', error);
    }
  },
  
  /**
   * 加载集合评论
   */
  async loadCollectionComments() {
    const section = this.container.querySelector('#collection-comments-section');
    if (!section) return;
    
    try {
      const collectionId = this.currentNode.id.startsWith('collection-') 
        ? this.currentNode.id.replace('collection-', '') 
        : this.currentNode.id;
      const comments = await GUXY.DB.getComments('collection', collectionId);
      section.innerHTML = this.renderComments(comments, 'collection');
      this.bindCommentEvents('collection');
    } catch (error) {
      console.error('Load comments error:', error);
    }
  },
  
  /**
   * 加载卡片附件
   */
  async loadCardAttachments() {
    const section = this.container.querySelector('#card-attachments-section');
    if (!section) return;
    
    try {
      const cardId = this.currentNode.id.startsWith('card-') 
        ? this.currentNode.id.replace('card-', '') 
        : this.currentNode.id;
      const attachments = await GUXY.DB.getAttachments(cardId);
      section.innerHTML = this.renderAttachments(attachments);
      this.bindAttachmentEvents();
    } catch (error) {
      console.error('Load attachments error:', error);
    }
  },
  
  /**
   * 渲染评论
   */
  renderComments(comments, targetType) {
    return `
      <label>评论 (${comments.length})</label>
      <ul class="comment-list">
        ${comments.map(c => `
          <li>
            <span class="comment-author">${this.escapeHtml(c.authorId || c.author_id || '用户')}</span>
            <span class="comment-content">${this.escapeHtml(c.content)}</span>
            <button class="btn btn-danger btn-sm" data-comment-id="${c.id}">删除</button>
          </li>
        `).join('')}
      </ul>
      <div class="comment-form">
        <input type="text" id="new-comment-input" placeholder="写评论..." />
        <button class="btn btn-primary" id="btn-send-comment">发送</button>
      </div>
    `;
  },
  
  /**
   * 渲染附件
   */
  renderAttachments(attachments) {
    const imageCount = attachments.filter(a => a.type === 'image').length;
    
    return `
      <label>附件（文档或最多 5 张图片）</label>
      <div class="attachments-list">
        ${attachments.map(a => `
          <div class="attachment-item" data-attachment-id="${a.id}">
            ${a.type === 'image' ? `<img src="${a.data || a.dataUrl}" class="attachment-thumb" alt="${this.escapeHtml(a.fileName || a.file_name || '')}" />` : ''}
            <a href="${a.data || a.dataUrl || '#'}" ${a.type === 'doc' ? `download="${this.escapeHtml(a.fileName || a.file_name || '')}"` : ''} target="_blank" rel="noopener">
              ${this.escapeHtml(a.fileName || a.file_name || '未命名文件')}
            </a>
            <button class="btn btn-danger btn-sm" data-attachment-id="${a.id}">删除</button>
          </div>
        `).join('')}
      </div>
      <label class="upload-btn">
        ${imageCount >= 5 ? '已达 5 张图片' : '添加附件'}
        <input type="file" id="attachment-file-input" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style="display: none;" />
      </label>
    `;
  },
  
  /**
   * 绑定评论事件
   */
  bindCommentEvents(targetType) {
    const sendBtn = this.container.querySelector('#btn-send-comment');
    const input = this.container.querySelector('#new-comment-input');
    
    sendBtn?.addEventListener('click', async () => {
      const content = input?.value.trim();
      if (!content) return;
      
      try {
        const targetId = this.currentNode.id.startsWith(targetType + '-') 
          ? this.currentNode.id.replace(targetType + '-', '') 
          : this.currentNode.id;
        await GUXY.DB.addComment({
          targetType: targetType,
          targetId: targetId,
          authorId: 'current_user', // TODO: 从用户系统获取
          content: content
        });
        
        input.value = '';
        await this.loadCommentsAndAttachments();
      } catch (error) {
        console.error('Add comment error:', error);
        GUXY.Toast?.show('添加评论失败', 'error');
      }
    });
    
    // 删除评论
    this.container.querySelectorAll('[data-comment-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await GUXY.DB.deleteComment(btn.dataset.commentId);
          await this.loadCommentsAndAttachments();
        } catch (error) {
          console.error('Delete comment error:', error);
        }
      });
    });
  },
  
  /**
   * 绑定附件事件
   */
  bindAttachmentEvents() {
    const fileInput = this.container.querySelector('#attachment-file-input');
    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const isImage = file.type.startsWith('image/');
        const type = isImage ? 'image' : 'doc';
        
        const cardId = this.currentNode.id.startsWith('card-') 
          ? this.currentNode.id.replace('card-', '') 
          : this.currentNode.id;
        
        // 检查图片数量限制
        if (isImage) {
          const attachments = await GUXY.DB.getAttachments(cardId);
          const imageCount = attachments.filter(a => a.type === 'image').length;
          if (imageCount >= 5) {
            GUXY.Toast?.show('最多只能上传5张图片', 'warning');
            e.target.value = '';
            return;
          }
          
          // 检查文件大小（2MB）
          if (file.size > 2 * 1024 * 1024) {
            GUXY.Toast?.show('图片不能超过2MB', 'warning');
            e.target.value = '';
            return;
          }
        }
        
        // 读取文件
        const data = await this.readFileAsDataURL(file);
        const dataToStore = isImage ? await this.compressImage(data) : data;
        
        // 保存附件
        await GUXY.DB.addAttachment({
          cardId: cardId,
          type: type,
          fileName: file.name,
          data: dataToStore
        });
        
        // 如果是第一张图片，设置为封面
        if (isImage) {
          const attachments = await GUXY.DB.getAttachments(cardId);
          const images = attachments.filter(a => a.type === 'image');
          if (images.length === 1) {
            await this.updateCardCover(images[0].data || images[0].dataUrl);
          }
        }
        
        e.target.value = '';
        await this.loadCardAttachments();
        GUXY.Toast?.show('附件上传成功', 'success');
      } catch (error) {
        console.error('Upload attachment error:', error);
        GUXY.Toast?.show('上传失败', 'error');
      }
    });
    
    // 删除附件
    this.container.querySelectorAll('[data-attachment-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const attachmentId = btn.dataset.attachmentId;
          await GUXY.DB.deleteAttachment(attachmentId);
          
          // 如果删除的是图片，检查是否需要清除封面
          const cardId = this.currentNode.id.startsWith('card-') 
            ? this.currentNode.id.replace('card-', '') 
            : this.currentNode.id;
          const remainingAttachments = await GUXY.DB.getAttachments(cardId);
          const remainingImages = remainingAttachments.filter(a => a.type === 'image');
          if (remainingImages.length === 0) {
            await this.updateCardCover(null);
          }
          
          await this.loadCardAttachments();
        } catch (error) {
          console.error('Delete attachment error:', error);
        }
      });
    });
  },
  
  /**
   * 读取文件为DataURL
   */
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  /**
   * 压缩图片
   */
  compressImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 120;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  },
  
  /**
   * 更新卡片封面
   */
  async updateCardCover(coverThumb) {
    if (this.currentNode) {
      this.currentNode.cover_thumb = coverThumb;
      // 更新到架构数据
      if (GUXY.State?.currentProject?.architecture) {
        const cardId = this.currentNode.id.startsWith('card-') 
          ? this.currentNode.id.replace('card-', '') 
          : this.currentNode.id;
        const card = GUXY.State.currentProject.architecture.cards?.find(c => c.id === cardId);
        if (card) {
          card.cover_thumb = coverThumb;
          GUXY.State.saveToStorage();
          
          // 更新画布显示
          if (GUXY.CanvasNodes) {
            const fullNodeId = `card-${cardId}`;
            const nodeEl = GUXY.CanvasNodes.getNodeElement(fullNodeId);
            if (nodeEl) {
              // 更新封面图片
              let imgEl = nodeEl.querySelector('.card-cover-thumb');
              if (coverThumb) {
                if (!imgEl) {
                  imgEl = document.createElement('img');
                  imgEl.className = 'card-cover-thumb';
                  const titleEl = nodeEl.querySelector('.title');
                  if (titleEl) {
                    titleEl.insertAdjacentElement('beforebegin', imgEl);
                  } else {
                    nodeEl.insertBefore(imgEl, nodeEl.firstChild);
                  }
                }
                imgEl.src = coverThumb;
                imgEl.alt = '封面';
              } else if (imgEl) {
                imgEl.remove();
              }
            }
          }
        }
      }
    }
  },
  
  /**
   * 保存标题
   */
  saveTitle() {
    const input = this.container.querySelector('#detail-title');
    if (!input || input.disabled) return;
    
    const title = input.value.trim();
    if (this.currentNode) {
      this.currentNode.title = title;
      this.updateNodeData();
      
      // 更新画布上的节点显示
      if (GUXY.CanvasNodes) {
        GUXY.CanvasNodes.updateNode(this.currentNode.id, { title: title });
      }
    }
  },
  
  /**
   * 保存描述
   */
  saveBody() {
    const input = this.container.querySelector('#detail-body');
    if (!input || input.disabled) return;
    
    const body = input.value;
    if (this.currentNode) {
      this.currentNode.body = body;
      this.currentNode.description = body; // 兼容两种字段名
      this.updateNodeData();
      
      // 更新画布上的节点显示
      if (GUXY.CanvasNodes) {
        GUXY.CanvasNodes.updateNode(this.currentNode.id, { description: body });
      }
    }
  },
  
  /**
   * 右侧栏描述框随内容自适应高度（可无限大，超出 70vh 时框内滚动）
   */
  resizeDetailBody() {
    const textarea = this.container?.querySelector('#detail-body');
    if (!textarea || !textarea.classList.contains('detail-body-auto-height')) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  },
  
  /**
   * 根据指定卡片与架构收集扩写上下文（供侧栏与子画布共用）
   * @param {object} card - 卡片对象
   * @param {object} arch - 架构数据
   * @returns {{ card, collection, linksOut, linksIn, sameCollectionCards, levelText } | null}
   */
  getCardExpandContextForCard(card, arch) {
    if (!arch || !card) return null;
    const cardId = (card.id || '').replace(/^card-/, '');
    const collection = arch.collections?.find(c => c.id === (card.collection_id || card.collectionId));
    const cards = arch.cards || [];
    const cardLinks = arch.cardLinks || [];
    const linksOut = cardLinks
      .filter(l => (l.from_card_id || '').replace(/^card-/, '') === cardId)
      .map(l => {
        const toCard = cards.find(c => (c.id || '').replace(/^card-/, '') === (l.to_card_id || '').replace(/^card-/, ''));
        return { targetTitle: toCard?.title || l.to_card_id, label: l.label || '' };
      });
    const linksIn = cardLinks
      .filter(l => (l.to_card_id || '').replace(/^card-/, '') === cardId)
      .map(l => {
        const fromCard = cards.find(c => (c.id || '').replace(/^card-/, '') === (l.from_card_id || '').replace(/^card-/, ''));
        return { sourceTitle: fromCard?.title || l.from_card_id, label: l.label || '' };
      });
    const sameCollectionCards = (cards.filter(c => (c.collection_id || c.collectionId) === (card.collection_id || card.collectionId)))
      .filter(c => (c.id || '').replace(/^card-/, '') !== cardId)
      .map(c => c.title);
    const level = (card.interface_level >= 1 && card.interface_level <= 3) ? card.interface_level : 1;
    const levelText = level === 1 ? '一级界面' : level === 2 ? '二级界面' : '三级界面';
    return { card, collection, linksOut, linksIn, sameCollectionCards, levelText };
  },
  
  /**
   * 收集当前卡片的上下文（连线、层级、同集合界面）用于 AI 描述改写
   * @returns {{ card, collection, linksOut, linksIn, sameCollectionCards, levelText }}
   */
  getCardExpandContext() {
    const arch = GUXY.State?.currentProject?.architecture;
    if (!arch || !this.currentNode || this.nodeType !== 'card') return null;
    
    const cardId = this.currentNode.id.replace(/^card-/, '');
    const card = arch.cards?.find(c => (c.id || '').replace(/^card-/, '') === cardId) || this.currentNode;
    const collection = arch.collections?.find(c => c.id === (card.collection_id || card.collectionId));
    const cards = arch.cards || [];
    const cardLinks = arch.cardLinks || [];
    
    const linksOut = cardLinks
      .filter(l => (l.from_card_id || '').replace(/^card-/, '') === cardId)
      .map(l => {
        const toCard = cards.find(c => (c.id || '').replace(/^card-/, '') === (l.to_card_id || '').replace(/^card-/, ''));
        return { targetTitle: toCard?.title || l.to_card_id, label: l.label || '' };
      });
    const linksIn = cardLinks
      .filter(l => (l.to_card_id || '').replace(/^card-/, '') === cardId)
      .map(l => {
        const fromCard = cards.find(c => (c.id || '').replace(/^card-/, '') === (l.from_card_id || '').replace(/^card-/, ''));
        return { sourceTitle: fromCard?.title || l.from_card_id, label: l.label || '' };
      });
    
    const sameCollectionCards = (cards.filter(c => (c.collection_id || c.collectionId) === (card.collection_id || card.collectionId)))
      .filter(c => (c.id || '').replace(/^card-/, '') !== cardId)
      .map(c => c.title);
    
    const level = (card.interface_level >= 1 && card.interface_level <= 3) ? card.interface_level : 1;
    const levelText = level === 1 ? '一级界面' : level === 2 ? '二级界面' : '三级界面';
    
    return {
      card,
      collection,
      linksOut,
      linksIn,
      sameCollectionCards,
      levelText
    };
  },
  
  /**
   * 去掉末尾的「润色与格式化」「检查限制条件」「已检查」等模型自检/思考过程
   * @param {string} text - 已剥离前缀后的正文
   * @returns {string}
   */
  stripTrailingThinking(text) {
    if (!text || typeof text !== 'string') return text;
    const cutMarkers = [
      /\n4\.\s*\*\*润色/m,
      /\n\*\*润色与格式化\*\*[：:]?\s*\n/m,
      /\n\s*\*?\s*检查限制条件[：:]/m,
      /\n\s*\*?\s*没有["「]?道具栏["」]?\s*\?\s*已检查/m,
      /\n\s*\*?\s*没有["「]?640[×x\*]600["」]?\s*\?\s*已检查/m,
      /\n\s*\*?\s*四部分齐全\s*\?\s*已检查/m,
      /\n\s*\*?\s*推断合理\s*\?\s*已检查/m,
      // 新增：更通用的思考过程匹配
      /\n\*\*思考/m,
      /\n\*\*分析\*\*/m,
      /\n\*\*步骤\*\*/m,
      /\n\d+\.\s*\*\*分析/m,
      /\n\d+\.\s*\*\*思考/m,
      /\n\d+\.\s*\*\*步骤/m,
      /\n【分析/m,
      /\n【思考/m,
      /\n【步骤/m,
      /\n---\s*\n.*分析/m,
      /\n---\s*\n.*思考/m
    ];
    let out = text;
    for (let i = 0; i < cutMarkers.length; i++) {
      const m = out.match(cutMarkers[i]);
      if (m) {
        const idx = out.indexOf(m[0]);
        if (idx >= 80) {
          out = out.slice(0, idx).trim();
        }
      }
    }
    return out;
  },

  /**
   * 从 AI 回复中剥离「分析请求」「分析输入数据」等前缀，只保留扩写正文
   * @param {string} content - 原始回复
   * @returns {string}
   */
  stripPromptFromExpandContent(content) {
    if (!content || typeof content !== 'string') return content;
    const t = content.trim();

    // 新增：处理开头的思考/分析过程
    // 模型可能在正文前写了分析步骤，需要跳过这些内容
    const thinkingStartPatterns = [
      /^1\.\s*\*\*分析/m,
      /^【分析/m,
      /^\*\*分析\*\*/m,
      /^步骤\s*1/m,
      /^第一步/m,
      /^首先[，,：:]/m
    ];
    for (let i = 0; i < thinkingStartPatterns.length; i++) {
      if (thinkingStartPatterns[i].test(t)) {
        // 尝试找到正文开始的位置（界面整体、界面呈现、顶部标题区等）
        const bodyStartPatterns = [
          /\n界面整体/m,
          /\n界面呈现/m,
          /\n顶部标题区/m,
          /\n顶部区域/m,
          /\n一、界面/m,
          /\n1\.\s*界面/m,
          /\n【界面/m,
          /\n\*\*界面/m
        ];
        for (let j = 0; j < bodyStartPatterns.length; j++) {
          const m = t.match(bodyStartPatterns[j]);
          if (m) {
            const idx = t.indexOf(m[0]);
            if (idx > 0) {
              const body = t.slice(idx + 1).trim();
              if (body.length >= 100) {
                return this.stripTrailingThinking(body);
              }
            }
          }
        }
      }
    }

    // 优先处理模型常见的「草稿」/「最终文案」段落：
    // 例如：6. **润色语言：** / *草稿：* / 草稿: / 草稿：
    // 这里直接抽取「草稿」之后的正文作为最终提示词主体。
    const draftPatterns = [
      /[*_]*草稿[*_]*[：:]\s*/m,
      /[*_]*最终文案[*_]*[：:]\s*/m,
      /[*_]*最终提示词[*_]*[：:]\s*/m
    ];
    for (let i = 0; i < draftPatterns.length; i++) {
      const m = t.match(draftPatterns[i]);
      if (m) {
        const idx = t.indexOf(m[0]);
        if (idx >= 0) {
          let body = t.slice(idx + m[0].length).trim();
          if (body) {
            return this.stripTrailingThinking(body);
          }
        }
      }
    }
    const markers = [
      /\n①\s*跳转逻辑/m,
      /\n\*\*①\s*跳转逻辑\*\*/m,
      /\n跳转逻辑[：:]/m,
      /\n\*\*跳转逻辑\*\*/m,
      /^①\s*跳转逻辑/m,
      /^跳转逻辑[：:]/m,
      /\n②\s*功能与配置/m,
      /\n\*\*②\s*功能与配置\*\*/m,
      /\n扩写正文[：:]\s*\n/m,
      /\n以下为扩写/m,
      /\n【跳转逻辑】/m,
      /\n3\.\s*\*\*扩写/m,
      /\n3\.\s*扩写/m,
      /\n2\.\s*\*\*扩写/m,
      /\n\*\*扩写正文\*\*/m,
      /\n从「本界面」/m,
      /\n从「.*」→/m,
      /\n\*\*跳转逻辑\*\*[：:]/m,
      /\n#\s+跳转逻辑/m,
      /\n##\s+跳转逻辑/m
    ];
    for (let i = 0; i < markers.length; i++) {
      const m = t.match(markers[i]);
      if (m) {
        const idx = t.indexOf(m[0]);
        if (idx >= 0) {
          const rest = (m[0].startsWith('\n') ? t.slice(idx + 1) : t.slice(idx)).trim();
          if (rest.length >= 80) return this.stripTrailingThinking(rest);
        }
      }
    }
    const hasPromptPrefix = /^(1\.\s*\*\*分析(请求|需求)|分析(请求|需求)|【分析(请求|需求)】|2\.\s*\*\*分析输入数据)/m.test(t);
    if (hasPromptPrefix) {
      const lines = t.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const looksLikeBody = /^①|^②|^③|^④|^跳转逻辑|^功能与配置|^布局[：:]|^状态[：:]|^\*\*跳转逻辑\*\*|^从「|^3\.|^#\s+跳转|^##\s+跳转|^\*\*扩写正文\*\*|^本界面/.test(line) && line.length > 2;
        if (looksLikeBody) return this.stripTrailingThinking(lines.slice(i).join('\n').trim());
        if (/^[二三3]\.[\s\S]*扩写|^\*\*扩写/.test(line) && line.length > 4) return this.stripTrailingThinking(lines.slice(i).join('\n').trim());
        if (/从「.+」\s*→/.test(line) && line.length > 10) return this.stripTrailingThinking(lines.slice(i).join('\n').trim());
      }
      const idx3 = t.search(/\n[23]\.\s*\*\*?扩写/);
      if (idx3 >= 0) {
        const lineEnd = t.indexOf('\n', idx3 + 1);
        const after = (lineEnd >= 0 ? t.slice(lineEnd + 1) : t.slice(idx3)).trim();
        if (after.length >= 80) return this.stripTrailingThinking(after);
      }
      const idxJump = t.search(/\n从「.+」\s*→/);
      if (idxJump >= 0) {
        const after = t.slice(idxJump + 1).trim();
        if (after.length >= 80) return this.stripTrailingThinking(after);
      }
    }
    return this.stripTrailingThinking(content);
  },

  /**
   * 粗略判断一段提示词是否可能在句子中间被截断
   * 主要依据：结尾是明显“还没说完”的符号，或中英文引号不成对
   * @param {string} text
   * @returns {boolean}
   */
  isLikelyTruncated(text) {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (!trimmed) return false;
    const lastChar = trimmed[trimmed.length - 1];
    const suspiciousEnd = /[，、：:（(【\[“"']$/.test(lastChar);
    const leftCNQuotes = (trimmed.match(/“/g) || []).length;
    const rightCNQuotes = (trimmed.match(/”/g) || []).length;
    const hasUnbalancedCNQuotes = leftCNQuotes > rightCNQuotes;
    return suspiciousEnd || hasUnbalancedCNQuotes;
  },

  /**
   * 当检测到正文疑似被截断时，请求 AI 继续补完后半段内容
   * @param {string} baseText - 已生成的前半段提示词
   * @param {object} ctx - 卡片上下文（来自 getCardExpandContext / getCardExpandContextForCard）
   * @param {object} config - API 配置
   * @param {string} runId - 日志 runId（区分调用场景）
   * @returns {Promise<string|null>} 续写正文；失败返回 null
   */
  async continueExpandedDescription(baseText, ctx, config, runId) {
    if (!baseText || !ctx || !config?.apiKey || !config?.baseUrl) return null;

    const { card, collection, levelText } = ctx;
    const tailPreview = baseText.slice(-400);

    const prompt = `你刚刚为下面这个界面写了一段用于生成低保真原型图的中文提示词，但系统怀疑内容在句子中间被截断了。

【界面信息】
- 标题：${card.title || '未命名'}
- 界面层级：${levelText || '未指定'}
- 所属集合：${collection?.title || '未指定'}

【已生成的部分（请不要重复）】
${tailPreview}

请从这段文字的结尾继续往后补写，完成剩余区域和组件的描述：
- 不要重复已生成的句子和段落；
- 不要重新写“分析请求”“分析输入数据”等说明文字；
- 直接续写提示词正文即可，风格与前文保持一致。`;

    try {
      const response = await GUXY.Utils.callAIModel(
        config.model || 'glm-4-flash',
        config.apiKey.trim(),
        config.baseUrl.trim(),
        [{ role: 'user', content: prompt }]
      );

      let more = (response.content || '').trim();
      if (!more) return null;
      more = this.stripPromptFromExpandContent(more).trim();
      if (!more) return null;
      return more;
    } catch (e) {
      console.warn('continueExpandedDescription failed:', e);
      return null;
    }
  },

  /**
   * 一键 AI 改写卡片描述（仅卡片）
   * 将当前描述改写为可用于生成低保真原型图的提示词：
   * - 界面区域划分
   * - 每个区域里的组件与信息
   * - 每个信息和组件的位置
   * - 每个信息和组件的大小、字号
   */
  async expandCardDescription() {
    if (this.nodeType !== 'card' || !this.currentNode) return;
    
    if (!GUXY.ApiConfig?.isConfigured?.()) {
      GUXY.Toast?.show('请先在侧栏配置 API 后再使用 AI 改写', 'error');
      if (GUXY.ApiConfig?.showConfigModal) GUXY.ApiConfig.showConfigModal();
      return;
    }
    
    const ctx = this.getCardExpandContext();
    if (!ctx) {
      GUXY.Toast?.show('无法获取当前卡片上下文', 'error');
      return;
    }
    
    const btn = this.container.querySelector('#btn-ai-expand-desc');
    const textarea = this.container.querySelector('#detail-body');
    if (!textarea) return;
    
    const originalText = btn?.textContent || '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = '改写中…';
    }
    
    try {
      if (GUXY.State?.loadConfig) GUXY.State.loadConfig();
      const config = GUXY.State?.config?.api;
      if (!config?.apiKey || !config?.baseUrl) {
        throw new Error('请先配置 API');
      }
      
      const { card, collection, linksOut, linksIn, sameCollectionCards, levelText } = ctx;
      const currentDesc = (card.body || card.description || '').trim();
      
      const linksOutText = linksOut.length
        ? linksOut.map(l => `从「本界面」→「${l.targetTitle}」：${l.label || '跳转'}`).join('\n')
        : '（无出线）';
      const linksInText = linksIn.length
        ? linksIn.map(l => `从「${l.sourceTitle}」→「本界面」：${l.label || '进入'}`).join('\n')
        : '（无入线）';
      const siblingsText = sameCollectionCards.length ? sameCollectionCards.join('、') : '（无）';
      
      const prompt = `你是一名低保真原型图的提示词工程师，请根据下面「当前界面」的信息，将现有描述改写为一段（或数段）用于生成低保真界面的中文提示词，重点落在界面布局与组件信息上。

【严禁出现的通用模板内容】
- 除非当前界面的标题或描述中明确涉及「道具」「背包」「道具栏」等，否则一律禁止出现：道具栏、道具背包、640×600（或 640*600）等尺寸描述。
- 禁止对每个区域都机械地写上「选中状态、置灰状态、锁定状态」三段式。只对真正需要这些状态的组件写对应状态；不需要的组件不写，或只写该组件实际存在的状态（如标题区只需写默认显示即可）。
- 若当前界面是纯信息展示（如套装词条、说明页、结果页），布局可能只有标题区、内容区、返回按钮等，不要强行加入道具栏或背包。

【改写须覆盖以下信息要点，内容必须全部来自对当前界面的推断，不得套用模板】

① 界面区域划分：按顶部导航区、主内容区、底部按钮区、侧边栏、弹窗浮层等方式，将界面切分为若干区域，并说明每个区域在整个界面中的大致位置（如“屏幕顶部窄条区域”“屏幕中部大面积内容区”“底部固定按钮条”）和宽高或占比（可以用像素或“约占屏幕上方 1/5 高度”这类描述）。

② 区域内的组件与信息：针对每个区域，列出其中包含的关键 UI 组件和文案信息，例如：标题文字、副标题、标签、图标、列表项、卡片、输入框、单选 / 多选框、切换开关、操作按钮、分页器、提示文案等。

③ 组件与信息的位置：对每个重要组件和信息，说明其在界面或所属区域中的相对位置，例如“位于顶部居中”“靠左对齐，距离左边缘一小段内边距”“出现在列表每一行的最右侧”“悬浮在内容区右下角”等。

④ 组件与信息的大小与字号：描述不同层级文本和组件的大致尺寸与层级关系，例如“主标题为较大的粗体文字”“副标题为中号文字”“标签为小字号文字”“主要操作按钮高度略大、宽度占满一行”“次级按钮较窄较小”等，可以用相对描述或大致像素高度（如“按钮高度约 48px”）。

【当前界面信息】
- 标题：${card.title || '未命名'}
- 当前描述：${currentDesc || '（暂无）'}
- 界面层级：${levelText}
- 所属集合：${collection?.title || '未指定'}

【从本界面出发的连线】
${linksOutText}

【进入本界面的连线】
${linksInText}

【同集合内其他界面（标题）】
${siblingsText}

请直接输出改写后的低保真提示词正文，可以使用自然段或有层级的无序列表，但不要输出「①」「②」这类编号标题，也不要输出“分析请求”“分析输入数据”等前后说明。你的回复必须且仅包含用于生成低保真界面的提示词，不要复述本提示。再次强调：若当前界面不涉及道具/背包，整篇描述中不得出现道具栏、640×600、以及道具栏的选中/置灰/锁定等描述。`;
      
      const response = await GUXY.Utils.callAIModel(
        config.model || 'glm-4-flash',
        config.apiKey.trim(),
        config.baseUrl.trim(),
        [{ role: 'user', content: prompt }],
        { max_tokens: 4000, temperature: 0.7 }
      );
      
      let content = (response.content || '').trim();
      if (!content) {
        GUXY.Toast?.show('AI 未返回有效内容', 'error');
        return;
      }
      content = this.stripPromptFromExpandContent(content);
      if (!content.trim()) {
        GUXY.Toast?.show('AI 未返回有效提示词', 'error');
        return;
      }
      let finalContent = content;

      if (this.isLikelyTruncated(finalContent)) {
        const more = await this.continueExpandedDescription(finalContent, ctx, config, 'pre-fix');
        if (more) {
          finalContent = `${finalContent}\n${more}`.trim();
        }
      }

      textarea.value = finalContent;
      this.resizeDetailBody();
      this.saveBody();
      GUXY.Toast?.show('描述已改写并保存（低保真提示词）', 'success');
    } catch (err) {
      console.error('AI 改写失败:', err);
      GUXY.Toast?.show(err.message || 'AI 改写失败，请重试', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  },
  
  /**
   * 对单张卡片调用 AI 改写并返回新描述（供子画布一键改写等调用）
   * @param {object} card - 卡片对象
   * @param {object} arch - 架构数据
   * @returns {Promise<string|null>} 改写后的提示词描述，失败返回 null
   */
  async expandCardDescriptionWithAI(card, arch) {
    const ctx = this.getCardExpandContextForCard(card, arch);
    if (!ctx) return null;
    if (GUXY.State?.loadConfig) GUXY.State.loadConfig();
    const config = GUXY.State?.config?.api;
    if (!config?.apiKey || !config?.baseUrl) return null;
    const { card: c, collection, linksOut, linksIn, sameCollectionCards, levelText } = ctx;
    const currentDesc = (c.body || c.description || '').trim();
    const linksOutText = linksOut.length ? linksOut.map(l => `从「本界面」→「${l.targetTitle}」：${l.label || '跳转'}`).join('\n') : '（无出线）';
    const linksInText = linksIn.length ? linksIn.map(l => `从「${l.sourceTitle}」→「本界面」：${l.label || '进入'}`).join('\n') : '（无入线）';
    const siblingsText = sameCollectionCards.length ? sameCollectionCards.join('、') : '（无）';
    const prompt = `你是一名低保真原型图的提示词工程师，请根据下面「当前界面」的信息，将现有描述改写为一段（或数段）用于生成低保真界面的中文提示词，重点落在界面布局与组件信息上。

【严禁出现的通用模板内容】
- 除非当前界面的标题或描述中明确涉及「道具」「背包」「道具栏」等，否则一律禁止出现：道具栏、道具背包、640×600（或 640*600）等尺寸描述。
- 禁止对每个区域都机械地写上「选中状态、置灰状态、锁定状态」三段式。只对真正需要这些状态的组件写对应状态；不需要的组件不写，或只写该组件实际存在的状态（如标题区只需写默认显示即可）。
- 若当前界面是纯信息展示（如套装词条、说明页、结果页），布局可能只有标题区、内容区、返回按钮等，不要强行加入道具栏或背包。

【改写须覆盖以下信息要点，内容必须全部来自对当前界面的推断，不得套用模板】

① 界面区域划分：按顶部导航区、主内容区、底部按钮区、侧边栏、弹窗浮层等方式，将界面切分为若干区域，并说明每个区域在整个界面中的大致位置和宽高或占比。
② 区域内的组件与信息：针对每个区域，列出其中包含的关键 UI 组件和文案信息（标题、副标题、标签、图标、列表项、输入框、按钮等）。
③ 组件与信息的位置：对每个重要组件和信息，说明其在界面或所属区域中的相对位置（例如顶部居中、靠左对齐、行尾图标、右下角悬浮按钮等）。
④ 组件与信息的大小与字号：描述不同层级文本和组件的大致尺寸与层级关系（例如主标题大号粗体、正文中号、标签小号；主按钮更大更宽，次要按钮更小更窄，可给出大致像素高度）。

【当前界面信息】
- 标题：${c.title || '未命名'}
- 当前描述：${currentDesc || '（暂无）'}
- 界面层级：${levelText}
- 所属集合：${collection?.title || '未指定'}

【从本界面出发的连线】\n${linksOutText}
【进入本界面的连线】\n${linksInText}
【同集合内其他界面（标题）】\n${siblingsText}

请直接输出改写后的低保真提示词正文，可以使用自然段或有层级的无序列表，但不要输出「①」「②」这类编号标题，也不要输出“分析请求”“分析输入数据”等前后说明。你的回复必须且仅包含用于生成低保真界面的提示词，不要复述本提示。若当前界面不涉及道具/背包，整篇描述中不得出现道具栏、640×600、以及道具栏的选中/置灰/锁定等描述。`;
    try {
      const response = await GUXY.Utils.callAIModel(
        config.model || 'glm-4-flash',
        config.apiKey.trim(),
        config.baseUrl.trim(),
        [{ role: 'user', content: prompt }],
        { max_tokens: 4000, temperature: 0.7 }
      );
      let content = (response.content || '').trim();
      if (content) content = this.stripPromptFromExpandContent(content);
      if (!content) return null;

      let finalContent = content;
      if (this.isLikelyTruncated(finalContent)) {
        const more = await this.continueExpandedDescription(finalContent, ctx, config, 'pre-fix');
        if (more) {
          finalContent = `${finalContent}\n${more}`.trim();
        }
      }

      return finalContent || null;
    } catch (err) {
      console.error('AI 改写失败:', err);
      return null;
    }
  },

  /**
   * 保存模块类型
   */
  saveModuleType() {
    const select = this.container.querySelector('#detail-module-type');
    if (!select || select.disabled) return;
    
    const moduleType = select.value;
    if (this.currentNode) {
      this.currentNode.module_type = moduleType;
      this.updateNodeData();
      
      // 更新画布上的节点显示
      if (GUXY.CanvasNodes) {
        const nodeEl = GUXY.CanvasNodes.getNodeElement(this.currentNode.id.startsWith(this.nodeType + '-') ? this.currentNode.id : `${this.nodeType}-${this.currentNode.id}`);
        if (nodeEl) {
          // 更新模块图标
          const iconEl = nodeEl.querySelector('.module-icon');
          const MODULE_ICONS = {
            system: '⚙',
            combat: '⚔',
            story: '📖',
            level: '🎯'
          };
          if (iconEl) {
            iconEl.textContent = MODULE_ICONS[moduleType] || MODULE_ICONS.system;
          }
        }
      }
    }
  },
  
  /**
   * 保存界面层级
   */
  saveInterfaceLevel() {
    const select = this.container.querySelector('#detail-interface-level');
    if (!select || select.disabled) return;
    
    const level = parseInt(select.value, 10);
    if (this.currentNode) {
      this.currentNode.interface_level = level;
      this.updateNodeData();
      
      // 如果在子画布中，重新布局
      if (GUXY.State?.canvasScope === 'collection' && GUXY.SubCanvas) {
        GUXY.SubCanvas.render();
      }
    }
  },
  
  /**
   * 切换标记
   */
  toggleMark() {
    if (this.currentNode) {
      this.currentNode.marked = !this.currentNode.marked;
      this.updateNodeData();
      
      // 更新画布显示
      if (GUXY.CanvasNodes) {
        const nodeEl = GUXY.CanvasNodes.getNodeElement(this.currentNode.id.startsWith(this.nodeType + '-') ? this.currentNode.id : `${this.nodeType}-${this.currentNode.id}`);
        if (nodeEl) {
          if (this.currentNode.marked) {
            nodeEl.classList.add('marked');
          } else {
            nodeEl.classList.remove('marked');
          }
        }
      }
      
      this.render();
      this.bindEvents();
      this.loadCommentsAndAttachments();
    }
  },
  
  /**
   * 切换锁定
   */
  toggleLock() {
    if (this.currentNode) {
      this.currentNode.locked = !this.currentNode.locked;
      this.updateNodeData();
      
      // 更新画布显示
      if (GUXY.CanvasNodes) {
        const nodeEl = GUXY.CanvasNodes.getNodeElement(this.currentNode.id.startsWith(this.nodeType + '-') ? this.currentNode.id : `${this.nodeType}-${this.currentNode.id}`);
        if (nodeEl) {
          if (this.currentNode.locked) {
            nodeEl.classList.add('locked');
          } else {
            nodeEl.classList.remove('locked');
          }
        }
      }
      
      this.render();
      this.bindEvents();
      this.loadCommentsAndAttachments();
    }
  },
  
  /**
   * 删除节点
   */
  async deleteNode() {
    if (!confirm(`确定要删除这个${this.nodeType === 'card' ? '卡片' : '集合'}吗？`)) {
      return;
    }
    
    try {
      const nodeId = this.currentNode.id;
      const fullNodeId = nodeId.startsWith(this.nodeType + '-') ? nodeId : `${this.nodeType}-${nodeId}`;
      
      // 从架构中删除节点
      if (GUXY.State?.currentProject?.architecture) {
        const arch = GUXY.State.currentProject.architecture;
        if (this.nodeType === 'card') {
          arch.cards = arch.cards?.filter(c => c.id !== nodeId) || [];
          // 删除相关连线
          if (arch.cardLinks) {
            arch.cardLinks = arch.cardLinks.filter(link => 
              link.from_card_id !== nodeId && link.to_card_id !== nodeId
            );
          }
          if (arch.cardCollectionLinks) {
            arch.cardCollectionLinks = arch.cardCollectionLinks.filter(link => 
              link.from_card_id !== nodeId && link.to_card_id !== nodeId
            );
          }
        } else {
          arch.collections = arch.collections?.filter(c => c.id !== nodeId) || [];
          // 删除相关连线
          if (arch.collectionLinks) {
            arch.collectionLinks = arch.collectionLinks.filter(link => 
              link.from_collection_id !== nodeId && link.to_collection_id !== nodeId
            );
          }
          if (arch.cardCollectionLinks) {
            arch.cardCollectionLinks = arch.cardCollectionLinks.filter(link => 
              link.from_collection_id !== nodeId && link.to_collection_id !== nodeId
            );
          }
        }
        
        // 删除相关连线
        if (arch.edges) {
          arch.edges = arch.edges.filter(edge => 
            edge.source !== fullNodeId && edge.target !== fullNodeId
          );
        }
        
        GUXY.State.saveToStorage();
      }
      
      // 从画布移除
      if (GUXY.CanvasNodes) {
        GUXY.CanvasNodes.removeNode(fullNodeId);
      }
      
      // 删除相关连线
      if (GUXY.CanvasEdges) {
        const edgesToRemove = [];
        GUXY.CanvasEdges.edgeMap.forEach((path, edgeId) => {
          const source = path.getAttribute('data-source');
          const target = path.getAttribute('data-target');
          if (source === fullNodeId || target === fullNodeId) {
            edgesToRemove.push(edgeId);
          }
        });
        edgesToRemove.forEach(edgeId => {
          GUXY.CanvasEdges.removeEdge(edgeId);
        });
      }
      
      this.hide();
      
      // 刷新侧栏以更新统计信息
      if (GUXY.Sidebar) {
        GUXY.Sidebar.refresh();
      }
      
      GUXY.Toast?.show('删除成功', 'success');
    } catch (error) {
      console.error('Delete node error:', error);
      GUXY.Toast?.show('删除失败', 'error');
    }
  },
  
  /**
   * 打开集合画布
   */
  openCollectionCanvas() {
    if (this.nodeType === 'collection' && GUXY.SubCanvas) {
      const collectionId = this.currentNode.id.startsWith('collection-') 
        ? this.currentNode.id.replace('collection-', '') 
        : this.currentNode.id;
      GUXY.SubCanvas.open(collectionId);
      this.hide(); // 关闭侧栏
    }
  },
  
  /**
   * 更新节点数据
   */
  updateNodeData() {
    if (!GUXY.State?.currentProject?.architecture) return;
    
    const arch = GUXY.State.currentProject.architecture;
    
    if (this.nodeType === 'card') {
      const index = arch.cards?.findIndex(c => c.id === this.currentNode.id);
      if (index !== undefined && index >= 0) {
        // 合并更新，保留原有字段
        arch.cards[index] = { 
          ...arch.cards[index], 
          ...this.currentNode,
          description: this.currentNode.body || this.currentNode.description,
          body: this.currentNode.body || this.currentNode.description
        };
      }
    } else {
      const index = arch.collections?.findIndex(c => c.id === this.currentNode.id);
      if (index !== undefined && index >= 0) {
        arch.collections[index] = { ...arch.collections[index], ...this.currentNode };
      }
    }
    
    GUXY.State.saveToStorage();
    
    // 更新画布显示
    if (GUXY.CanvasNodes) {
      GUXY.CanvasNodes.updateNode(this.currentNode.id, this.currentNode);
    }
  },
  
  /**
   * 隐藏侧栏
   */
  hide() {
    this.currentNode = null;
    this.nodeType = null;
    if (this.container) {
      this.container.classList.remove('active');
      this.container.innerHTML = '';
    }
  },
  
  /**
   * 转义HTML
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 生成低保真原型图
   */
  async generateLowFiImage() {
    if (!GUXY.LowFiGeneration) {
      GUXY.Toast?.show('LowFiGeneration模块未加载', 'error');
      return;
    }

    if (this.nodeType !== 'card' || !this.currentNode) {
      GUXY.Toast?.show('只支持为卡片生成低保真图', 'warning');
      return;
    }

    const cardId = this.currentNode.id;

    try {
      await GUXY.LowFiGeneration.generateForCard(cardId);
      // 更新详情页显示
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('生成低保真图失败:', error);
    }
  },

  /**
   * 显示低保真大图模态框
   */
  showLowFiImageModal() {
    if (!this.currentNode?.lowFiImage) {
      return;
    }

    const lowFiData = this.currentNode.lowFiImage;

    if (!GUXY.Modal) {
      console.warn('Modal module not available');
      return;
    }

    const content = `
      <div class="lowfi-modal-content">
        <img src="${lowFiData.dataUrl}" class="lowfi-full-image" alt="低保真原型图" />
        <div class="lowfi-info">
          <p><strong>尺寸:</strong> ${lowFiData.width} × ${lowFiData.height}px</p>
          <p><strong>生成时间:</strong> ${new Date(lowFiData.generatedAt).toLocaleString()}</p>
          ${lowFiData.revisedPrompt ? `<p><strong>优化Prompt:</strong> ${this.escapeHtml(lowFiData.revisedPrompt.substring(0, 100))}...</p>` : ''}
        </div>
      </div>
    `;

    GUXY.Modal.show('低保真原型图', content, {
      size: 'large'
    });
  },

  /**
   * 删除低保真图片
   */
  async deleteLowFiImage() {
    if (!this.currentNode) {
      return;
    }

    if (!confirm('确定要删除低保真原型图吗？')) {
      return;
    }

    const cardId = this.currentNode.id;

    try {
      await GUXY.LowFiGeneration.deleteLowFiImage(cardId);
      // 更新详情页显示
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('删除低保真图失败:', error);
      GUXY.Toast?.show('删除失败', 'error');
    }
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.NodeDetailSidebar;
}
