/**
 * GUXY日志模块
 * 自动记录开发日志
 */

GUXY.Logger = {
  logFilePath: 'logs/development-log.md',
  
  /**
   * 初始化日志模块
   */
  init() {
    console.log('Logger initialized');
  },
  
  /**
   * 记录日志
   * @param {object} logEntry - 日志条目
   */
  async log(logEntry) {
    try {
      const logContent = this.formatLogEntry(logEntry);
      
      // 保存到IndexedDB
      if (GUXY.State?.currentProject) {
        await GUXY.DB.addWorkflowLog({
          ...logEntry,
          projectId: GUXY.State.currentProject.id
        });
      }
      
      // 添加到日志文件
      await this.appendToFile(logContent);
      
      console.log('Log entry saved:', logEntry);
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  },
  
  /**
   * 格式化日志条目
   * @param {object} entry - 日志条目
   * @returns {string} 格式化的日志
   */
  formatLogEntry(entry) {
    const timestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN');
    const step = entry.step !== undefined ? `步骤${entry.step}` : '';
    const action = entry.action || '未知操作';
    
    let log = `## ${timestamp} ${step}\n\n`;
    log += `**操作**: ${action}\n`;
    
    if (entry.data) {
      log += `\n### 详细信息\n\n`;
      log += this.formatData(entry.data);
    }
    
    log += '\n---\n\n';
    
    return log;
  },
  
  /**
   * 格式化数据
   * @param {any} data - 数据
   * @returns {string} 格式化后的字符串
   */
  formatData(data) {
    if (typeof data === 'string') {
      return data;
    } else if (typeof data === 'object') {
      return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
    } else {
      return String(data);
    }
  },
  
  /**
   * 添加到日志文件
   * @param {string} content - 日志内容
   */
  async appendToFile(content) {
    // 由于浏览器限制，这里使用localStorage作为替代
    const logs = this.getLogsFromFile();
    logs.push(content);
    
    // 限制日志条数
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('guxy_development_logs', JSON.stringify(logs));
  },
  
  /**
   * 从文件读取日志
   * @returns {Array} 日志数组
   */
  getLogsFromFile() {
    try {
      const logs = localStorage.getItem('guxy_development_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  },
  
  /**
   * 导出日志
   * @param {string} format - 导出格式（md, json）
   */
  exportLogs(format = 'md') {
    const logs = this.getLogsFromFile();
    
    if (!logs.length) {
      GUXY.Toast?.show('没有可导出的日志', 'warning');
      return;
    }
    
    let content, filename, type;
    
    if (format === 'json') {
      content = JSON.stringify(logs, null, 2);
      filename = `logs_${Date.now()}.json`;
      type = 'application/json';
    } else {
      content = this.generateMarkdownLog(logs);
      filename = `development_log_${Date.now()}.md`;
      type = 'text/markdown';
    }
    
    GUXY.Utils.downloadFile(content, filename, type);
    GUXY.Toast?.show('日志已导出', 'success');
  },
  
  /**
   * 生成Markdown格式日志
   * @param {Array} logs - 日志数组
   * @returns {string} Markdown内容
   */
  generateMarkdownLog(logs) {
    let md = '# 开发日志\n\n';
    md += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    md += `日志条数: ${logs.length}\n\n`;
    md += '---\n\n';
    
    // 按日期分组
    const groupedLogs = this.groupLogsByDate(logs);
    
    Object.keys(groupedLogs).sort().reverse().forEach(date => {
      md += `## ${date}\n\n`;
      groupedLogs[date].forEach(log => {
        md += log;
      });
    });
    
    return md;
  },
  
  /**
   * 按日期分组日志
   * @param {Array} logs - 日志数组
   * @returns {object} 分组后的日志
   */
  groupLogsByDate(logs) {
    const grouped = {};
    
    logs.forEach(log => {
      const dateMatch = log.match(/## (\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const date = dateMatch[1];
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(log);
      }
    });
    
    return grouped;
  },
  
  /**
   * 清空日志
   */
  clearLogs() {
    localStorage.removeItem('guxy_development_logs');
    localStorage.removeItem('guxy_workflow_logs');
    
    GUXY.Toast?.show('日志已清空', 'success');
    
    console.log('Logs cleared');
  },
  
  /**
   * 获取日志统计
   * @returns {object} 统计信息
   */
  getLogStats() {
    const logs = this.getLogsFromFile();
    
    const stats = {
      total: logs.length,
      byStep: {},
      byAction: {},
      byDate: {}
    };
    
    logs.forEach(log => {
      // 按步骤统计
      const stepMatch = log.match(/步骤(\d+)/);
      if (stepMatch) {
        const step = stepMatch[1];
        stats.byStep[step] = (stats.byStep[step] || 0) + 1;
      }
      
      // 按操作统计
      const actionMatch = log.match(/\*\*操作\*\*:\s*(.+)/);
      if (actionMatch) {
        const action = actionMatch[1].trim();
        stats.byAction[action] = (stats.byAction[action] || 0) + 1;
      }
      
      // 按日期统计
      const dateMatch = log.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const date = dateMatch[1];
        stats.byDate[date] = (stats.byDate[date] || 0) + 1;
      }
    });
    
    return stats;
  },
  
  /**
   * 获取最近日志
   * @param {number} count - 数量
   * @returns {Array} 最近日志
   */
  getRecentLogs(count = 10) {
    const logs = this.getLogsFromFile();
    return logs.slice(-count);
  },
  
  /**
   * 搜索日志
   * @param {string} keyword - 关键词
   * @returns {Array} 匹配的日志
   */
  searchLogs(keyword) {
    const logs = this.getLogsFromFile();
    const lowerKeyword = keyword.toLowerCase();
    
    return logs.filter(log => 
      log.toLowerCase().includes(lowerKeyword)
    );
  },
  
  /**
   * 获取工作流程进度日志
   * @param {string} projectId - 项目ID
   * @returns {Promise<Array>} 工作流程日志
   */
  async getWorkflowLogs(projectId) {
    if (GUXY.DB) {
      return await GUXY.DB.getWorkflowLogs(projectId);
    }
    
    return [];
  },
  
  /**
   * 生成工作流程报告
   * @param {string} projectId - 项目ID
   * @returns {Promise<string>} Markdown报告
   */
  async generateWorkflowReport(projectId) {
    const logs = await this.getWorkflowLogs(projectId);
    
    let report = '# 工作流程报告\n\n';
    report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    report += `项目ID: ${projectId}\n\n`;
    report += `日志条数: ${logs.length}\n\n`;
    report += '---\n\n';
    
    // 按步骤分组
    const grouped = {};
    logs.forEach(log => {
      const step = log.step || 0;
      if (!grouped[step]) {
        grouped[step] = [];
      }
      grouped[step].push(log);
    });
    
    // 按步骤顺序输出
    Object.keys(grouped).sort((a, b) => a - b).forEach(step => {
      report += `## 步骤 ${step}\n\n`;
      grouped[step].forEach(log => {
        report += `- ${new Date(log.timestamp).toLocaleString('zh-CN')}: ${log.action}\n`;
      });
      report += '\n';
    });
    
    return report;
  },
  
  /**
   * 导出工作流程报告
   * @param {string} projectId - 项目ID
   */
  async exportWorkflowReport(projectId) {
    const report = await this.generateWorkflowReport(projectId);
    const filename = `workflow_report_${Date.now()}.md`;
    
    GUXY.Utils.downloadFile(report, filename, 'text/markdown');
    GUXY.Toast?.show('工作流程报告已导出', 'success');
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.Logger;
}
