/**
 * GUXY导出资源管理模块
 * 统一管理所有导出操作，支持多格式导出和资源文件夹管理
 */

GUXY.ExportManager = {
  exportHistory: [],
  
  /**
   * 初始化导出管理模块
   */
  init() {
    console.log('ExportManager initialized');
  },
  
  /**
   * 生成时间戳文件夹名称
   * @returns {string} 文件夹名称，格式：YYYY-MM-DD_HH-mm-ss
   */
  generateTimestampFolder() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  },
  
  /**
   * 导出架构数据（支持JSON和Markdown双格式）
   * @param {object} architecture - 架构数据
   * @param {object} project - 项目数据
   * @returns {Promise<object>} 导出结果
   */
  async exportArchitecture(architecture, project) {
    try {
      if (!architecture) {
        throw new Error('没有可导出的架构数据');
      }
      
      const timestamp = this.generateTimestampFolder();
      const exportFolder = timestamp;
      
      // 生成JSON格式
      const jsonContent = JSON.stringify(architecture, null, 2);
      const jsonFilename = `${exportFolder}/architecture.json`;
      
      // 生成Markdown格式
      const mdContent = this.generateArchitectureMarkdown(architecture, project);
      const mdFilename = `${exportFolder}/architecture.md`;
      
      // 创建导出记录
      const exportRecord = {
        id: GUXY.Utils.uid(),
        type: 'architecture',
        timestamp: new Date().toISOString(),
        folder: exportFolder,
        files: [
          {
            format: 'json',
            filename: jsonFilename,
            content: jsonContent,
            mimeType: 'application/json'
          },
          {
            format: 'markdown',
            filename: mdFilename,
            content: mdContent,
            mimeType: 'text/markdown'
          }
        ],
        metadata: {
          projectId: project?.id,
          projectName: project?.name,
          collectionsCount: architecture.collections?.length || 0,
          cardsCount: architecture.cards?.length || 0,
          edgesCount: architecture.edges?.length || 0
        }
      };
      
      // 记录导出历史
      this.exportHistory.push(exportRecord);
      
      // 下载所有文件
      exportRecord.files.forEach(file => {
        GUXY.Utils.downloadFile(file.content, file.filename, file.mimeType);
      });
      
      // 更新工作流程
      if (GUXY.Workflow) {
        GUXY.Workflow.saveStepData(2, {
          exportRecord: {
            id: exportRecord.id,
            folder: exportFolder,
            timestamp: exportRecord.timestamp,
            metadata: exportRecord.metadata
          },
          exportedAt: new Date().toISOString()
        });
      }
      
      // 记录日志
      await GUXY.Utils.logWorkflowChange(2, 'architecture_exported', {
        exportId: exportRecord.id,
        folder: exportFolder,
        formats: ['json', 'markdown']
      });
      
      GUXY.Toast?.show('架构已导出（JSON + Markdown）', 'success');
      
      return {
        success: true,
        exportRecord,
        message: `已导出到 ${exportFolder}/ 文件夹`
      };
    } catch (error) {
      console.error('Export architecture error:', error);
      GUXY.Toast?.show(`导出失败: ${error.message}`, 'error');
      throw error;
    }
  },
  
  /**
   * 生成架构的Markdown格式文档
   * @param {object} architecture - 架构数据
   * @param {object} project - 项目数据
   * @returns {string} Markdown内容
   */
  generateArchitectureMarkdown(architecture, project) {
    const now = new Date().toLocaleString('zh-CN');
    
    let md = `# ${project?.name || '游戏'} 架构文档\n\n`;
    md += `**生成时间**: ${now}\n`;
    md += `**项目名称**: ${project?.name || '未命名项目'}\n`;
    md += `**项目描述**: ${project?.description || '暂无描述'}\n\n`;
    
    md += `---\n\n`;
    
    // 集合列表（功能模块）
    md += `## 功能集合 (${architecture.collections?.length || 0})\n\n`;
    if (architecture.collections && architecture.collections.length > 0) {
      architecture.collections.forEach((col, index) => {
        md += `### ${index + 1}. ${col.title}\n\n`;
        md += `- **ID**: \`${col.id}\`\n`;
        md += `- **类型**: ${col.type || 'system'}\n`;
        if (col.description) {
          md += `- **描述**: ${col.description}\n`;
        }
        if (col.children && col.children.length > 0) {
          md += `- **包含界面**: ${col.children.length}个\n`;
          col.children.forEach((child, idx) => {
            md += `  ${idx + 1}. ${child.title}\n`;
          });
        }
        md += `\n`;
      });
    } else {
      md += `暂无功能集合\n\n`;
    }
    
    md += `---\n\n`;
    
    // 卡片列表（界面）
    md += `## 界面卡片 (${architecture.cards?.length || 0})\n\n`;
    if (architecture.cards && architecture.cards.length > 0) {
      architecture.cards.forEach((card, index) => {
        md += `### ${index + 1}. ${card.title}\n\n`;
        md += `- **ID**: \`${card.id}\`\n`;
        md += `- **类型**: ${card.type || 'screen'}\n`;
        md += `- **层级**: ${card.interface_level || 2}\n`;
        if (card.collection_id) {
          md += `- **所属集合**: \`${card.collection_id}\`\n`;
        }
        if (card.description) {
          md += `- **描述**: ${card.description}\n`;
        }
        md += `\n`;
      });
    } else {
      md += `暂无界面卡片\n\n`;
    }
    
    md += `---\n\n`;
    
    // 连线关系
    md += `## 连线关系 (${architecture.edges?.length || 0})\n\n`;
    if (architecture.edges && architecture.edges.length > 0) {
      architecture.edges.forEach((edge, index) => {
        md += `### 连线 ${index + 1}\n\n`;
        md += `- **源节点**: \`${edge.source}\` (${edge.sourceType || 'card'})\n`;
        md += `- **目标节点**: \`${edge.target}\` (${edge.targetType || 'card'})\n`;
        if (edge.label) {
          md += `- **说明**: ${edge.label}\n`;
        }
        md += `- **类型**: ${edge.type || 'default'}\n`;
        md += `\n`;
      });
    } else {
      md += `暂无连线关系\n\n`;
    }
    
    md += `---\n\n`;
    
    // 统计信息
    md += `## 统计信息\n\n`;
    md += `- **功能集合数量**: ${architecture.collections?.length || 0}\n`;
    md += `- **界面卡片数量**: ${architecture.cards?.length || 0}\n`;
    md += `- **连线数量**: ${architecture.edges?.length || 0}\n`;
    if (architecture.cardLinks) {
      md += `- **卡片连线**: ${architecture.cardLinks.length}\n`;
    }
    if (architecture.collectionLinks) {
      md += `- **集合连线**: ${architecture.collectionLinks.length}\n`;
    }
    if (architecture.cardCollectionLinks) {
      md += `- **卡片-集合连线**: ${architecture.cardCollectionLinks.length}\n`;
    }
    md += `\n`;
    
    md += `---\n\n`;
    
    md += `## 导出信息\n\n`;
    md += `- **导出工具**: GUXY\n`;
    md += `- **架构版本**: ${architecture.version || '1.0.0'}\n`;
    md += `- **导出时间**: ${now}\n`;
    
    return md;
  },
  
  /**
   * 导出分析结果（支持JSON和Markdown双格式）
   * @param {object} analysis - 分析结果
   * @param {string} fileName - 原始文件名
   * @returns {Promise<object>} 导出结果
   */
  async exportAnalysis(analysis, fileName) {
    try {
      if (!analysis) {
        throw new Error('没有可导出的分析结果');
      }
      
      const timestamp = this.generateTimestampFolder();
      const exportFolder = timestamp;
      
      // 生成JSON格式
      const jsonContent = JSON.stringify(analysis, null, 2);
      const jsonFilename = `${exportFolder}/analysis.json`;
      
      // 生成Markdown格式
      const mdContent = this.generateAnalysisMarkdown(analysis, fileName);
      const mdFilename = `${exportFolder}/analysis.md`;
      
      // 创建导出记录
      const exportRecord = {
        id: GUXY.Utils.uid(),
        type: 'analysis',
        timestamp: new Date().toISOString(),
        folder: exportFolder,
        files: [
          {
            format: 'json',
            filename: jsonFilename,
            content: jsonContent,
            mimeType: 'application/json'
          },
          {
            format: 'markdown',
            filename: mdFilename,
            content: mdContent,
            mimeType: 'text/markdown'
          }
        ],
        metadata: {
          sourceFile: fileName,
          modulesCount: analysis.modules?.length || 0,
          interfacesCount: analysis.interfaces?.length || 0,
          userFlowsCount: analysis.userFlows?.length || 0
        }
      };
      
      // 记录导出历史
      this.exportHistory.push(exportRecord);
      
      // 下载所有文件
      exportRecord.files.forEach(file => {
        GUXY.Utils.downloadFile(file.content, file.filename, file.mimeType);
      });
      
      GUXY.Toast?.show('分析结果已导出（JSON + Markdown）', 'success');
      
      return {
        success: true,
        exportRecord,
        message: `已导出到 ${exportFolder}/ 文件夹`
      };
    } catch (error) {
      console.error('Export analysis error:', error);
      GUXY.Toast?.show(`导出失败: ${error.message}`, 'error');
      throw error;
    }
  },
  
  /**
   * 生成分析结果的Markdown格式文档
   * @param {object} analysis - 分析结果
   * @param {string} fileName - 原始文件名
   * @returns {string} Markdown内容
   */
  generateAnalysisMarkdown(analysis, fileName) {
    const now = new Date().toLocaleString('zh-CN');
    
    let md = `# 策划案分析结果\n\n`;
    md += `**源文件**: ${fileName || '未命名'}\n`;
    md += `**分析时间**: ${now}\n\n`;
    
    md += `---\n\n`;
    
    // 功能模块
    md += `## 功能模块 (${analysis.modules?.length || 0})\n\n`;
    if (analysis.modules && analysis.modules.length > 0) {
      analysis.modules.forEach((mod, index) => {
        md += `### ${index + 1}. ${mod.name || '未命名'}\n\n`;
        if (mod.description) {
          md += `${mod.description}\n\n`;
        }
        if (mod.screens && mod.screens.length > 0) {
          md += `**包含界面**:\n`;
          mod.screens.forEach((screen, idx) => {
            md += `- ${idx + 1}. ${screen.name || screen.title}\n`;
          });
          md += `\n`;
        }
      });
    } else {
      md += `暂无功能模块\n\n`;
    }
    
    md += `---\n\n`;
    
    // 界面信息
    md += `## 界面信息 (${analysis.interfaces?.length || 0})\n\n`;
    if (analysis.interfaces && analysis.interfaces.length > 0) {
      analysis.interfaces.forEach((inf, index) => {
        md += `### ${index + 1}. ${inf.name || '未命名'}\n\n`;
        md += `- **所属模块**: ${inf.moduleName || '未知'}\n`;
        md += `- **层级**: ${inf.level || 2}\n`;
        md += `- **类型**: ${inf.type || 'screen'}\n`;
        if (inf.description) {
          md += `- **描述**: ${inf.description}\n`;
        }
        md += `\n`;
      });
    } else {
      md += `暂无界面信息\n\n`;
    }
    
    md += `---\n\n`;
    
    // 用户流程
    md += `## 用户流程 (${analysis.userFlows?.length || 0})\n\n`;
    if (analysis.userFlows && analysis.userFlows.length > 0) {
      analysis.userFlows.forEach((flow, index) => {
        md += `### ${index + 1}. ${flow.moduleName || '未命名'}\n\n`;
        if (flow.steps && flow.steps.length > 0) {
          md += `**流程步骤**:\n`;
          flow.steps.forEach((step, idx) => {
            md += `${idx + 1}. ${step.action || step.step}\n`;
            if (step.result) {
              md += `   → ${step.result}\n`;
            }
          });
          md += `\n`;
        }
      });
    } else {
      md += `暂无用户流程\n\n`;
    }
    
    md += `---\n\n`;
    
    md += `## 导出信息\n\n`;
    md += `- **分析工具**: GUXY AI Analysis\n`;
    md += `- **分析时间**: ${now}\n`;
    
    return md;
  },
  
  /**
   * 获取导出历史
   * @returns {Array} 导出历史记录
   */
  getExportHistory() {
    return this.exportHistory;
  },
  
  /**
   * 导出画布为Markdown格式（详细版，包含Mermaid图表）
   * @param {object} architecture - 架构数据
   * @param {object} project - 项目数据
   * @returns {Promise<object>} 导出结果
   */
  async exportCanvasToMarkdown(architecture, project) {
    try {
      if (!architecture) {
        throw new Error('没有可导出的画布数据');
      }
      
      // 生成详细Markdown格式
      const mdContent = this.generateDetailedCanvasMarkdown(architecture, project);
      const timestamp = this.generateTimestampFolder();
      const filename = `${project?.name || '画布'}_${timestamp}.md`;
      
      // 下载文件
      GUXY.Utils.downloadFile(mdContent, filename, 'text/markdown');
      
      GUXY.Toast?.show('画布已导出为Markdown', 'success');
      
      return {
        success: true,
        filename,
        message: `已导出 ${filename}`
      };
    } catch (error) {
      console.error('Export canvas to markdown error:', error);
      GUXY.Toast?.show(`导出失败: ${error.message}`, 'error');
      throw error;
    }
  },
  
  /**
   * 生成画布的详细Markdown格式文档（包含Mermaid图表）
   * @param {object} architecture - 架构数据
   * @param {object} project - 项目数据
   * @returns {string} Markdown内容
   */
  generateDetailedCanvasMarkdown(architecture, project) {
    const now = new Date().toLocaleString('zh-CN');
    
    let md = `# ${project?.name || '项目'} - 画布导出\n\n`;
    
    // 概览统计
    const collectionsCount = architecture.collections?.length || 0;
    const cardsCount = architecture.cards?.length || 0;
    const edgesCount = architecture.edges?.length || 0;
    
    md += `## 概览\n\n`;
    md += `| 项目名称 | ${project?.name || '未命名'} |\n`;
    md += `|---------|${'-'.repeat(Math.max(10, (project?.name || '未命名').length + 2))}|\n`;
    md += `| 项目描述 | ${project?.description || '暂无描述'} |\n`;
    md += `| 集合数量 | ${collectionsCount} |\n`;
    md += `| 卡片数量 | ${cardsCount} |\n`;
    md += `| 连线数量 | ${edgesCount} |\n`;
    md += `| 导出时间 | ${now} |\n\n`;
    
    md += `---\n\n`;
    
    // Mermaid架构图
    md += `## 架构图 (Mermaid)\n\n`;
    md += `\`\`\`mermaid\n`;
    md += `flowchart TD\n`;
    
    // 生成节点ID映射（处理特殊字符）
    const sanitizeId = (id) => {
      return id?.replace(/[^a-zA-Z0-9_]/g, '_') || 'unknown';
    };
    
    // 添加集合节点
    if (architecture.collections && architecture.collections.length > 0) {
      architecture.collections.forEach((col, index) => {
        const nodeId = `col_${sanitizeId(col.id)}`;
        const label = col.title || `集合${index + 1}`;
        md += `    ${nodeId}["📁 ${label}"]\n`;
      });
    }
    
    // 添加卡片节点
    if (architecture.cards && architecture.cards.length > 0) {
      architecture.cards.forEach((card, index) => {
        const nodeId = `card_${sanitizeId(card.id)}`;
        const label = card.title || `卡片${index + 1}`;
        const levelIcon = card.interface_level === 1 ? '🟢' : (card.interface_level === 2 ? '🟡' : '🔴');
        md += `    ${nodeId}["${levelIcon} ${label}"]\n`;
      });
    }
    
    md += `\n`;
    
    // 添加集合-卡片包含关系
    if (architecture.cards && architecture.cards.length > 0) {
      architecture.cards.forEach((card) => {
        if (card.collection_id) {
          const cardNodeId = `card_${sanitizeId(card.id)}`;
          const colNodeId = `col_${sanitizeId(card.collection_id)}`;
          md += `    ${colNodeId} --> ${cardNodeId}\n`;
        }
      });
    }
    
    // 添加连线关系
    if (architecture.edges && architecture.edges.length > 0) {
      architecture.edges.forEach((edge) => {
        const sourceId = sanitizeId(edge.source);
        const targetId = sanitizeId(edge.target);
        // 判断源节点类型
        const sourceNode = `card_${sourceId}`;
        const targetNode = `card_${targetId}`;
        const label = edge.label ? `|"${edge.label}"|` : '';
        md += `    ${sourceNode} -->${label} ${targetNode}\n`;
      });
    }
    
    md += `\`\`\`\n\n`;
    
    md += `---\n\n`;
    
    // 功能集合详情
    md += `## 功能集合详情 (${collectionsCount})\n\n`;
    if (architecture.collections && architecture.collections.length > 0) {
      architecture.collections.forEach((col, index) => {
        md += `### ${index + 1}. ${col.title || '未命名集合'}\n\n`;
        md += `- **ID**: \`${col.id}\`\n`;
        md += `- **类型**: ${col.type || 'system'}\n`;
        if (col.description) {
          md += `- **描述**: ${col.description}\n`;
        }
        
        // 列出包含的卡片
        const colCards = architecture.cards?.filter(c => c.collection_id === col.id) || [];
        if (colCards.length > 0) {
          md += `- **包含界面** (${colCards.length}个):\n`;
          colCards.forEach((card, idx) => {
            const levelText = card.interface_level ? `${card.interface_level}级` : '未分级';
            md += `  ${idx + 1}. ${card.title || '未命名'} (${levelText})\n`;
          });
        }
        md += `\n`;
      });
    } else {
      md += `暂无功能集合\n\n`;
    }
    
    md += `---\n\n`;
    
    // 界面卡片详情
    md += `## 界面卡片详情 (${cardsCount})\n\n`;
    if (architecture.cards && architecture.cards.length > 0) {
      architecture.cards.forEach((card, index) => {
        md += `### ${index + 1}. ${card.title || '未命名卡片'}\n\n`;
        md += `- **ID**: \`${card.id}\`\n`;
        md += `- **类型**: ${card.card_type || card.type || 'screen'}\n`;
        md += `- **界面层级**: ${card.interface_level || 2}级\n`;
        if (card.collection_id) {
          const parentCol = architecture.collections?.find(c => c.id === card.collection_id);
          md += `- **所属集合**: ${parentCol?.title || card.collection_id}\n`;
        }
        if (card.description) {
          md += `- **描述**: ${card.description}\n`;
        }
        
        // 找出该卡片的连线
        const outgoingEdges = architecture.edges?.filter(e => e.source === card.id) || [];
        const incomingEdges = architecture.edges?.filter(e => e.target === card.id) || [];
        
        if (outgoingEdges.length > 0) {
          md += `- **跳转到**:\n`;
          outgoingEdges.forEach((edge, idx) => {
            const targetCard = architecture.cards?.find(c => c.id === edge.target);
            const label = edge.label ? ` (${edge.label})` : '';
            md += `  - ${targetCard?.title || edge.target}${label}\n`;
          });
        }
        if (incomingEdges.length > 0) {
          md += `- **从以下界面进入**:\n`;
          incomingEdges.forEach((edge, idx) => {
            const sourceCard = architecture.cards?.find(c => c.id === edge.source);
            const label = edge.label ? ` (${edge.label})` : '';
            md += `  - ${sourceCard?.title || edge.source}${label}\n`;
          });
        }
        
        md += `\n`;
      });
    } else {
      md += `暂无界面卡片\n\n`;
    }
    
    md += `---\n\n`;
    
    // 连线关系列表
    md += `## 连线关系 (${edgesCount})\n\n`;
    if (architecture.edges && architecture.edges.length > 0) {
      md += `| 序号 | 源界面 | 目标界面 | 说明 |\n`;
      md += `|------|--------|----------|------|\n`;
      architecture.edges.forEach((edge, index) => {
        const sourceCard = architecture.cards?.find(c => c.id === edge.source);
        const targetCard = architecture.cards?.find(c => c.id === edge.target);
        md += `| ${index + 1} | ${sourceCard?.title || edge.source} | ${targetCard?.title || edge.target} | ${edge.label || '-'} |\n`;
      });
      md += `\n`;
    } else {
      md += `暂无连线关系\n\n`;
    }
    
    md += `---\n\n`;
    
    md += `## 导出信息\n\n`;
    md += `- **导出工具**: GUXY Canvas Exporter\n`;
    md += `- **架构版本**: ${architecture.version || '1.0.0'}\n`;
    md += `- **导出时间**: ${now}\n`;
    
    return md;
  },
  
  /**
   * 清空导出历史
   */
  clearExportHistory() {
    this.exportHistory = [];
    console.log('Export history cleared');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.ExportManager;
}
