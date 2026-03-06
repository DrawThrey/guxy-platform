/**
 * GUXY常量定义
 * 包含应用级别的常量配置
 */

if (!window.GUXY) {
  window.GUXY = {};
}

GUXY.Constants = {
  // 应用信息
  APP_NAME: 'GUXY',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: '游戏交互设计AI工作流平台',
  
  // 数据库
  DB_NAME: 'GUXY_DB',
  DB_VERSION: 2, // 版本升级以支持新表（comments、attachments等）
  
  // 存储键
  STORAGE_KEYS: {
    PROJECTS: 'guxy_projects',
    CURRENT_PROJECT: 'guxy_current_project',
    WORKFLOW_STATE: 'guxy_workflow_state',
    SETTINGS: 'guxy_settings',
    API_CONFIG: 'guxy_api_config',
    VISUAL_MODEL_CONFIG: 'guxy_visual_model_config',
    IMAGE_MODEL_CONFIG: 'guxy_image_model_config',
    INTERACTION_SPEC_FILE: 'guxy_interaction_spec_file'
  },
  
  // 工作流程步骤
  WORKFLOW_STEPS: {
    1: {
      id: 'ai-analysis',
      title: 'AI分析策划案',
      description: '使用AI分析策划案，提取交互逻辑和功能需求',
      icon: '🤖',
      color: '#7C3AED'
    },
    2: {
      id: 'generate-architecture',
      title: '生成卡片架构',
      description: '基于AI分析结果，自动生成卡片和集合架构',
      icon: '📊',
      color: '#8B5CF6'
    },
    3: {
      id: 'adjust-architecture',
      title: '手动调整架构',
      description: '在画布上手动调整节点位置和连线',
      icon: '✏️',
      color: '#A78BFA'
    },
    4: {
      id: 'export-architecture',
      title: '导出AI可读架构',
      description: '将架构导出为AI可读的JSON格式',
      icon: '📤',
      color: '#C4B5FD'
    },
    5: {
      id: 'generate-plan',
      title: '生成开发规划',
      description: '基于架构生成详细的开发任务和计划',
      icon: '📋',
      color: '#6366F1'
    },
    6: {
      id: 'develop-and-verify',
      title: '开发与自检',
      description: '执行开发任务并进行自检验证',
      icon: '🔨',
      color: '#818CF8'
    },
    7: {
      id: 'generate-ui',
      title: '生成高保真UI',
      description: '使用Banana Pro生成高保真UI设计稿',
      icon: '🎨',
      color: '#A5B4FC'
    }
  },
  
  // 节点类型
  NODE_TYPES: {
    COLLECTION: 'collection',
    CARD: 'card',
    SYSTEM: 'system',
    BATTLE: 'battle',
    STORY: 'story',
    LEVEL: 'level',
    UI: 'ui',
    DATA: 'data'
  },
  
  // 节点颜色（终末地配色 — #FFFF0E 黄 + 重色）
  NODE_COLORS: {
    collection: {
      bg: 'transparent',
      border: 'rgba(0, 0, 0, 0.10)'
    },
    card: {
      bg: 'transparent',
      border: '#FFFF0E'
    },
    system: {
      bg: 'transparent',
      border: '#6b6b63'
    },
    battle: {
      bg: 'transparent',
      border: '#FFFF0E'
    },
    story: {
      bg: 'transparent',
      border: '#cccc00'
    },
    level: {
      bg: 'transparent',
      border: '#FFFF3E'
    },
    ui: {
      bg: 'transparent',
      border: '#e6e600'
    },
    data: {
      bg: 'transparent',
      border: '#6b6b63'
    }
  },
  
  // 连线类型
  EDGE_TYPES: {
    DEFAULT: 'default',
    CONTAINS: 'contains',
    DEPENDS_ON: 'depends_on',
    TRIGGERS: 'triggers',
    REFERENCES: 'references'
  },
  
  // API端点
  API_ENDPOINTS: {
    AI_MODEL: '', // 从配置读取
    BANANA_PRO: '', // 从配置读取
    LOGGER: '/api/logger'
  },
  
  // 文件类型
  FILE_TYPES: {
    PLANNING: ['.txt', '.md', '.xlsx', '.xls', '.pdf'],
    ARCHITECTURE: ['.json'],
    IMAGE: ['.png', '.jpg', '.jpeg', '.webp']
  },
  
  // 资源路径
  RESOURCE_PATHS: {
    MOCKUPS: 'resources/ui-resources/mockups',
    LOW_FI: 'resources/ui-resources/mockups/low-fi',
    HIGH_FI: 'resources/ui-resources/mockups/high-fi',
    INTERACTIVE: 'resources/ui-resources/interactive',
    COMPONENTS: 'resources/ui-resources/components'
  },
  
  // 文档路径
  DOC_PATHS: {
    INTERACTIVE_LOGIC: 'docs/01-interactive-logic-records.md',
    ARCHITECTURE: 'docs/02-architecture.md',
    DEVELOPMENT_PLAN: 'docs/03-development-plan.md',
    UI_SPEC: 'docs/04-ui-specifications.md'
  },
  
  // 限制
  LIMITS: {
    MAX_NODES: 1000,
    MAX_EDGES: 2000,
    MAX_PROJECT_NAME_LENGTH: 100,
    MAX_CARD_TITLE_LENGTH: 50,
    MAX_CARD_DESC_LENGTH: 500,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 3
  },
  
  // 布局配置
  LAYOUT: {
    DEFAULT_NODE_WIDTH: 240,
    DEFAULT_NODE_HEIGHT: 120,
    COLLECTION_WIDTH: 300,
    COLLECTION_HEIGHT: 200,
    GRID_SIZE: 20,
    LINK_DISTANCE: 150,
    LINK_STRENGTH: 1,
    CHARGE_STRENGTH: -300,
    COLLISION_RADIUS: 50
  },
  
  // 画布配置
  CANVAS: {
    DEFAULT_ZOOM: 1,
    MIN_ZOOM: 0.25,
    MAX_ZOOM: 4,
    ZOOM_STEP: 0.1,
    PAN_SPEED: 1,
    WHEEL_ZOOM: true,
    DOUBLE_CLICK_TO_ZOOM: true
  },
  
  // Toast持续时间
  TOAST_DURATION: {
    SHORT: 2000,
    MEDIUM: 3000,
    LONG: 5000
  },
  
  // 日志级别
  LOG_LEVELS: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.Constants;
}
