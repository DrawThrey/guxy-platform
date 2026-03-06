/**
 * GUXY Plan模式导入模块
 * 将架构导出为Cursor Plan格式
 */

GUXY.PlanImport = {
  /**
   * 初始化Plan导入模块
   */
  init() {
    console.log('PlanImport initialized');
  },
  
  /**
   * 导出架构为Plan格式
   * @param {string} projectId - 项目ID
   * @returns {Promise<string>} Plan内容
   */
  async exportToPlan(projectId) {
    try {
      // 获取项目数据
      const project = await GUXY.DB.getProject(projectId);
      if (!project) {
        throw new Error('项目不存在');
      }
      
      const architecture = project.architecture;
      if (!architecture) {
        throw new Error('架构数据不存在');
      }
      
      // 显示加载状态
      GUXY.State?.setLoading(true);
      GUXY.Toast?.show('正在生成Plan...', 'info');
      
      // 生成Plan内容
      const planContent = this.generatePlanContent(project, architecture);
      
      // 保存Plan
      const filename = `${project.name}_plan_${Date.now()}.plan.md`;
      GUXY.Utils.downloadFile(planContent, filename, 'text/markdown');
      
      // 更新工作流程
      if (GUXY.Workflow) {
        GUXY.Workflow.saveStepData(4, {
          planFilename: filename,
          exportedAt: new Date().toISOString()
        });
      }
      
      // 记录日志
      await GUXY.Utils.logWorkflowChange(4, 'plan_exported', {
        filename
      });
      
      GUXY.State?.setLoading(false);
      GUXY.Toast?.show('Plan已导出', 'success');
      
      return planContent;
    } catch (error) {
      GUXY.State?.setLoading(false);
      GUXY.Toast?.show(`导出失败: ${error.message}`, 'error');
      console.error('Plan export error:', error);
      throw error;
    }
  },
  
  /**
   * 生成Plan内容
   * @param {object} project - 项目数据
   * @param {object} architecture - 架构数据
   * @returns {string} Plan内容
   */
  generatePlanContent(project, architecture) {
    const timestamp = Date.now();
    const planId = GUXY.Utils.uid().slice(0, 8);
    
    let plan = `---
name: ${project.name}开发计划
overview: 基于游戏架构的详细开发计划
todos:
`;
    
    // 生成todos
    const todos = this.generateTodos(architecture);
    todos.forEach((todo, index) => {
      plan += `  - id: task-${index + 1}\n`;
      plan += `    content: ${todo.content}\n`;
      plan += `    status: pending\n`;
    });
    
    plan += `isProject: true
---
`;

    // 添加计划详情
    plan += `# ${project.name}开发计划

## 项目概述

**项目名称**: ${project.name}
**创建时间**: ${new Date(project.createdAt).toLocaleString('zh-CN')}
**最后更新**: ${new Date(project.updatedAt).toLocaleString('zh-CN')}
**项目描述**: ${project.description || '暂无描述'}

---

## 架构概览

### 集合节点 (${architecture.collections?.length || 0})

${architecture.collections?.map((col, index) => `
#### ${index + 1}. ${col.title}

- **ID**: ${col.id}
- **类型**: 集合
- **包含卡片数**: ${col.children?.length || 0}
`).join('') || '暂无集合节点'}

### 卡片节点 (${architecture.cards?.length || 0})

${architecture.cards?.map((card, index) => `
#### ${index + 1}. ${card.title}

- **ID**: ${card.id}
- **类型**: ${card.type}
- **描述**: ${card.description || '无描述'}
`).join('') || '暂无卡片节点'}

### 连线关系 (${architecture.edges?.length || 0})

${architecture.edges?.map((edge, index) => `
#### ${index + 1}. 连线

- **源节点**: ${edge.source}
- **目标节点**: ${edge.target}
- **类型**: ${edge.type || 'default'}
`).join('') || '暂无连线'}

---

## 开发任务

`;

    // 添加详细任务
    todos.forEach((todo, index) => {
      plan += `### ${index + 1}. ${todo.content}\n\n`;
      plan += `**优先级**: ${todo.priority || '中'}\n`;
      plan += `**预计工时**: ${todo.estimatedHours || 4}小时\n`;
      
      if (todo.description) {
        plan += `\n${todo.description}\n\n`;
      }
      
      if (todo.dependencies && todo.dependencies.length) {
        plan += `**依赖任务**: ${todo.dependencies.map(d => `#${d}`).join(', ')}\n\n`;
      }
    });

    // 添加实现步骤
    plan += `---

## 实施步骤

### 阶段1: 基础设施搭建
- [ ] 项目初始化和配置
- [ ] 开发环境搭建
- [ ] 代码框架搭建

### 阶段2: 核心功能开发
- [ ] 游戏系统实现
- [ ] 交互逻辑实现
- [ ] 数据结构设计

### 阶段3: 界面开发
- [ ] UI组件开发
- [ ] 界面交互实现
- [ ] 用户体验优化

### 阶段4: 测试与优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化

---

## 资源需求

- **开发人员**: ${this.estimateDevelopers(architecture)}人
- **预计工期**: ${this.estimateDuration(architecture)}周
- **主要技术**: JavaScript, Canvas API, IndexedDB

---

## 生成信息

- **生成时间**: ${new Date().toLocaleString('zh-CN')}
- **生成工具**: GUXY v${GUXY.Constants?.APP_VERSION || '1.0.0'}
- **Plan ID**: ${planId}
`;

    return plan;
  },
  
  /**
   * 生成开发任务列表
   * @param {object} architecture - 架构数据
   * @returns {Array} 任务列表
   */
  generateTodos(architecture) {
    const todos = [];
    
    // 从集合生成任务
    if (architecture.collections) {
      architecture.collections.forEach(col => {
        todos.push({
          content: `实现集合: ${col.title}`,
          priority: '高',
          estimatedHours: 8,
          description: `创建${col.title}集合，包含${col.children?.length || 0}个子卡片`,
          type: 'collection'
        });
      });
    }
    
    // 从卡片生成任务
    if (architecture.cards) {
      architecture.cards.forEach(card => {
        todos.push({
          content: `实现功能: ${card.title}`,
          priority: card.type === 'system' ? '高' : '中',
          estimatedHours: 4,
          description: card.description,
          type: 'card'
        });
      });
    }
    
    // 从连线生成集成任务
    if (architecture.edges) {
      const groups = this.groupEdgesByType(architecture.edges);
      groups.forEach((edges, type) => {
        todos.push({
          content: `实现${type}关系`,
          priority: '中',
          estimatedHours: 2,
          description: `处理${edges.length}个${type}关系`,
          type: 'integration'
        });
      });
    }
    
    // 添加通用任务
    todos.push({
      content: '代码审查和优化',
      priority: '中',
      estimatedHours: 4,
      type: 'review'
    });
    
    todos.push({
      content: '编写测试用例',
      priority: '高',
      estimatedHours: 6,
      type: 'testing'
    });
    
    todos.push({
      content: '部署和上线',
      priority: '高',
      estimatedHours: 2,
      type: 'deployment'
    });
    
    return todos;
  },
  
  /**
   * 按类型分组连线
   * @param {Array} edges - 连线数组
   * @returns {Map} 分组后的连线
   */
  groupEdgesByType(edges) {
    const groups = new Map();
    
    edges.forEach(edge => {
      const type = edge.type || 'default';
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type).push(edge);
    });
    
    return groups;
  },
  
  /**
   * 估算开发人员数量
   * @param {object} architecture - 架构数据
   * @returns {number} 人数
   */
  estimateDevelopers(architecture) {
    const collections = architecture.collections?.length || 0;
    const cards = architecture.cards?.length || 0;
    const total = collections + cards;
    
    if (total < 10) return 1;
    if (total < 30) return 2;
    if (total < 50) return 3;
    return 4;
  },
  
  /**
   * 估算工期
   * @param {object} architecture - 架构数据
   * @returns {number} 周数
   */
  estimateDuration(architecture) {
    const collections = architecture.collections?.length || 0;
    const cards = architecture.cards?.length || 0;
    const total = collections + cards;
    
    const hours = total * 4 + 12; // 每个节点平均4小时 + 通用任务12小时
    const weeks = Math.ceil(hours / 40); // 每周40小时
    
    return Math.max(1, weeks);
  },
  
  /**
   * 导入Plan文件
   * @param {File} file - Plan文件
   * @returns {Promise<object>} 解析后的Plan数据
   */
  async importPlan(file) {
    try {
      const content = await GUXY.Utils.readFile(file);
      const planData = this.parsePlanContent(content);
      
      // 验证Plan格式
      if (!planData.name || !planData.todos) {
        throw new Error('无效的Plan格式');
      }
      
      GUXY.Toast?.show('Plan导入成功', 'success');
      
      return planData;
    } catch (error) {
      GUXY.Toast?.show(`导入失败: ${error.message}`, 'error');
      console.error('Plan import error:', error);
      throw error;
    }
  },
  
  /**
   * 解析Plan内容
   * @param {string} content - Plan内容
   * @returns {object} 解析后的数据
   */
  parsePlanContent(content) {
    // 简单的YAML前置数据解析
    const yamlMatch = content.match(/^---([\s\S]*?)---/);
    let planData = { name: '', todos: [] };
    
    if (yamlMatch) {
      try {
        // 简化的YAML解析
        const yaml = yamlMatch[1];
        const nameMatch = yaml.match(/name:\s*(.+)$/m);
        if (nameMatch) {
          planData.name = nameMatch[1].trim();
        }
        
        const todosMatch = yaml.match(/todos:([\s\S]*?)(?:---|$)/m);
        if (todosMatch) {
          planData.todos = this.parseTodos(todosMatch[1]);
        }
      } catch (error) {
        console.error('Failed to parse YAML:', error);
      }
    }
    
    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      planData.name = planData.name || titleMatch[1].trim();
    }
    
    return planData;
  },
  
  /**
   * 解析todos
   * @param {string} todosText - todos文本
   * @returns {Array} todos数组
   */
  parseTodos(todosText) {
    const todos = [];
    const lines = todosText.split('\n');
    let currentTodo = null;
    
    lines.forEach(line => {
      const todoMatch = line.match(/^\s*-\s+id:\s*(.+)$/);
      if (todoMatch) {
        if (currentTodo) {
          todos.push(currentTodo);
        }
        currentTodo = { id: todoMatch[1].trim() };
      } else if (currentTodo) {
        const contentMatch = line.match(/^\s+content:\s*(.+)$/);
        if (contentMatch) {
          currentTodo.content = contentMatch[1].trim();
        }
        
        const statusMatch = line.match(/^\s+status:\s*(.+)$/);
        if (statusMatch) {
          currentTodo.status = statusMatch[1].trim();
        }
      }
    });
    
    if (currentTodo) {
      todos.push(currentTodo);
    }
    
    return todos;
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.PlanImport;
}
