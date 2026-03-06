/**
 * GUXY IndexedDB数据层
 * 管理持久化数据存储
 */

GUXY.DB = {
  db: null,
  dbName: GUXY.Constants?.DB_NAME || 'GUXY_DB',
  dbVersion: GUXY.Constants?.DB_VERSION || 2, // 版本升级以支持新表
  
  /**
   * 初始化数据库
   * @returns {Promise<IDBDatabase>} 数据库实例
   */
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('Failed to open database:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('Database upgrade needed');
        
        // 创建项目表
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('name', 'name', { unique: false });
          projectStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Created projects store');
        }
        
        // 创建工作流程日志表
        if (!db.objectStoreNames.contains('workflow_logs')) {
          const logStore = db.createObjectStore('workflow_logs', { keyPath: 'id' });
          logStore.createIndex('projectId', 'projectId', { unique: false });
          logStore.createIndex('step', 'step', { unique: false });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('Created workflow_logs store');
        }
        
        // 创建架构表
        if (!db.objectStoreNames.contains('architectures')) {
          const archStore = db.createObjectStore('architectures', { keyPath: 'projectId' });
          console.log('Created architectures store');
        }
        
        // 创建资源表
        if (!db.objectStoreNames.contains('resources')) {
          const resourceStore = db.createObjectStore('resources', { keyPath: 'id' });
          resourceStore.createIndex('projectId', 'projectId', { unique: false });
          resourceStore.createIndex('type', 'type', { unique: false });
          console.log('Created resources store');
        }
        
        // 创建评论表
        if (!db.objectStoreNames.contains('comments')) {
          const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
          commentStore.createIndex('targetType', 'targetType', { unique: false });
          commentStore.createIndex('targetId', 'targetId', { unique: false });
          commentStore.createIndex('authorId', 'authorId', { unique: false });
          commentStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Created comments store');
        }
        
        // 创建附件表
        if (!db.objectStoreNames.contains('attachments')) {
          const attachmentStore = db.createObjectStore('attachments', { keyPath: 'id' });
          attachmentStore.createIndex('cardId', 'cardId', { unique: false });
          attachmentStore.createIndex('type', 'type', { unique: false });
          attachmentStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Created attachments store');
        }
      };
    });
  },
  
  /**
   * 添加项目
   * @param {object} project - 项目对象
   * @returns {Promise<string>} 项目ID
   */
  async addProject(project) {
    return this.transaction('projects', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.add(project);
        request.onsuccess = () => resolve(project.id);
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 获取项目
   * @param {string} projectId - 项目ID
   * @returns {Promise<object>} 项目对象
   */
  async getProject(projectId) {
    return this.transaction('projects', 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.get(projectId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 获取所有项目
   * @returns {Promise<Array>} 项目列表
   */
  async getAllProjects() {
    return this.transaction('projects', 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 更新项目
   * @param {object} project - 项目对象
   * @returns {Promise<void>}
   */
  async updateProject(project) {
    return this.transaction('projects', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.put(project);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 删除项目
   * @param {string} projectId - 项目ID
   * @returns {Promise<void>}
   */
  async deleteProject(projectId) {
    return this.transaction('projects', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.delete(projectId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 保存架构
   * @param {string} projectId - 项目ID
   * @param {object} architecture - 架构数据
   * @returns {Promise<void>}
   */
  async saveArchitecture(projectId, architecture) {
    return this.transaction('architectures', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const data = { projectId, ...architecture, updatedAt: new Date().toISOString() };
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 获取架构
   * @param {string} projectId - 项目ID
   * @returns {Promise<object>} 架构数据
   */
  async getArchitecture(projectId) {
    return this.transaction('architectures', 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.get(projectId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 添加工作流程日志
   * @param {object} logEntry - 日志条目
   * @returns {Promise<string>} 日志ID
   */
  async addWorkflowLog(logEntry) {
    return this.transaction('workflow_logs', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const entry = {
          id: GUXY.Utils.uid(),
          timestamp: new Date().toISOString(),
          ...logEntry
        };
        const request = store.add(entry);
        request.onsuccess = () => resolve(entry.id);
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 获取项目的工作流程日志
   * @param {string} projectId - 项目ID
   * @returns {Promise<Array>} 日志列表
   */
  async getWorkflowLogs(projectId) {
    return this.transaction('workflow_logs', 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const index = store.index('projectId');
        const request = index.getAll(projectId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 添加资源
   * @param {object} resource - 资源对象
   * @returns {Promise<string>} 资源ID
   */
  async addResource(resource) {
    return this.transaction('resources', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const res = {
          id: GUXY.Utils.uid(),
          createdAt: new Date().toISOString(),
          ...resource
        };
        const request = store.add(res);
        request.onsuccess = () => resolve(res.id);
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 获取项目资源
   * @param {string} projectId - 项目ID
   * @param {string} type - 资源类型（可选）
   * @returns {Promise<Array>} 资源列表
   */
  async getResources(projectId, type = null) {
    return this.transaction('resources', 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const index = store.index('projectId');
        const request = index.getAll(projectId);
        request.onsuccess = () => {
          let resources = request.result || [];
          if (type) {
            resources = resources.filter(r => r.type === type);
          }
          resolve(resources);
        };
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 删除资源
   * @param {string} resourceId - 资源ID
   * @returns {Promise<void>}
   */
  async deleteResource(resourceId) {
    return this.transaction('resources', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.delete(resourceId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 清空表
   * @param {string} storeName - 表名
   * @returns {Promise<void>}
   */
  async clearStore(storeName) {
    return this.transaction(storeName, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 事务处理
   * @param {string} storeName - 表名
   * @param {string} mode - 模式（readonly或readwrite）
   * @param {Function} callback - 回调函数
   * @returns {Promise<any>} 回调结果
   */
  transaction(storeName, mode, callback) {
    if (!this.db) {
      return Promise.reject(new Error('Database not initialized'));
    }
    
    try {
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      return callback(store);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  /**
   * 关闭数据库
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database closed');
    }
  },
  
  /**
   * 添加评论
   * @param {object} comment - 评论对象
   * @returns {Promise<string>} 评论ID
   */
  async addComment(comment) {
    return this.transaction('comments', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const entry = {
          id: GUXY.Utils.uid(),
          createdAt: new Date().toISOString(),
          ...comment
        };
        const request = store.add(entry);
        request.onsuccess = () => resolve(entry.id);
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 获取评论列表
   * @param {string} targetType - 目标类型（card/collection）
   * @param {string} targetId - 目标ID
   * @returns {Promise<Array>} 评论列表
   */
  async getComments(targetType, targetId) {
    return this.transaction('comments', 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const index = store.index('targetId');
        const request = index.getAll(targetId);
        request.onsuccess = () => {
          const comments = (request.result || []).filter(
            c => c.targetType === targetType
          );
          resolve(comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        };
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 删除评论
   * @param {string} commentId - 评论ID
   * @returns {Promise<void>}
   */
  async deleteComment(commentId) {
    return this.transaction('comments', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.delete(commentId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 添加附件
   * @param {object} attachment - 附件对象
   * @returns {Promise<string>} 附件ID
   */
  async addAttachment(attachment) {
    return this.transaction('attachments', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const entry = {
          id: GUXY.Utils.uid(),
          createdAt: new Date().toISOString(),
          ...attachment
        };
        const request = store.add(entry);
        request.onsuccess = () => resolve(entry.id);
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 获取附件列表
   * @param {string} cardId - 卡片ID
   * @returns {Promise<Array>} 附件列表
   */
  async getAttachments(cardId) {
    return this.transaction('attachments', 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const index = store.index('cardId');
        const request = index.getAll(cardId);
        request.onsuccess = () => {
          resolve((request.result || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        };
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 删除附件
   * @param {string} attachmentId - 附件ID
   * @returns {Promise<void>}
   */
  async deleteAttachment(attachmentId) {
    return this.transaction('attachments', 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.delete(attachmentId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  
  /**
   * 删除数据库
   * @returns {Promise<void>}
   */
  async deleteDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      request.onsuccess = () => {
        this.db = null;
        console.log('Database deleted');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.DB;
}
