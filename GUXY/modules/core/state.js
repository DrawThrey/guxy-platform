/**
 * GUXY状态管理
 * 管理应用的全局状态
 */

GUXY.State = {
  // 当前项目
  currentProject: null,
  
  // 项目列表
  projects: [],
  
  // 工作流程状态
  workflow: {
    currentStep: 1,
    completedSteps: [],
    stepData: {}
  },
  
  // 画布状态
  canvas: {
    zoom: 1,
    panX: 0,
    panY: 0,
    selectedNodes: [],
    selectedEdges: []
  },
  
  // 配置状态
  config: {
    api: {
      // 默认使用平台配置中推荐的GLM-4 Flash模型
      model: 'glm-4-flash',
      apiKey: '',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4'
    },
    visualModel: {
      // 视觉模型配置（用于交互规范分析）
      model: '',
      apiKey: '',
      baseUrl: ''
    },
    imageModel: {
      // 生图模型配置（用于低保真原型图生成）
      // provider: 'openai' | 'comfyui'
      provider: 'openai',
      // requestMode: 'openai' | 'post'
      // - openai：按 OpenAI Image API 兼容格式发送（需要 model）
      // - post：仅 POST 通用 JSON（不包含 model 字段）
      requestMode: 'openai',
      model: '',
      apiKey: '',
      baseUrl: '',
      // ComfyUI 专用字段
      comfyBaseUrl: '',
      comfyWorkflow: {
        fileName: '',
        content: '',
        uploadedAt: ''
      }
    },
    interactionSpecFile: {
      // 交互规范MD文件配置
      fileName: '',
      content: '',
      uploadedAt: ''
    },
    bananaPro: {
      endpoint: '',
      apiKey: ''
    }
  },
  
  // 应用状态
  app: {
    isInitialized: false,
    currentView: 'list', // 'list' or 'canvas'
    isLoading: false,
    error: null
  },
  
  /**
   * 初始化状态
   */
  init() {
    this.loadFromStorage();
    this.loadConfig();
  },
  
  /**
   * 从本地存储加载状态
   */
  loadFromStorage() {
    try {
      // 加载项目列表
      const projects = localStorage.getItem(GUXY.Constants.STORAGE_KEYS.PROJECTS);
      if (projects) {
        this.projects = JSON.parse(projects);
      }
      
      // 加载当前项目
      const currentProject = localStorage.getItem(GUXY.Constants.STORAGE_KEYS.CURRENT_PROJECT);
      if (currentProject) {
        this.currentProject = JSON.parse(currentProject);
      }
      
      // 加载工作流程状态
      const workflow = localStorage.getItem(GUXY.Constants.STORAGE_KEYS.WORKFLOW_STATE);
      if (workflow) {
        this.workflow = JSON.parse(workflow);
      }
      
      // 加载配置
      const settings = localStorage.getItem(GUXY.Constants.STORAGE_KEYS.SETTINGS);
      if (settings) {
        Object.assign(this, JSON.parse(settings));
      }
    } catch (error) {
      console.error('Failed to load state from storage:', error);
    }
  },
  
  /**
   * 保存状态到本地存储
   */
  saveToStorage() {
    try {
      // 保存项目列表
      localStorage.setItem(
        GUXY.Constants.STORAGE_KEYS.PROJECTS,
        JSON.stringify(this.projects)
      );
      
      // 保存当前项目
      if (this.currentProject) {
        localStorage.setItem(
          GUXY.Constants.STORAGE_KEYS.CURRENT_PROJECT,
          JSON.stringify(this.currentProject)
        );
      }
      
      // 保存工作流程状态
      localStorage.setItem(
        GUXY.Constants.STORAGE_KEYS.WORKFLOW_STATE,
        JSON.stringify(this.workflow)
      );
      
      // 保存配置
      localStorage.setItem(
        GUXY.Constants.STORAGE_KEYS.SETTINGS,
        JSON.stringify({
          workflow: this.workflow,
          config: this.config,
          canvas: this.canvas
        })
      );
    } catch (error) {
      console.error('Failed to save state to storage:', error);
    }
  },
  
  /**
   * 加载API配置
   */
  loadConfig() {
    console.log('=== loadConfig 开始 ===');
    try {
      const apiConfigStr = localStorage.getItem(GUXY.Constants.STORAGE_KEYS.API_CONFIG);
      console.log('localStorage中的配置:', apiConfigStr);

      if (apiConfigStr) {
        const savedConfig = JSON.parse(apiConfigStr);
        console.log('解析后的配置:', savedConfig);

        // 如果保存的是整个config对象，则合并
        if (savedConfig.api) {
          Object.assign(this.config.api, savedConfig.api);
          console.log('使用 savedConfig.api');
        } else if (savedConfig.model || savedConfig.apiKey || savedConfig.baseUrl) {
          // 如果保存的是api配置本身，则直接赋值
          Object.assign(this.config.api, savedConfig);
          console.log('使用 savedConfig (直接赋值)');
        }

        // 加载视觉模型配置
        if (savedConfig.visualModel) {
          Object.assign(this.config.visualModel, savedConfig.visualModel);
        }

        // 加载生图模型配置
        if (savedConfig.imageModel) {
          Object.assign(this.config.imageModel, savedConfig.imageModel);
        }

        // 加载交互规范文件配置
        if (savedConfig.interactionSpecFile) {
          Object.assign(this.config.interactionSpecFile, savedConfig.interactionSpecFile);
        }

        // 清理并验证API Key
        if (this.config.api.apiKey) {
          this.config.api.apiKey = this.config.api.apiKey.trim();
          const apiKey = this.config.api.apiKey;

          console.log('✓ API配置已加载:', {
            model: this.config.api.model,
            baseUrl: this.config.api.baseUrl,
            apiKeyPrefix: apiKey.substring(0, 8) + '...',
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey.length,
            containsDot: apiKey.includes('.'),
            endsWithSuffix: apiKey.endsWith('.zhipuai') || apiKey.endsWith('.openai')
          });

          // 智谱AI API Key验证
          if (!apiKey.includes('.')) {
            console.warn('⚠️ 警告：API Key格式可能不正确，智谱AI的API Key通常包含点号分隔符');
          }
        } else {
          console.warn('⚠️ 警告：API Key为空');
        }
      } else {
        console.warn('⚠ localStorage 中没有找到 API 配置');
      }
    } catch (error) {
      console.error('❌ Failed to load config:', error);
    }
    console.log('=== loadConfig 结束 ===\n');
  },
  
  /**
   * 保存API配置
   * @param {object} config - API配置对象
   */
  saveConfig(config) {
    if (!config || typeof config !== 'object') {
      console.error('Invalid config provided to saveConfig:', config);
      return;
    }

    // 确保配置对象结构完整，防止旧数据缺少子配置导致 Object.assign 目标为 null/undefined
    this.config = this.config || {};
    this.config.api = this.config.api || {
      model: 'glm-4-flash',
      apiKey: '',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4'
    };
    this.config.visualModel = this.config.visualModel || {
      model: '',
      apiKey: '',
      baseUrl: ''
    };
    this.config.imageModel = this.config.imageModel || {
      provider: 'openai',
      requestMode: 'openai',
      model: '',
      apiKey: '',
      baseUrl: '',
      comfyBaseUrl: '',
      comfyWorkflow: {
        fileName: '',
        content: '',
        uploadedAt: ''
      }
    };
    this.config.interactionSpecFile = this.config.interactionSpecFile || {
      fileName: '',
      content: '',
      uploadedAt: ''
    };

    // 更新内存中的配置
    if (config.api) {
      Object.assign(this.config.api, config.api);
    }
    if (config.visualModel) {
      Object.assign(this.config.visualModel, config.visualModel);
    }
    if (config.imageModel) {
      Object.assign(this.config.imageModel, config.imageModel);
    }
    if (config.interactionSpecFile) {
      Object.assign(this.config.interactionSpecFile, config.interactionSpecFile);
    }

    // 保存到localStorage
    try {
      localStorage.setItem(
        GUXY.Constants.STORAGE_KEYS.API_CONFIG,
        JSON.stringify({
          api: this.config.api,
          visualModel: this.config.visualModel,
          imageModel: this.config.imageModel,
          interactionSpecFile: this.config.interactionSpecFile
        })
      );
      console.log('API配置已保存到localStorage:', {
        model: this.config.api.model,
        baseUrl: this.config.api.baseUrl,
        hasApiKey: !!this.config.api.apiKey,
        hasVisualModel: !!this.config.visualModel.model,
        hasImageModel: !!this.config.imageModel.model,
        hasInteractionSpec: !!this.config.interactionSpecFile.fileName
      });

      // 验证保存是否成功
      const saved = localStorage.getItem(GUXY.Constants.STORAGE_KEYS.API_CONFIG);
      if (saved) {
        console.log('验证：localStorage中的配置:', JSON.parse(saved));
      } else {
        console.error('验证失败：配置未保存到localStorage');
      }
    } catch (error) {
      console.error('保存API配置到localStorage失败:', error);
      throw error;
    }
  },
  
  /**
   * 创建新项目
   * @param {string} name - 项目名称
   * @param {string} description - 项目描述
   * @returns {object} 新项目对象
   */
  createProject(name, description = '') {
    const project = {
      id: GUXY.Utils.uid(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      architecture: {
        collections: [],
        cards: [],
        edges: []
      },
      workflow: {
        currentStep: 1,
        completedSteps: [],
        stepData: {}
      }
    };
    
    this.projects.push(project);
    this.currentProject = project;
    this.saveToStorage();
    
    return project;
  },
  
  /**
   * 更新项目
   * @param {string} projectId - 项目ID
   * @param {object} updates - 更新内容
   */
  updateProject(projectId, updates) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      Object.assign(project, updates);
      project.updatedAt = new Date().toISOString();
      
      if (this.currentProject && this.currentProject.id === projectId) {
        this.currentProject = project;
      }
      
      this.saveToStorage();
    }
  },
  
  /**
   * 删除项目
   * @param {string} projectId - 项目ID
   */
  deleteProject(projectId) {
    this.projects = this.projects.filter(p => p.id !== projectId);
    
    if (this.currentProject && this.currentProject.id === projectId) {
      this.currentProject = null;
    }
    
    this.saveToStorage();
  },
  
  /**
   * 切换当前项目
   * @param {string} projectId - 项目ID
   */
  switchProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      this.currentProject = project;
      this.workflow = project.workflow || this.workflow;
      this.saveToStorage();
    }
  },
  
  /**
   * 更新工作流程步骤
   * @param {number} step - 步骤号
   * @param {object} data - 步骤数据
   */
  updateWorkflowStep(step, data = {}) {
    this.workflow.currentStep = step;
    this.workflow.stepData[step] = data;
    
    // 更新当前项目的工作流程
    if (this.currentProject) {
      this.currentProject.workflow = this.workflow;
    }
    
    this.saveToStorage();
    
    // 记录变更
    GUXY.Utils.logWorkflowChange(step, 'step_updated', data);
  },
  
  /**
   * 标记步骤为完成
   * @param {number} step - 步骤号
   */
  completeStep(step) {
    if (!this.workflow.completedSteps.includes(step)) {
      this.workflow.completedSteps.push(step);
      this.workflow.stepData[step] = this.workflow.stepData[step] || {};
      this.workflow.stepData[step].completedAt = new Date().toISOString();
      
      if (this.currentProject) {
        this.currentProject.workflow = this.workflow;
      }
      
      this.saveToStorage();
      
      // 记录变更
      GUXY.Utils.logWorkflowChange(step, 'step_completed', {});
    }
  },
  
  /**
   * 更新画布状态
   * @param {object} updates - 更新内容
   */
  updateCanvas(updates) {
    Object.assign(this.canvas, updates);
    this.saveToStorage();
  },
  
  /**
   * 选择节点
   * @param {Array} nodeIds - 节点ID数组
   */
  selectNodes(nodeIds) {
    this.canvas.selectedNodes = nodeIds;
    this.saveToStorage();
  },
  
  /**
   * 选择连线
   * @param {Array} edgeIds - 连线ID数组
   */
  selectEdges(edgeIds) {
    this.canvas.selectedEdges = edgeIds;
    this.saveToStorage();
  },
  
  /**
   * 清除选择
   */
  clearSelection() {
    this.canvas.selectedNodes = [];
    this.canvas.selectedEdges = [];
    this.saveToStorage();
  },
  
  /**
   * 设置加载状态
   * @param {boolean} isLoading - 是否加载中
   */
  setLoading(isLoading) {
    this.app.isLoading = isLoading;
  },
  
  /**
   * 设置错误
   * @param {Error|string} error - 错误信息
   */
  setError(error) {
    this.app.error = error;
  },
  
  /**
   * 清除错误
   */
  clearError() {
    this.app.error = null;
  },
  
  /**
   * 切换视图
   * @param {string} view - 视图名称
   */
  setView(view) {
    this.app.currentView = view;
  },
  
  /**
   * 重置工作流程
   */
  resetWorkflow() {
    this.workflow = {
      currentStep: 1,
      completedSteps: [],
      stepData: {}
    };
    
    if (this.currentProject) {
      this.currentProject.workflow = this.workflow;
    }
    
    this.saveToStorage();
    
    // 记录变更
    GUXY.Utils.logWorkflowChange(1, 'workflow_reset', {});
  },
  
  /**
   * 获取项目统计
   * @param {string} projectId - 项目ID
   * @returns {object} 统计信息
   */
  getProjectStats(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const arch = project.architecture || {};
    return {
      collectionsCount: arch.collections ? arch.collections.length : 0,
      cardsCount: arch.cards ? arch.cards.length : 0,
      edgesCount: arch.edges ? arch.edges.length : 0,
      completedSteps: project.workflow ? project.workflow.completedSteps.length : 0,
      lastUpdated: project.updatedAt
    };
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.State;
}
