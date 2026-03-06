/**
 * GUXY UI生成模块
 * 使用Banana Pro API生成高保真UI
 */

GUXY.UIGeneration = {
  /**
   * 初始化UI生成模块
   */
  init() {
    console.log('UIGeneration initialized');
  },
  
  /**
   * 生成高保真UI
   * @param {string} projectId - 项目ID
   * @param {object} options - 生成选项
   * @returns {Promise<object>} 生成结果
   */
  async generateUI(projectId, options = {}) {
    try {
      // 获取项目数据
      const project = await GUXY.DB.getProject(projectId);
      if (!project) {
        throw new Error('项目不存在');
      }
      
      // 检查配置
      const config = GUXY.State?.config?.bananaPro;
      if (!config || !config.endpoint || !config.apiKey) {
        throw new Error('请先配置Banana Pro API');
      }
      
      // 显示加载状态
      GUXY.State?.setLoading(true);
      GUXY.Toast?.show('正在生成高保真UI...', 'info');
      
      // 生成UI描述
      const description = await this.generateUIDescription(project, options);
      
      // 调用Banana Pro API
      const result = await this.callBananaProAPI(description, options);
      
      // 保存生成的UI资源
      const savedResources = await this.saveUIResources(projectId, result);
      
      // 更新工作流程
      if (GUXY.Workflow) {
        GUXY.Workflow.saveStepData(7, {
          uiResources: savedResources,
          generatedAt: new Date().toISOString(),
          options
        });
      }
      
      // 记录日志
      await GUXY.Utils.logWorkflowChange(7, 'ui_generated', {
        resourceCount: savedResources.length,
        options
      });
      
      GUXY.State?.setLoading(false);
      GUXY.Toast?.show('UI生成完成', 'success');
      
      return {
        success: true,
        resources: savedResources,
        description
      };
    } catch (error) {
      GUXY.State?.setLoading(false);
      GUXY.Toast?.show(`UI生成失败: ${error.message}`, 'error');
      console.error('UI Generation error:', error);
      throw error;
    }
  },
  
  /**
   * 生成UI描述
   * @param {object} project - 项目数据
   * @param {object} options - 选项
   * @returns {Promise<string>} UI描述
   */
  async generateUIDescription(project, options) {
    const architecture = project.architecture;
    const workflowData = GUXY.Workflow?.getStepData(4) || {};
    
    let description = `# UI设计规范\n\n`;
    description += `**项目名称**: ${project.name}\n`;
    description += `**项目描述**: ${project.description || '暂无描述'}\n\n`;
    
    description += `## 设计风格\n\n`;
    description += `- 整体风格: ${options.style || '现代简约'}\n`;
    description += `- 主色调: ${options.primaryColor || '#7C3AED'}\n`;
    description += `- 辅助色: ${options.secondaryColor || '#10B981'}\n`;
    description += `- 字体: ${options.font || '系统默认字体'}\n\n`;
    
    description += `## 界面列表\n\n`;
    
    // 从架构生成界面列表
    if (architecture.cards) {
      const uiCards = architecture.cards.filter(card => 
        ['ui', 'system', 'level'].includes(card.type)
      );
      
      uiCards.forEach((card, index) => {
        description += `### ${index + 1}. ${card.title}\n\n`;
        description += `**类型**: ${card.type}\n`;
        description += `**描述**: ${card.description || '无描述'}\n\n`;
        description += `**需要的状态**:\n`;
        description += `- default: 默认状态\n`;
        description += `- hover: 悬停状态\n`;
        description += `- pressed: 按下状态\n`;
        description += `- disabled: 禁用状态\n\n`;
      });
    }
    
    // 添加参考资源
    if (options.referenceResources) {
      description += `## 参考资源\n\n`;
      description += options.referenceResources.map(ref => 
        `- ${ref.type}: ${ref.description}\n`
      ).join('');
      description += '\n';
    }
    
    // 添加生成要求
    description += `## 生成要求\n\n`;
    description += `- 分辨率: ${options.resolution || '2x'} 实际尺寸\n`;
    description += `- 格式: PNG\n`;
    description += `- 背景: 透明或白色\n`;
    description += `- 所有界面都需要生成6种状态\n`;
    description += `- 保持设计一致性\n`;
    description += `- 遵循游戏交互规范\n\n`;
    
    return description;
  },
  
  /**
   * 调用Banana Pro API
   * @param {string} description - UI描述
   * @param {object} options - 选项
   * @returns {Promise<object>} API响应
   */
  async callBananaProAPI(description, options) {
    const config = GUXY.State?.config?.bananaPro;
    
    const requestBody = {
      prompt: description,
      style: options.style || 'modern',
      resolution: options.resolution || '2x',
      states: ['default', 'hover', 'pressed', 'disabled', 'loading', 'error'],
      quality: 'high'
    };
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API请求失败');
    }
    
    return await response.json();
  },
  
  /**
   * 保存UI资源
   * @param {string} projectId - 项目ID
   * @param {object} result - API响应结果
   * @returns {Promise<Array>} 保存的资源列表
   */
  async saveUIResources(projectId, result) {
    const resources = [];
    
    if (result.images && Array.isArray(result.images)) {
      for (const [index, image] of result.images.entries()) {
        const resource = {
          id: GUXY.Utils.uid(),
          type: 'ui-mockup',
          name: `ui_${index + 1}`,
          state: image.state || 'default',
          url: image.url,
          dataUrl: image.dataUrl,
          width: image.width || 0,
          height: image.height || 0,
          createdAt: new Date().toISOString()
        };
        
        // 保存到IndexedDB
        await GUXY.DB.addResource({
          projectId,
          ...resource
        });
        
        resources.push(resource);
      }
    }
    
    return resources;
  },
  
  /**
   * 获取项目的UI资源
   * @param {string} projectId - 项目ID
   * @returns {Promise<Array>} UI资源列表
   */
  async getUIResources(projectId) {
    return await GUXY.DB.getResources(projectId, 'ui-mockup');
  },

  /**
   * 弹出窗口展示项目的 UI 资源概览
   * @param {string} projectId - 项目ID
   */
  async showUIResources(projectId) {
    const resources = await this.getUIResources(projectId);
    if (!resources.length) {
      GUXY.Toast?.show('当前项目还没有生成的 UI 资源', 'info');
      return;
    }

    if (!GUXY.Modal) {
      console.warn('Modal module not available');
      return;
    }

    const itemsHtml = resources
      .map(
        (r) => `
      <div class="ui-resource-item">
        ${
          r.dataUrl
            ? `<img src="${r.dataUrl}" alt="${r.name}" style="max-width:160px;max-height:100px;object-fit:contain;">`
            : ''
        }
        <div class="ui-resource-meta">
          <p><strong>${r.name}</strong> (${r.state || 'default'})</p>
          <p>尺寸: ${r.width || '-'} x ${r.height || '-'}</p>
          ${r.url ? `<p>URL: <a href="${r.url}" target="_blank">${r.url}</a></p>` : ''}
        </div>
      </div>
    `
      )
      .join('');

    const html = `
      <div class="ui-resource-list" style="display:flex;flex-direction:column;gap:12px;max-height:70vh;overflow:auto;">
        ${itemsHtml}
      </div>
    `;

    GUXY.Modal.show('UI 资源列表', html);
  },
  
  /**
   * 导出UI资源
   * @param {string} projectId - 项目ID
   * @param {string} format - 导出格式（zip, json）
   */
  async exportUIResources(projectId, format = 'json') {
    const resources = await this.getUIResources(projectId);
    
    if (!resources.length) {
      GUXY.Toast?.show('没有可导出的UI资源', 'warning');
      return;
    }
    
    if (format === 'json') {
      const data = JSON.stringify(resources, null, 2);
      GUXY.Utils.downloadFile(data, `ui_resources_${Date.now()}.json`, 'application/json');
    } else if (format === 'zip') {
      // 需要使用JSZip库，这里简化处理
      GUXY.Toast?.show('ZIP导出功能开发中', 'info');
      return;
    }
    
    GUXY.Toast?.show('UI资源已导出', 'success');
  },
  
  /**
   * 预览UI资源
   * @param {string} resourceId - 资源ID
   */
  async previewUIResource(resourceId) {
    const resource = await GUXY.DB.getResources?.(resourceId);
    
    if (!resource) {
      GUXY.Toast?.show('资源不存在', 'error');
      return;
    }
    
    // 创建预览模态框
    const modal = GUXY.Modal;
    if (modal) {
      const content = `
        <div class="ui-preview">
          <img src="${resource.dataUrl}" alt="${resource.name}" style="max-width: 100%; max-height: 70vh;">
          <div class="ui-preview-info">
            <p><strong>名称:</strong> ${resource.name}</p>
            <p><strong>状态:</strong> ${resource.state}</p>
            <p><strong>尺寸:</strong> ${resource.width} x ${resource.height}</p>
          </div>
        </div>
      `;
      
      modal.show('UI预览', content);
    }
  },
  
  /**
   * 删除UI资源
   * @param {string} resourceId - 资源ID
   */
  async deleteUIResource(resourceId) {
    await GUXY.DB.deleteResource(resourceId);
    GUXY.Toast?.show('资源已删除', 'success');
    
    // 记录日志
    await GUXY.Utils.logWorkflowChange(7, 'ui_resource_deleted', {
      resourceId
    });
  },
  
  /**
   * 批量生成所有界面状态
   * @param {string} projectId - 项目ID
   * @returns {Promise<object>} 生成结果
   */
  async generateAllStates(projectId) {
    const states = ['default', 'hover', 'pressed', 'disabled', 'loading', 'error'];
    const results = {};
    
    for (const state of states) {
      try {
        results[state] = await this.generateUI(projectId, { states: [state] });
      } catch (error) {
        results[state] = { success: false, error: error.message };
      }
    }
    
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = Object.keys(results).length;
    
    if (successCount === totalCount) {
      GUXY.Toast?.show('所有状态生成完成', 'success');
    } else {
      GUXY.Toast?.show(`${successCount}/${totalCount}状态生成成功`, 'warning');
    }
    
    return results;
  },
  
  /**
   * 获取UI生成统计
   * @param {string} projectId - 项目ID
   * @returns {Promise<object>} 统计信息
   */
  async getUIStats(projectId) {
    const resources = await this.getUIResources(projectId);
    
    const stats = {
      total: resources.length,
      byState: {},
      bySize: {},
      totalSize: 0
    };
    
    resources.forEach(resource => {
      // 按状态统计
      const state = resource.state || 'unknown';
      stats.byState[state] = (stats.byState[state] || 0) + 1;
      
      // 按尺寸统计
      const sizeKey = `${resource.width}x${resource.height}`;
      stats.bySize[sizeKey] = (stats.bySize[sizeKey] || 0) + 1;
    });
    
    return stats;
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.UIGeneration;
}
