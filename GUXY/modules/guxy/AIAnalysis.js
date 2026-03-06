/**
 * GUXY AI分析模块
 * 使用AI分析策划案并提取交互逻辑
 */

GUXY.AIAnalysis = {
  /**
   * 初始化AI分析模块
   */
  init() {
    console.log('AIAnalysis initialized');
  },

  /**
   * 阶段1：转换策划案为txt架构
   * @param {File} file - 策划案文件
   * @returns {Promise<object>} txt架构数据
   */
  async convertToTextStructure(file) {
    try {
      // 检查文件类型
      const ext = GUXY.Utils.getFileExtension(file.name);
      if (!GUXY.Constants.FILE_TYPES?.PLANNING?.includes(ext)) {
        throw new Error('不支持的文件类型');
      }
      
      // 读取文件内容
      const content = await this.readFileContent(file, ext);
      
      // 统一预处理为 DocumentChunk 列表，兼容 Word/Excel/文本等混合格式
      const documentChunks = this.buildDocumentChunks(file.name, ext, content);

      // 确保加载最新的配置
      if (GUXY.State && GUXY.State.loadConfig) {
        GUXY.State.loadConfig();
      }
      
      const config = GUXY.State?.config?.api;
      if (!config || !config.apiKey || !config.baseUrl) {
        throw new Error('请先配置AI API。请在侧栏点击"⚙️ 配置 API"进行配置。');
      }

      const prompt = `你是专业的游戏交互设计分析助手，请将以下游戏策划案转换为严格分层的 txt 架构结构。

【整体结构要求：必须严格按“大系统 → 功能 → 一级界面 → 二级界面 → 三级界面”的树状层级组织，不能打乱层级】

输出格式必须完全按以下模板组织：

# 游戏策划案架构结构

## 大系统1：[系统名称]

### 功能1：[功能名称]

#### 界面1：[界面名称]（一级界面）
- 包含信息：
  - [信息项1]
  - [信息项2]
  - [信息项3]

#### 界面2：[界面名称]（二级界面）
- 归属：从哪个【一级界面】进入，例如：[装备结构界面]
- 包含信息：
  - [信息项1]
  - [信息项2]

#### 界面3：[界面名称]（三级界面）
- 归属：从哪个【二级界面】进入，例如：[装备主属性界面]
- 包含信息：
  - [信息项1]
  - [信息项2]

### 功能2：[功能名称]
[重复上述“功能 → 一级/二级/三级界面”结构，不得跨功能引用界面]

## 大系统2：[系统名称]
[重复上述“大系统 → 功能 → 各级界面”结构]

---

## 界面跳转逻辑

【这里只描述“界面之间的跳转关系”，并且要清晰体现不同层级之间的关系】

1. [一级界面A] → [二级界面B]：点击什么入口进入（例如：点击“查看详情”按钮）
2. [二级界面B] → [三级界面C]：点击什么入口进入
3. [二级界面B] → [一级界面A]：返回类操作（例如：点击“返回”按钮）
4. [任意界面X] → [任意界面Y]：其它明显存在的跳转
[完整列出所有界面之间的跳转关系，不要遗漏主流程]

【名词解释与硬性约束】
1. **大系统**：顶层系统分类，例如“装备系统”“任务系统”“商城系统”等
2. **功能**：某个系统下的具体功能模块，例如“装备强化”“装备洗炼”“日常任务”等
3. **一级界面**：从系统/功能入口直接进入的主界面，是用户第一眼看到的界面
4. **二级界面**：从某个一级界面进入的下钻界面，例如“详情”“列表筛选页”等
5. **三级界面**：从某个二级界面进入的更深层界面，通常为弹窗/结果页/配置页等
6. **包含信息**：要详细列出界面上展示的所有重要信息和操作控件（文本、数值、按钮、列表、图标等），而不是只给一句抽象说明

【禁止事项（一定不要违反）】
- 只有真正的 UI 界面 / 页面 / 弹窗 / 面板 才能作为“界面”，例如“装备结构界面”“强化结果界面”“材料选择弹窗”
- 数据项、属性、词条、技能简介、道具描述等**不能**单独成为“界面”，必须写到其所属界面的“包含信息”里
- 不要把“功能名”当成“界面名”，功能下面必须再拆出 1～N 个具体界面
- 不要在“界面跳转逻辑”里虚构在策划案中不存在的界面

策划案内容（只取前 12000 字参与分析）：
${content.substring(0, 12000)}${content.length > 12000 ? '...(内容已截断，请严格基于前12000字符进行分析)' : ''}

请严格按照上述结构和约束输出 txt 文本，不要添加任何额外的说明、注释或自然语言解释。`;

      const response = await GUXY.Utils.callAIModel(
        config.model || 'glm-4-flash',
        config.apiKey.trim(),
        config.baseUrl.trim(),
        [{ role: 'user', content: prompt }],
        {
          // GLM-5 输出更长，增大tokens上限，防止被截断
          max_tokens: 8000,
          temperature: 0.4
        }
      );
      
      // 解析TXT格式响应
      try {
        // 保存原始TXT内容（兼容部分模型用 Markdown 代码块包裹）
        let textContent = typeof response.content === 'string' ? response.content : (response.content || '');

        const codeBlockMatch = textContent.match(/^(\s*)```(?:txt|text)?\s*\n?([\s\S]*?)\n?```\s*$/m);
        if (codeBlockMatch) {
          textContent = codeBlockMatch[2].trim();
        }

        // 解析TXT结构
        const textStructure = this.parseTextStructure(textContent);
        // 将原始TXT文本也存入结构中，供后续使用
        textStructure.textContent = textContent;

        // 保存原始内容、预处理片段和转换结果
        if (GUXY.State) {
          GUXY.State.currentPlan = {
            fileName: file.name,
            fileType: ext,
            rawContent: content,
            documentChunks,
            textContent: textContent,  // 保存TXT格式内容
            textStructure: textStructure
          };
          GUXY.State.saveToStorage();
        }

        return textStructure;
      } catch (parseError) {
        console.error('解析txt架构失败:', parseError);
        throw new Error('AI返回的数据格式不正确，请重试');
      }
    } catch (error) {
      console.error('转换策划案失败:', error);
      throw error;
    }
  },

  /**
   * 阶段2：基于txt架构生成交互架构
   * @param {object} textStructure - txt架构数据
   * @returns {Promise<object>} 完整的交互架构
   */
  async generateInteractiveArchitecture(textStructure) {
    try {
      // 确保加载最新的配置
      if (GUXY.State && GUXY.State.loadConfig) {
        GUXY.State.loadConfig();
      }

      const config = GUXY.State?.config?.api;
      if (!config || !config.apiKey || !config.baseUrl) {
        throw new Error('请先配置AI API');
      }

      // 将textStructure转换为AI可读的文本
      // 优先使用解析后的结构化数据，如果结构为空则直接使用原始TXT文本
      let structureSummary = this.formatTextStructureForAI(textStructure);
      if (!structureSummary.trim() && textStructure.textContent) {
        structureSummary = textStructure.textContent;
      }

      const prompt = `基于下面已经结构化好的 txt 架构，生成一份一一对应的交互设计架构 JSON。

【核心要求：生成的 JSON 必须 100% 严格遵守 txt 中的层级与跳转逻辑，不允许自行合并或重组功能/界面】

==================== TXT 架构内容（只读，不要改写） ====================
${structureSummary}
==================================================================

## 1. 集合（Collections）生成规则 —— 严格对应“大系统”
- 每一个 "大系统" 必须生成一个、且仅一个集合节点
- 集合字段要求：
  - id：使用纯英文或拼音，来源于系统名称的语义（如“装备系统”→ "equipment" 或 "zhuangbei"），**不要**加任何前缀（不要使用 "collection-"）
  - title：等于原始大系统名称
  - type：根据系统性质选择 system / combat / story / level 中最合适的一个
  - description：用中文简要概括该大系统的功能范围

## 2. 卡片（Cards）生成规则 —— 严格对应“功能中的各级界面”
- 不能凭空新增界面，也不能丢失 txt 里列出的任何界面
- 每个“功能”下面的每个界面（一级/二级/三级）都必须生成一张卡片
- 卡片字段要求：
  - id：纯英文或拼音，不加前缀，例如 "qianghua_main"、"qianghua_detail"、"qianghua_result"
  - title：等于 txt 中的界面名称
  - type：统一用 "screen"（如果是明显的提示/确认弹窗，也可以用 "hint"）
  - interface_level：严格按 txt 标注填写 1/2/3
  - collection_id：指向它所在功能所属的大系统对应的集合 id，必须完全一致
  - description：**必须把 txt 中该界面的“包含信息”展开为一段较完整的中文描述**，包括：
    - 界面上的主要信息区域
    - 重要数据字段
    - 主要操作控件
    - 大致布局结构

【层级关系约束】
- 一级界面：通常是某个功能的主入口界面
- 二级界面：必须从某个具体的一级界面进入
- 三级界面：必须从某个具体的二级界面进入
- 你在生成卡片时，务必在 description 中体现这种父子关系，但 **不要**额外发明新的层级字段

## 3. 连线（Links）生成规则 —— 严格对应“界面跳转逻辑”段
- 只允许根据 txt 中“界面跳转逻辑”部分的条目来生成连线，不能凭空创造新的来源/目标界面
- 需要生成三类连线数组：
  - cardLinks：卡片之间的跳转（同层或跨层：1→2、2→3、3→2、2→1 等）
  - collectionLinks：不同大系统之间的宏观跳转（如果在跳转逻辑中能明显看出从一个系统的界面跳到另一个系统的界面，可以抽象出集合连线）
  - cardCollectionLinks：从具体界面返回或跳转到某个系统总入口的情况
- 连线字段要求：
  - id：任意唯一字符串（可用 "link_001" 这类格式）
  - from_card_id / to_card_id：使用前面 cards 中的 id，必须完全匹配
  - from_collection_id / to_collection_id：使用 collections 中的 id，必须完全匹配
  - label：用简短中文精确描述触发动作，例如“点击‘强化’按钮”、“点击右上角返回”、“提交表单后自动跳转”等

【重要一致性检查（必须在生成前自检）】
- 每条连线引用的 from / to 必须对应到一个真实存在的界面名称和卡片 id
- 界面名称 → 卡片 id 的映射要保持一一对应（同名界面不要拆成多个卡片）
- 不要产生 from===to 的自环连线

## 4. 输出格式

请只返回一个 JSON 对象，格式如下：
{
  "collections": [
    {
      "id": "zhuangbei",
      "title": "装备系统",
      "type": "system",
      "description": "系统描述"
    }
  ],
  "cards": [
    {
      "id": "qianghua_jiemian",
      "title": "装备强化界面",
      "description": "界面描述，包含所有显示的信息项、交互元素、布局结构",
      "type": "screen",
      "interface_level": 1,
      "collection_id": "zhuangbei"
    }
  ],
  "cardLinks": [
    {
      "id": "link_001",
      "from_card_id": "qianghua_jiemian",
      "to_card_id": "qianghua_jieguo",
      "label": "点击强化按钮",
      "iconType": null
    }
  ],
  "collectionLinks": [
    {
      "id": "clink_001",
      "from_collection_id": "zhuangbei",
      "to_collection_id": "renwu",
      "label": "从主界面进入",
      "iconType": null
    }
  ],
  "cardCollectionLinks": [
    {
      "id": "cclink_001",
      "from_card_id": "qianghua_jiemian",
      "to_collection_id": "renwu",
      "label": "返回主界面",
      "iconType": null
    }
  ]
}

【最后的硬性提醒】
- 所有 id 字段必须是纯英文/拼音，不要加 "collection-"、"card-"、"link-" 前缀
- collection_id 必须与对应 collection.id 完全一致
- cardLinks / collectionLinks / cardCollectionLinks 中引用的 id 必须都能在 collections / cards 中找到
- 你只能基于上面的 txt 内容构建 JSON，不要输出任何多余的文字说明。`;

      const response = await GUXY.Utils.callAIModel(
        config.model || 'glm-4-flash',
        config.apiKey.trim(),
        config.baseUrl.trim(),
        [{ role: 'user', content: prompt }],
        {
          max_tokens: 12000,
          temperature: 0.3
        }
      );

      // 解析JSON响应
      try {
        // 兼容 content 为字符串或数组（部分 API 返回 parts）
        let raw = response.content;
        if (Array.isArray(raw)) {
          raw = raw.map(function (p) {
            if (typeof p === 'string') return p;
            return (p && (p.text != null ? p.text : p.content != null ? p.content : '')) || '';
          }).join('');
        }
        if (typeof raw !== 'string') {
          raw = String(raw != null ? raw : '');
        }

        // 优先从 ```json ... ``` 代码块中提取
        const codeBlock = raw.match(/```(?:json|javascript|js)?\s*([\s\S]*?)```/i);
        if (codeBlock) {
          raw = codeBlock[1].trim();
        }

        // 用括号匹配提取完整 JSON（支持嵌套，避免正则截断）
        const jsonStr = this.extractFirstJson(raw);
        if (jsonStr) {
          const architecture = JSON.parse(jsonStr);

          // 后处理：清理AI可能生成的ID前缀，确保ID一致性
          this.sanitizeArchitectureIds(architecture);

          // 保存原始txt内容以便后续使用
          architecture.textContent = textStructure.textContent || '';

          return architecture;
        }
      } catch (parseError) {
        console.error('解析交互架构失败:', parseError);
        throw new Error('AI返回的数据格式不正确，请重试');
      }

      throw new Error('无法从AI响应中提取交互架构数据');
    } catch (error) {
      console.error('生成交互架构失败:', error);
      throw error;
    }
  },

  /**
   * 从字符串中按括号匹配提取第一个完整 JSON（支持嵌套）
   * @param {string} str - 可能包含 JSON 的文本
   * @returns {string|null} 提取出的 JSON 字符串，失败返回 null
   */
  extractFirstJson(str) {
    if (typeof str !== 'string' || !str.trim()) return null;
    const startObj = str.indexOf('{');
    const startArr = str.indexOf('[');
    let start = -1;
    let openChar, closeChar;
    if (startObj >= 0 && (startArr < 0 || startObj < startArr)) {
      start = startObj;
      openChar = '{';
      closeChar = '}';
    } else if (startArr >= 0) {
      start = startArr;
      openChar = '[';
      closeChar = ']';
    }
    if (start < 0) return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    let quote = '';
    for (let i = start; i < str.length; i++) {
      const c = str[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\' && inString) {
        escape = true;
        continue;
      }
      if (!inString) {
        if (c === '"' || c === "'") {
          inString = true;
          quote = c;
          continue;
        }
        if (c === openChar) {
          depth++;
          continue;
        }
        if (c === closeChar) {
          depth--;
          if (depth === 0) return str.slice(start, i + 1);
          continue;
        }
        continue;
      }
      if (c === quote) inString = false;
    }
    return null;
  },

  /**
   * 将txt结构格式化为AI可读的文本
   * @param {object} textStructure - txt结构对象
   * @returns {string} 格式化后的文本
   */
  formatTextStructureForAI(textStructure) {
    let text = '';

    if (textStructure.systems) {
      textStructure.systems.forEach((system, sysIndex) => {
        text += `\n## 大系统${sysIndex + 1}：${system.name}\n`;

        if (system.functions) {
          system.functions.forEach((func, funcIndex) => {
            text += `\n### 功能${funcIndex + 1}：${func.name}\n`;

            if (func.interfaces) {
              func.interfaces.forEach((inf, infIndex) => {
                const levelText = inf.level === 1 ? '一级界面' : inf.level === 2 ? '二级界面' : '三级界面';
                text += `\n#### 界面${infIndex + 1}：${inf.name}（${levelText}）\n`;
                text += `- 包含信息：\n`;
                if (inf.info && inf.info.length) {
                  inf.info.forEach(info => {
                    text += `  - ${info}\n`;
                  });
                } else {
                  text += `  - 暂无详细信息\n`;
                }
              });
            }
          });
        }
      });
    }

    if (textStructure.interfaceJumps && textStructure.interfaceJumps.length) {
      text += `\n---\n\n## 界面跳转逻辑\n\n`;
      textStructure.interfaceJumps.forEach((jump, index) => {
        text += `${index + 1}. [${jump.from}] → [${jump.to}]：${jump.action}\n`;
      });
    }

    return text;
  },

  /**
   * 后处理：清理AI生成的架构数据中的ID前缀
   * 确保所有ID都是不带前缀的纯ID，前缀只在DOM渲染时添加
   * @param {object} architecture - 架构数据
   */
  sanitizeArchitectureIds(architecture) {
    const stripPrefix = (id) => {
      if (!id || typeof id !== 'string') return id;
      return id
        .replace(/^collection-/, '')
        .replace(/^card-/, '')
        .replace(/^link-/, '')
        .replace(/^link_/, 'link_')  // 保留 link_ 格式
        .replace(/^clink_/, 'clink_')
        .replace(/^cclink_/, 'cclink_');
    };

    // 构建旧ID到新ID的映射
    const idMap = new Map();

    // 清理 collections 的 ID
    if (architecture.collections) {
      architecture.collections.forEach(col => {
        const oldId = col.id;
        col.id = stripPrefix(col.id);
        if (oldId !== col.id) {
          idMap.set(oldId, col.id);
        }
      });
    }

    // 清理 cards 的 ID 和 collection_id
    if (architecture.cards) {
      architecture.cards.forEach(card => {
        const oldId = card.id;
        card.id = stripPrefix(card.id);
        if (oldId !== card.id) {
          idMap.set(oldId, card.id);
        }
        // 清理 collection_id
        card.collection_id = stripPrefix(card.collection_id);
        // 也用映射修正
        if (idMap.has(card.collection_id)) {
          card.collection_id = idMap.get(card.collection_id);
        }
      });
    }

    // 清理 cardLinks
    if (architecture.cardLinks) {
      architecture.cardLinks.forEach(link => {
        link.from_card_id = stripPrefix(link.from_card_id);
        link.to_card_id = stripPrefix(link.to_card_id);
        if (idMap.has(link.from_card_id)) link.from_card_id = idMap.get(link.from_card_id);
        if (idMap.has(link.to_card_id)) link.to_card_id = idMap.get(link.to_card_id);
      });
    }

    // 清理 collectionLinks
    if (architecture.collectionLinks) {
      architecture.collectionLinks.forEach(link => {
        link.from_collection_id = stripPrefix(link.from_collection_id);
        link.to_collection_id = stripPrefix(link.to_collection_id);
        if (idMap.has(link.from_collection_id)) link.from_collection_id = idMap.get(link.from_collection_id);
        if (idMap.has(link.to_collection_id)) link.to_collection_id = idMap.get(link.to_collection_id);
      });
    }

    // 清理 cardCollectionLinks
    if (architecture.cardCollectionLinks) {
      architecture.cardCollectionLinks.forEach(link => {
        if (link.from_card_id) {
          link.from_card_id = stripPrefix(link.from_card_id);
          if (idMap.has(link.from_card_id)) link.from_card_id = idMap.get(link.from_card_id);
        }
        if (link.to_card_id) {
          link.to_card_id = stripPrefix(link.to_card_id);
          if (idMap.has(link.to_card_id)) link.to_card_id = idMap.get(link.to_card_id);
        }
        if (link.from_collection_id) {
          link.from_collection_id = stripPrefix(link.from_collection_id);
          if (idMap.has(link.from_collection_id)) link.from_collection_id = idMap.get(link.from_collection_id);
        }
        if (link.to_collection_id) {
          link.to_collection_id = stripPrefix(link.to_collection_id);
          if (idMap.has(link.to_collection_id)) link.to_collection_id = idMap.get(link.to_collection_id);
        }
      });
    }

    console.log('[sanitizeArchitectureIds] ID清理完成', {
      collections: architecture.collections?.map(c => c.id),
      cards: architecture.cards?.map(c => `${c.id} -> ${c.collection_id}`),
      cardLinks: architecture.cardLinks?.length || 0,
      collectionLinks: architecture.collectionLinks?.length || 0,
      cardCollectionLinks: architecture.cardCollectionLinks?.length || 0
    });
  },

  /**
   * 分析策划案文件（兼容旧版，建议使用两阶段流程）
   * @param {File} file - 策划案文件
   * @returns {Promise<object>} 分析结果
   */
  async analyzeFile(file) {
  let progressModal = null;
  
  try {
    // 检查文件类型
    const ext = GUXY.Utils.getFileExtension(file.name);
    if (!GUXY.Constants.FILE_TYPES?.PLANNING?.includes(ext)) {
      throw new Error('不支持的文件类型');
    }
    
    // 读取文件内容
    const content = await this.readFileContent(file, ext);
    
    // 将原始内容切分为基础片段，便于后续步骤复用
    if (GUXY.State) {
      const segments = content
        .split(/\n\s*\n/) // 按空行粗略分段
        .map(s => s.trim())
        .filter(Boolean);
      
      GUXY.State.currentPlan = {
        fileName: file.name,
        fileType: ext,
        rawContent: content,
        rawSegments: segments
      };
      GUXY.State.saveToStorage();
    }
    
    // 显示进度弹窗
    if (GUXY.AnalysisProgressModal) {
      progressModal = GUXY.AnalysisProgressModal;
      
      // 创建一个Promise来等待分析完成
      const analysisPromise = new Promise((resolve) => {
        progressModal.show(async () => {
          console.log('分析完成，关闭弹窗');
        });
      });
      
      // 开始分析流程
      try {
        let analysis = null;
        
        // 步骤1: 梳理功能模块
        progressModal.updateProgress(1, 'active');
        await this.delay(500); // 模拟分析时间
        const modules = await this.analyzeModules(content, ext);
        progressModal.updateProgress(1, 'completed');
        
        // 步骤2: 梳理交互流程
        progressModal.updateProgress(2, 'active');
        await this.delay(500);
        const flows = await this.analyzeFlows(content, modules, []);  // 先传空数组
        progressModal.updateProgress(2, 'completed');
        
        // 步骤3: 构建界面信息
        progressModal.updateProgress(3, 'active');
        await this.delay(500);
        const interfaces = await this.analyzeInterfaces(content, modules, flows);
        progressModal.updateProgress(3, 'completed');
        
        // 步骤4: 生成完整架构
        progressModal.updateProgress(4, 'active');
        await this.delay(500);
        
        // 重新处理flows，使用interfaces来分配cardId
        const enrichedFlows = flows.map(flow => {
          const moduleName = flow.moduleName;
          const module = modules.find(m => m.name === moduleName);
          
          const enrichedSteps = (flow.steps || []).map((step, idx) => {
            let cardId = step.cardId;
            if (!cardId && module) {
              const modInterfaces = interfaces.filter(inf => 
                inf.moduleName === moduleName || 
                inf.name.toLowerCase().includes(moduleName.toLowerCase())
              );
              if (modInterfaces.length > 0) {
                cardId = modInterfaces[idx % modInterfaces.length]?.id || 
                         modInterfaces[0]?.id;
              }
            }
            
            return {
              ...step,
              cardId: cardId,
              id: cardId
            };
          });
          
          return {
            ...flow,
            steps: enrichedSteps
          };
        });
        
        // 将 interfaces 映射到 modules
        const enrichedModules = modules.map(mod => {
          const modInterfaces = interfaces.filter(inf => 
            inf.moduleName === mod.name || 
            inf.name.toLowerCase().includes(mod.name.toLowerCase())
          );
          
          return {
            ...mod,
            screens: modInterfaces,
            cards: modInterfaces,
            features: modInterfaces
          };
        });
        
        analysis = {
          modules: enrichedModules,  // 使用增强的模块数据
          userFlows: enrichedFlows,  // 使用增强的流程数据
          interfaces: interfaces,
          coreGameplay: {},
          interactionDetails: {}
        };
        progressModal.updateProgress(4, 'completed');
        
        // 步骤5: 生成交互连线
        progressModal.updateProgress(5, 'active');
        await this.delay(500);
        const connections = await this.analyzeConnections(content, enrichedModules, interfaces);
        analysis.connections = connections;
        progressModal.updateProgress(5, 'completed');
        
        // 保存分析结果
        await this.saveAnalysisResult(analysis);
        
        // 更新工作流程并标记步骤①完成
        if (GUXY.Workflow) {
          GUXY.Workflow.saveStepData(1, {
            fileName: file.name,
            analysis: analysis,
            analyzedAt: new Date().toISOString()
          });
          GUXY.Workflow.completeStep(1);
        }
        
        // 记录日志
        await GUXY.Utils.logWorkflowChange(1, 'file_analyzed', {
          fileName: file.name,
          fileSize: file.size
        });
        
        // 完成所有步骤，不显示确认对话框，直接关闭并触发自动生成
        progressModal.complete(analysis);
        
        // 直接调用resolve，不要等待用户确认
        if (this.resolveCallback) {
          this.resolveCallback({ generateArchitecture: true });
        } else {
          // 降级处理：直接生成架构
          setTimeout(() => {
            progressModal.hide();
            this.autoGenerateArchitecture(analysis);
          }, 100);
        }
        
        return analysis;
      } catch (error) {
        // 发生错误时，关闭弹窗
        progressModal.hide();
        throw error;
      }
    } else {
      // 如果没有进度弹窗，使用原来的方式
      GUXY.State?.setLoading(true);
      GUXY.Toast?.show('正在分析策划案...', 'info');
      
      const analysis = await this.callAIAnalysis(content, ext);
      await this.saveAnalysisResult(analysis);
      
      if (GUXY.Workflow) {
        GUXY.Workflow.saveStepData(1, {
          fileName: file.name,
          analysis: analysis,
          analyzedAt: new Date().toISOString()
        });
        GUXY.Workflow.completeStep(1);
      }
      
      await GUXY.Utils.logWorkflowChange(1, 'file_analyzed', {
        fileName: file.name,
        fileSize: file.size
      });
      
      GUXY.State?.setLoading(false);
      GUXY.Toast?.show('分析完成', 'success');
      
      return analysis;
    }
  } catch (error) {
    if (progressModal) {
      progressModal.hide();
    }
    GUXY.State?.setLoading(false);
    GUXY.Toast?.show(`分析失败: ${error.message}`, 'error');
    console.error('AI Analysis error:', error);
    throw error;
  }
},

  /**
   * 延迟函数
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * 分析功能模块（步骤1）
   * @param {string} content - 文件内容
   * @param {string} fileType - 文件类型
   * @returns {Promise<Array>} 功能模块列表
   */
  async analyzeModules(content, fileType) {
    // 确保加载最新的配置
    if (GUXY.State && GUXY.State.loadConfig) {
      GUXY.State.loadConfig();
    }

    const config = GUXY.State?.config?.api;

    console.log('=== analyzeModules 配置检查 ===');
    console.log('配置对象:', config);
    console.log('API Key存在:', !!config?.apiKey);
    console.log('Base URL存在:', !!config?.baseUrl);
    console.log('Model存在:', !!config?.model);

    if (!config || !config.apiKey || !config.baseUrl) {
      console.error('❌ API配置不完整:', {
        hasConfig: !!config,
        hasApiKey: !!config?.apiKey,
        hasBaseUrl: !!config?.baseUrl
      });
      throw new Error('请先配置AI API。请在侧栏点击"⚙️ 配置 API"进行配置。');
    }

    // 清理API Key（去除首尾空格）
    const apiKey = config.apiKey.trim();
    const baseUrl = config.baseUrl.trim();
    const model = config.model || 'glm-4-flash';

    console.log('API配置详情:', {
      model,
      baseUrl,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
      apiKeyLength: apiKey.length
    });

    const prompt = `请分析以下策划案内容，梳理出所有功能模块。

重要要求：
1. 每个模块必须是一个具体的功能（例如："装备强化功能"、"任务系统功能"、"商城功能"）
2. 模块描述必须详细包含以下内容：
   - 功能目的和目标（这个功能要解决什么问题，达到什么效果）
   - 主要交互方式（玩家如何使用这个功能，主要操作流程）
   - 涉及的界面类型（包含哪些具体的界面，如强化界面、洗炼界面等）
   - 数据流向（数据如何流动，涉及哪些关键数据）

策划案内容：
${content.substring(0, 5000)}${content.length > 5000 ? '...' : ''}

请以JSON数组格式返回，格式如下：
[
  {
    "name": "功能名称",
    "description": "详细的功能描述，包含目的、交互方式、界面类型、数据流向"
  }
]

示例：
{
  "name": "装备强化功能",
  "description": "该功能允许玩家通过消耗材料和金币来强化装备，提高装备属性。主要交互包括：在装备列表中选择要强化的装备、选择强化材料、点击强化按钮、查看强化结果和属性变化。涉及的界面包括：装备选择界面、强化材料界面、强化确认界面、强化结果界面。数据流向包括：从背包获取装备和材料、计算强化成功率和属性提升、更新装备属性、消耗材料和金币。"
}`;

    const response = await GUXY.Utils.callAIModel(
      model,
      apiKey,
      baseUrl,
      [{ role: 'user', content: prompt }]
    );
    
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse modules:', e);
    }
    
    // 如果解析失败，返回默认值
    return [{ name: '主功能', description: '主要功能模块' }];
  },
  
  /**
   * 分析界面信息（步骤3）
   * @param {string} content - 文件内容
   * @param {Array} modules - 功能模块列表
   * @param {Array} flows - 交互流程列表
   * @returns {Promise<Array>} 界面信息列表
   */
  async analyzeInterfaces(content, modules, flows) {
    // 确保加载最新的配置
    if (GUXY.State && GUXY.State.loadConfig) {
      GUXY.State.loadConfig();
    }

    const config = GUXY.State?.config?.api;
    if (!config || !config.apiKey || !config.baseUrl) {
      throw new Error('请先配置AI API');
    }

    const prompt = `基于功能模块和交互流程，构建界面信息。

重要要求：
1. 每个界面必须是一个具体的界面（例如："装备强化界面"、"装备洗炼界面"、"任务列表界面"）
2. 界面描述必须详细包含以下内容：
   - 界面上显示的所有信息项（例如：装备名称、属性值、强化等级、材料数量等）
   - 交互元素（按钮、输入框、下拉菜单、滑块、列表、图标等具体元素）
   - 布局结构（信息如何排列，顶部显示什么，中间显示什么，底部显示什么）
   - 数据展示方式（使用什么控件展示数据，如进度条、数字、图标、列表等）

功能模块列表：
${modulesText}

请以JSON数组格式返回界面信息：
[
  {
    "name": "界面名称",
    "moduleName": "所属模块名称",
    "level": 1,  // 1=一级界面, 2=二级界面, 3=三级界面
    "type": "screen",  // screen=界面卡, hint=提示卡
    "description": "详细的界面描述，包含所有显示的信息项、交互元素、布局结构和数据展示方式"
  }
]

示例：
{
  "name": "装备强化界面",
  "moduleName": "装备强化功能",
  "level": 2,
  "type": "screen",
  "description": "界面顶部显示当前选中的装备信息（装备图标、名称、当前等级、基础属性、附加属性）。中间左侧显示装备槽位，玩家点击选择要强化的装备；中间右侧显示强化材料列表，包含材料图标、名称、数量、选中状态，支持点击选择材料。底部显示强化操作区，包含：强化按钮（显示消耗的金币数量和材料）、强化成功率进度条、强化预览区域（显示强化后的属性变化）。整个界面使用网格布局，信息清晰分层，操作按钮醒目。数据展示方式：属性使用数字+进度条组合显示，材料数量使用徽标提示，成功率使用百分比和颜色变化。"
}`;

    const response = await GUXY.Utils.callAIModel(
      config.model || 'glm-4-flash',
      config.apiKey.trim(),
      config.baseUrl.trim(),
      [{ role: 'user', content: prompt }]
    );
    
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const interfaces = JSON.parse(jsonMatch[0]);
        
        // 确保每个界面有唯一ID和moduleName
        const interfacesWithIds = interfaces.map((inf, idx) => ({
          ...inf,
          id: inf.id || `interface-${GUXY.Utils.uid()}`,
          moduleName: inf.moduleName || modules[idx % modules.length]?.name || inf.name
        }));
        
        return interfacesWithIds;
      }
    } catch (e) {
      console.warn('Failed to parse interfaces:', e);
    }
    
    return [{ name: '主界面', level: 1, type: 'screen', description: '主界面' }];
  },

  /**
   * 分析交互流程（步骤2）
   * @param {string} content - 文件内容
   * @param {Array} modules - 功能模块列表
   * @param {Array} interfaces - 界面信息列表
   * @returns {Promise<Array>} 交互流程列表
   */
  async analyzeFlows(content, modules, interfaces) {
    // 确保加载最新的配置
    if (GUXY.State && GUXY.State.loadConfig) {
      GUXY.State.loadConfig();
    }

    const config = GUXY.State?.config?.api;
    if (!config || !config.apiKey || !config.baseUrl) {
      throw new Error('请先配置AI API');
    }

    const modulesText = modules.map(m => `- ${m.name}: ${m.description}`).join('\n');
    const prompt = `基于以下功能模块，梳理每个模块的详细交互流程步骤。

重要要求：
1. 每个流程必须明确对应到一个功能模块
2. 每个步骤必须能够映射到具体的界面卡片
3. 步骤描述应该清晰说明：
   - 用户在哪个界面进行操作
   - 用户执行什么具体操作（点击按钮、选择选项、输入信息等）
   - 操作后产生的结果或跳转到哪个界面
4. 确保流程步骤的逻辑顺序合理，能够反映真实的用户操作路径

功能模块：
${modulesText}

请为每个模块梳理交互流程，以JSON数组格式返回：
[
  {
    "moduleName": "模块名称",
    "steps": [
      {"step": 1, "action": "操作描述，包含界面名称和具体操作", "result": "结果描述，说明跳转到哪个界面或显示什么结果"},
      ...
    ]
  },
  ...
]

示例：
{
  "moduleName": "装备强化功能",
  "steps": [
    {
      "step": 1,
      "action": "玩家在装备列表界面选择要强化的装备",
      "result": "进入装备强化界面，显示选中装备的详细信息和当前属性"
    },
    {
      "step": 2,
      "action": "玩家在装备强化界面点击材料选择按钮",
      "result": "打开材料选择弹窗，显示可用的强化材料列表"
    },
    {
      "step": 3,
      "action": "玩家在材料选择弹窗中选择需要的强化材料",
      "result": "关闭材料选择弹窗，在装备强化界面显示已选材料及其数量"
    },
    {
      "step": 4,
      "action": "玩家点击装备强化界面上的强化按钮",
      "result": "执行强化操作，显示强化结果界面（成功/失败及属性变化）"
    }
  ]
}`;

    const response = await GUXY.Utils.callAIModel(
      config.model || 'glm-4-flash',
      config.apiKey.trim(),
      config.baseUrl.trim(),
      [{ role: 'user', content: prompt }]
    );
    
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const flows = JSON.parse(jsonMatch[0]);
        
        // 为每个步骤分配cardId（从interfaces中获取）
        const enrichedFlows = flows.map(flow => {
          const moduleName = flow.moduleName;
          const module = modules.find(m => m.name === moduleName);
          
          const enrichedSteps = (flow.steps || []).map((step, idx) => {
            let cardId = step.cardId;
            if (!cardId && module) {
              const modInterfaces = interfaces.filter(inf => 
                inf.moduleName === moduleName || 
                inf.name.toLowerCase().includes(moduleName.toLowerCase())
              );
              if (modInterfaces.length > 0) {
                // 为每个步骤分配一个cardId
                cardId = modInterfaces[idx % modInterfaces.length]?.id || 
                         modInterfaces[0]?.id;
              }
            }
            
            return {
              ...step,
              cardId: cardId,
              id: cardId
            };
          });
          
          return {
            ...flow,
            steps: enrichedSteps
          };
        });
        
        return enrichedFlows;
      }
    } catch (e) {
      console.warn('Failed to parse flows:', e);
    }
    
    return modules.map(m => ({
      moduleName: m.name,
      steps: [{ step: 1, action: '进入模块', result: '显示模块界面' }]
    }));
  },

  /**
   * 分析交互连线（步骤5）
   * 让 AI 根据策划案内容和已生成的界面，推断界面之间的交互跳转关系
   * @param {string} content - 文件内容
   * @param {Array} modules - 功能模块列表
   * @param {Array} interfaces - 界面信息列表
   * @returns {Promise<Array>} 连线关系列表
   */
  async analyzeConnections(content, modules, interfaces) {
    const config = GUXY.State?.config?.api;
    if (!config || !config.apiKey || !config.baseUrl) {
      console.warn('API 未配置，跳过连线分析');
      return [];
    }

    // 构建界面名称列表供 AI 参考
    const interfaceNames = interfaces.map(inf =>
      `- "${inf.name}"（所属模块: ${inf.moduleName || '未知'}, 级别: ${inf.level || '?'}, 类型: ${inf.type || 'screen'}）`
    ).join('\n');

    const moduleSummary = modules.map(m =>
      `- ${m.name}: ${m.description || '无描述'}`
    ).join('\n');

    const prompt = `你是游戏交互设计专家。请根据以下策划案内容和已识别的界面列表，分析界面之间的交互跳转关系。

策划案内容（摘要）：
${content.substring(0, 4000)}${content.length > 4000 ? '\n...(内容已截断)' : ''}

功能模块：
${moduleSummary}

已识别的界面列表：
${interfaceNames}

请分析这些界面之间的交互连线关系，包括：
- 哪个界面可以跳转到哪个界面
- 跳转的触发方式（如"点击XX按钮"、"返回"、"提交后跳转"等）
- 连线类型（navigate=跳转, back=返回, popup=弹窗, refresh=刷新）

请以JSON数组格式返回，每条连线包含：
[
  {
    "from": "来源界面名称（必须与上面列表中的名称完全一致）",
    "to": "目标界面名称（必须与上面列表中的名称完全一致）",
    "label": "交互说明，如：点击开始按钮跳转",
    "type": "navigate"
  }
]

注意：
- from 和 to 必须使用上面界面列表中的精确名称
- 不要创建自环连线（from 和 to 相同）
- 每条连线的 label 应简洁明了地描述交互方式`;

    try {
      const response = await GUXY.Utils.callAIModel(
        config.model || 'glm-4-flash',
        config.apiKey.trim(),
        config.baseUrl.trim(),
        [{ role: 'user', content: prompt }]
      );

      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const connections = JSON.parse(jsonMatch[0]);
        // 过滤掉自环和无效数据
        return connections.filter(c => c.from && c.to && c.from !== c.to);
      }
    } catch (e) {
      console.warn('Failed to parse connections:', e);
    }

    return [];
  },

  /**
   * 分析界面信息（步骤3）
   * @param {string} content - 文件内容
   * @param {Array} modules - 功能模块列表
   * @param {Array} flows - 交互流程列表
   * @returns {Promise<Array>} 界面信息列表
   */
  async analyzeInterfaces(content, modules, flows) {
    const config = GUXY.State?.config?.api;
    if (!config || !config.apiKey || !config.baseUrl) {
      throw new Error('请先配置AI API');
    }
    
    const prompt = `基于功能模块和交互流程，构建界面信息。

重要要求：
1. 每个界面必须是一个具体的界面（例如："装备强化界面"、"装备洗炼界面"、"任务列表界面"）
2. 界面描述必须详细包含以下内容：
   - 界面上显示的所有信息项（例如：装备名称、属性值、强化等级、材料数量等）
   - 交互元素（按钮、输入框、下拉菜单、滑块、列表、图标等具体元素）
   - 布局结构（信息如何排列，顶部显示什么，中间显示什么，底部显示什么）
   - 数据展示方式（使用什么控件展示数据，如进度条、数字、图标、列表等）

请以JSON数组格式返回界面信息：
[
  {
    "name": "界面名称",
    "moduleName": "所属模块名称",
    "level": 1,  // 1=一级界面, 2=二级界面, 3=三级界面
    "type": "screen",  // screen=界面卡, hint=提示卡
    "description": "详细的界面描述，包含所有显示的信息项、交互元素、布局结构和数据展示方式"
  }
]

示例：
{
  "name": "装备强化界面",
  "moduleName": "装备强化功能",
  "level": 2,
  "type": "screen",
  "description": "界面顶部显示当前选中的装备信息（装备图标、名称、当前等级、基础属性、附加属性）。中间左侧显示装备槽位，玩家点击选择要强化的装备；中间右侧显示强化材料列表，包含材料图标、名称、数量、选中状态，支持点击选择材料。底部显示强化操作区，包含：强化按钮（显示消耗的金币数量和材料）、强化成功率进度条、强化预览区域（显示强化后的属性变化）。整个界面使用网格布局，信息清晰分层，操作按钮醒目。数据展示方式：属性使用数字+进度条组合显示，材料数量使用徽标提示，成功率使用百分比和颜色变化。"
}`;
    
    const response = await GUXY.Utils.callAIModel(
      config.model || 'glm-4-flash',
      config.apiKey,
      config.baseUrl,
      [{ role: 'user', content: prompt }]
    );
    
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse interfaces:', e);
    }
    
    return [{ name: '主界面', level: 1, type: 'screen', description: '主界面' }];
  },
  
  /**
   * 读取文件内容
   * @param {File} file - 文件对象
   * @param {string} ext - 文件扩展名
   * @returns {Promise<string>} 文件内容
   */
  async readFileContent(file, ext) {
    if (ext === '.txt' || ext === '.md') {
      return await GUXY.Utils.readFile(file);
    } else if (ext === '.json') {
      const data = await GUXY.Utils.parseJSONFile(file);
      return JSON.stringify(data, null, 2);
    } else if (ext === '.xlsx' || ext === '.xls') {
      // 使用 XLSX 库解析 Excel 文件
      if (typeof XLSX === 'undefined') {
        throw new Error('XLSX 库未加载，请刷新页面重试');
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            // 添加 codepage 选项支持中文编码
            const workbook = XLSX.read(data, { type: 'array', codepage: 65001 });
            let text = '';
            
            // 遍历所有工作表
            workbook.SheetNames.forEach(sheetName => {
              const sheet = workbook.Sheets[sheetName];
              text += `【${sheetName}】\n`;
              
              // 使用 sheet_to_json 方式读取，更好地处理中文
              const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
              json.forEach((row) => {
                const rowText = row
                  .map(cell => cell !== null && cell !== undefined ? String(cell).trim() : '')
                  .join('\t');
                if (rowText.trim()) {
                  text += rowText + '\n';
                }
              });
              text += '\n';
            });
            
            resolve(text.trim());
          } catch (error) {
            reject(new Error(`解析Excel文件失败: ${error.message}`));
          }
        };
        reader.onerror = () => reject(new Error('读取文件失败'));
        reader.readAsArrayBuffer(file);
      });
    } else {
      throw new Error('不支持的文件类型');
    }
  },
  
  /**
   * 将原始文本预处理为 DocumentChunk 列表，统一不同来源格式
   * @param {string} fileName
   * @param {string} ext       扩展名（含点）
   * @param {string} content   纯文本内容
   * @returns {Array<DocumentChunk>}
   */
  buildDocumentChunks(fileName, ext, content) {
    const chunks = [];
    const pushChunk = (type, location, headingPath, text) => {
      if (!text) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      chunks.push({
        id: GUXY.Utils.uid(),
        source: fileName,
        type,
        location,
        headingPath: headingPath || [],
        content: trimmed
      });
    };

    // Excel：按工作表拆分为表格型 chunk
    if (ext === '.xlsx' || ext === '.xls') {
      const lines = content.split('\n');
      let currentSheet = 'Sheet1';
      let buffer = [];

      lines.forEach((line) => {
        const sheetMatch = line.match(/^【(.+?)】$/);
        if (sheetMatch) {
          // 推出上一张表
          if (buffer.length) {
            pushChunk(
              'table',
              `sheet:${currentSheet}`,
              [currentSheet],
              buffer.join('\n')
            );
            buffer = [];
          }
          currentSheet = sheetMatch[1].trim() || currentSheet;
        } else {
          buffer.push(line);
        }
      });

      if (buffer.length) {
        pushChunk('table', `sheet:${currentSheet}`, [currentSheet], buffer.join('\n'));
      }

      return chunks;
    }

    // 其它文本类：按大标题/章节拆块，退化为设计段落
    const sections = content.split(
      /\n(?=(?:#{1,3}\s+.+|【[^】]+】|第[一二三四五六七八九十]+章|Chapter\s+\d+))/g
    );

    sections.forEach((section, index) => {
      const sec = section.trim();
      if (!sec) return;
      const lines = sec.split('\n');
      const firstLine = (lines[0] || '').trim();
      let heading = firstLine
        .replace(/^#{1,3}\s+/, '')
        .replace(/^【(.+?)】$/, '$1')
        .trim();
      const headingPath = heading ? [heading] : [];
      pushChunk('design', `block:${index + 1}`, headingPath, sec);
    });

    return chunks;
  },

  /**
   * 将 DocumentChunk 列表拼接为提示词使用的文本，带长度上限
   * @param {Array} chunks
   * @param {number} maxChars
   * @returns {{text: string, truncated: boolean}}
   */
  buildPromptTextFromChunks(chunks, maxChars = 12000) {
    if (!Array.isArray(chunks) || !chunks.length) {
      return { text: '', truncated: false };
    }

    let text = '';
    let truncated = false;

    for (const chunk of chunks) {
      const headingPath = Array.isArray(chunk.headingPath) ? chunk.headingPath : [];
      const heading = headingPath.length ? headingPath.join(' / ') : '';
      const prefix = heading ? `【${heading}】\n` : '';
      const piece = `${prefix}${chunk.content}\n\n`;

      if (text.length + piece.length > maxChars) {
        const remain = maxChars - text.length;
        if (remain > 0) {
          text += piece.slice(0, remain);
        }
        truncated = true;
        break;
      }

      text += piece;
    }

    return { text, truncated };
  },
  
  /**
   * 调用AI分析
   * @param {string} content - 文件内容
   * @param {string} fileType - 文件类型
   * @returns {Promise<object>} AI分析结果
   */
  async callAIAnalysis(content, fileType) {
    const config = GUXY.State?.config?.api;
    
    if (!config || !config.apiKey || !config.baseUrl) {
      throw new Error('请先配置AI API');
    }
    
    // 读取skill文件获取分析提示词
    const skillPrompt = await this.loadSkillPrompt();
    
    const messages = [
      {
        role: 'system',
        content: skillPrompt
      },
      {
        role: 'user',
        content: `请分析以下${fileType}格式的策划案内容，提取交互逻辑和功能需求：\n\n${content}`
      }
    ];
    
    const response = await GUXY.Utils.callAIModel(
      config.model || 'glm-4-flash',
      config.apiKey,
      config.baseUrl,
      messages
    );
    
    // 解析AI响应
    return this.parseAIResponse(response.content);
  },
  
  /**
   * 加载skill提示词
   * @returns {Promise<string>} 提示词内容
   */
  async loadSkillPrompt() {
    // 使用相对路径，便于在本地或静态服务器环境中加载
    const skillPath = '../skills/01-ai-analysis/SKILL.md';
    
    try {
      const response = await fetch(skillPath);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.warn('Failed to load skill prompt:', error);
    }
    
    // 默认提示词
    return `你是一个专业的游戏交互设计AI助手。你的任务是分析游戏策划案，提取其中的交互逻辑和功能需求。

请按以下格式输出分析结果：

# 交互逻辑分析

## 1. 核心玩法
- 描述主要游戏玩法和目标
- 列出关键交互方式

## 2. 功能模块
- 识别各个功能模块
- 描述每个模块的功能和交互

## 3. 用户流程
- 绘制主要用户流程图
- 标注关键交互点

## 4. 交互细节
- 详细的交互描述
- 输入输出说明
- 状态转换说明

请以JSON格式输出结果，包含以下字段：
{
  "coreGameplay": {},
  "modules": [],
  "userFlows": [],
  "interactionDetails": {}
}`;
  },
  
  /**
   * 解析TXT架构结构
   * @param {string} textContent - TXT格式内容
   * @returns {object} 解析后的结构
   */
  parseTextStructure(textContent) {
    const structure = {
      systems: [],
      interfaceJumps: []
    };

    const lines = textContent.split('\n');
    let currentSystem = null;
    let currentFunction = null;
    let currentInterface = null;
    let inJumpSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测标题分隔符
      if (line === '---') {
        inJumpSection = true;
        continue;
      }

      // 检测大系统标题
      const systemMatch = line.match(/^## 大系统\d+[:：](.+)$/);
      if (systemMatch && !inJumpSection) {
        currentSystem = {
          name: systemMatch[1].trim(),
          functions: []
        };
        structure.systems.push(currentSystem);
        currentFunction = null;
        currentInterface = null;
        continue;
      }

      // 检测功能标题
      const functionMatch = line.match(/^### 功能\d+[:：](.+)$/);
      if (functionMatch && currentSystem && !inJumpSection) {
        currentFunction = {
          name: functionMatch[1].trim(),
          interfaces: []
        };
        currentSystem.functions.push(currentFunction);
        currentInterface = null;
        continue;
      }

      // 检测界面标题
      const interfaceMatch = line.match(/^#### 界面\d+[:：](.+)[(（](.+)[)）]$/);
      if (interfaceMatch && currentFunction && !inJumpSection) {
        currentInterface = {
          name: interfaceMatch[1].trim(),
          level: this.parseInterfaceLevel(interfaceMatch[2].trim()),
          info: []
        };
        currentFunction.interfaces.push(currentInterface);
        continue;
      }

      // 检测包含信息
      const infoMatch = line.match(/^-\s*(.+)$/);
      if (infoMatch && currentInterface && !inJumpSection) {
        currentInterface.info.push(infoMatch[1].trim());
        continue;
      }

      // 检测跳转逻辑
      const jumpMatch = line.match(/^\d+\.\s*\[(.+)\]\s*→\s*\[(.+)\]\s*[:：](.+)$/);
      if (jumpMatch && inJumpSection) {
        structure.interfaceJumps.push({
          from: jumpMatch[1].trim(),
          to: jumpMatch[2].trim(),
          action: jumpMatch[3].trim()
        });
        continue;
      }
    }

    return structure;
  },

  /**
   * 解析界面级别
   * @param {string} levelText - 级别文本
   * @returns {number} 级别数字
   */
  parseInterfaceLevel(levelText) {
    if (levelText.includes('一级') || levelText.includes('level 1') || levelText.includes('1')) {
      return 1;
    } else if (levelText.includes('二级') || levelText.includes('level 2') || levelText.includes('2')) {
      return 2;
    } else if (levelText.includes('三级') || levelText.includes('level 3') || levelText.includes('3')) {
      return 3;
    }
    return 2; // 默认为二级
  },

  /**
   * 解析AI响应
   * @param {string} content - AI响应内容
   * @returns {object} 解析后的数据
   */
  parseAIResponse(content) {
    try {
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // 如果没有JSON，解析Markdown
      return this.parseMarkdownResponse(content);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // 返回原始内容
      return {
        rawContent: content,
        coreGameplay: {},
        modules: [],
        userFlows: [],
        interactionDetails: {}
      };
    }
  },
  
  /**
   * 解析Markdown响应
   * @param {string} content - Markdown内容
   * @returns {object} 解析后的数据
   */
  parseMarkdownResponse(content) {
    // 简化的Markdown解析
    const sections = {};
    const lines = content.split('\n');
    let currentSection = null;
    
    lines.forEach(line => {
      const headerMatch = line.match(/^#{1,3}\s+(.+)$/);
      if (headerMatch) {
        currentSection = headerMatch[1];
        sections[currentSection] = [];
      } else if (currentSection && line.trim()) {
        sections[currentSection].push(line.trim());
      }
    });
    
    return {
      rawContent: content,
      sections: sections,
      coreGameplay: {},
      modules: [],
      userFlows: [],
      interactionDetails: {}
    };
  },
  
  /**
   * 保存分析结果
   * @param {object} analysis - 分析结果
   */
  async saveAnalysisResult(analysis) {
    // 将标准化分析结果挂到当前项目上，供后续步骤使用
    if (GUXY.State?.currentProject) {
      // 确保结构字段存在
      const normalized = {
        coreGameplay: analysis.coreGameplay || {},
        modules: analysis.modules || [],
        userFlows: analysis.userFlows || [],
        interactionDetails: analysis.interactionDetails || {},
        rawContent: analysis.rawContent || analysis.rawContent === '' ? analysis.rawContent : undefined,
        sections: analysis.sections || undefined
      };
      
      GUXY.State.currentProject.analysis = normalized;
      GUXY.State.updateProject(GUXY.State.currentProject.id, {
        analysis: normalized
      });
    }
    
    // 保存到IndexedDB日志
    if (GUXY.State?.currentProject) {
      const log = {
        id: GUXY.Utils.uid(),
        timestamp: new Date().toISOString(),
        type: 'ai_analysis',
        projectId: GUXY.State.currentProject.id,
        data: analysis
      };
      
      await GUXY.DB.addWorkflowLog(log);
    }
    
    // 分析结果已保存到内存和数据库，直接用于架构生成，不再下载到本地
    console.log('分析结果已保存到项目状态，可直接用于生成架构');
  },
  
  /**
   * 格式化分析结果为Markdown
   * @param {object} analysis - 分析结果
   * @returns {string} Markdown格式
   */
  formatAnalysisAsMarkdown(analysis) {
    let md = '# 交互逻辑记录\n\n';
    md += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    
    if (analysis.coreGameplay) {
      md += '## 核心玩法\n\n';
      md += JSON.stringify(analysis.coreGameplay, null, 2);
      md += '\n\n';
    }
    
    if (analysis.modules && analysis.modules.length) {
      md += '## 功能模块\n\n';
      analysis.modules.forEach((module, index) => {
        md += `### ${index + 1}. ${module.name || '未命名'}\n\n`;
        md += `${module.description || '无描述'}\n\n`;
      });
    }
    
    if (analysis.userFlows && analysis.userFlows.length) {
      md += '## 用户流程\n\n';
      analysis.userFlows.forEach((flow, index) => {
        md += `### ${index + 1}. ${flow.name || '未命名'}\n\n`;
        md += `${flow.description || '无描述'}\n\n`;
      });
    }
    
    return md;
  },

  /**
   * 自动生成架构（分析完成后的降级处理）
   * @param {object} analysis - AI分析结果
   */
  autoGenerateArchitecture(analysis) {
    console.log('=== autoGenerateArchitecture 开始 ===');
    console.log('分析结果:', analysis);

    try {
      // 确保有当前项目
      const project = GUXY.State?.currentProject;
      if (!project) {
        console.error('没有当前项目');
        GUXY.Toast?.show('请先创建并选择项目', 'error');
        return;
      }

      // 调用架构生成模块
      if (GUXY.ArchitectureGen) {
        console.log('调用 ArchitectureGen.generateFromAnalysis...');
        const architecture = GUXY.ArchitectureGen.generateFromAnalysis(analysis);
        console.log('架构生成成功:', {
          collections: architecture.collections?.length || 0,
          cards: architecture.cards?.length || 0,
          edges: architecture.edges?.length || 0
        });

        // 应用到画布
        console.log('调用 ArchitectureGen.applyToCanvas...');
        GUXY.ArchitectureGen.applyToCanvas(architecture);

        // 显示成功提示
        GUXY.Toast?.show('✅ 已根据分析结果生成卡片和集合', 'success');

        // 刷新侧栏
        if (GUXY.Sidebar) {
          GUXY.Sidebar.refresh();
        }

        console.log('=== autoGenerateArchitecture 完成 ===');
      } else {
        console.error('ArchitectureGen 模块未加载');
        GUXY.Toast?.show('架构生成模块未加载', 'error');
      }
    } catch (error) {
      console.error('autoGenerateArchitecture 失败:', error);
      GUXY.Toast?.show(`生成架构失败: ${error.message}`, 'error');
    }
  },

  /**
   * 导出分析结果
   * @param {string} format - 格式（md, json）
   */
  exportAnalysis(format = 'md') {
    const data = GUXY.Workflow?.getStepData(1)?.analysis;
    
    if (!data) {
      GUXY.Toast?.show('没有可导出的分析结果', 'warning');
      return;
    }
    
    let content, filename, type;
    
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `analysis_${Date.now()}.json`;
      type = 'application/json';
    } else {
      content = this.formatAnalysisAsMarkdown(data);
      filename = `analysis_${Date.now()}.md`;
      type = 'text/markdown';
    }
    
    GUXY.Utils.downloadFile(content, filename, type);
    GUXY.Toast?.show('已导出分析结果', 'success');
  },
  
  /**
   * 清除分析结果
   */
  clearAnalysis() {
    if (GUXY.Workflow) {
      GUXY.Workflow.saveStepData(1, {
        analysis: null,
        clearedAt: new Date().toISOString()
      });
    }
    
    GUXY.Toast?.show('已清除分析结果', 'info');
  },

  /**
   * 新的两阶段导入流程
   * @param {File} file - 策划案文件
   */
  async importWithTwoStageFlow(file) {
    let progressModal = null;

    try {
      // 检查文件类型
      const ext = GUXY.Utils.getFileExtension(file.name);
      if (!GUXY.Constants.FILE_TYPES?.PLANNING?.includes(ext)) {
        throw new Error('不支持的文件类型');
      }

      // 显示进度弹窗
      if (GUXY.AnalysisProgressModal) {
        progressModal = GUXY.AnalysisProgressModal;

        // 先调用show()初始化和显示弹窗
        progressModal.show();

        // 阶段1：文本提取 + 阶段2：文本转化（合并在 convertToTextStructure 中完成）
        // 在用户视角上，先完成第1步，再推进到第2步后再进入TXT检查
        progressModal.updateProgress(1, 'active');
        await this.delay(500);
        const textStructure = await this.convertToTextStructure(file);
        // 完成第1步，推进到第2步
        progressModal.updateProgress(1, 'completed'); // 会自动把第2步标记为 active

        // 获取原始TXT文本内容
        const rawTextContent = GUXY.State?.currentPlan?.textContent || '';

        // 显示可编辑的TXT内容供用户检查和编辑
        progressModal.showReview({ textContent: rawTextContent });

        // 等待用户选择
        const userAction = await progressModal.show();

        // 处理用户选择
        if (userAction?.action === 'reconvert') {
          // 重新转换
          GUXY.Toast?.show('重新选择策划案文件', 'info');
          return null;
        }

        if (userAction?.action === 'continue') {
          // 获取用户编辑后的TXT文本
          const editedTextContent = userAction.editedTextContent || rawTextContent;

          // 重新解析用户编辑后的TXT为textStructure
          const finalTextStructure = this.parseTextStructure(editedTextContent);
          // 保留textContent供下一阶段使用
          finalTextStructure.textContent = editedTextContent;

          // 用户确认，阶段2结束，开始阶段3-5（流程搭建 / 架构生成 / 自检测）
          progressModal.hideReview();
          // 标记第2步完成，激活第3步：流程搭建
          progressModal.updateProgress(2, 'completed');
          await this.delay(300);
          progressModal.updateProgress(3, 'active');
          await this.delay(300);
          // 此处暂未拆分单独的“流程搭建”AI 调用，视为 generateInteractiveArchitecture 的前置阶段
          progressModal.updateProgress(3, 'completed');
          // 第4步：架构生成
          progressModal.updateProgress(4, 'active');
          const architecture = await this.generateInteractiveArchitecture(finalTextStructure);
          progressModal.updateProgress(4, 'completed');
          // 第5步：自检测（当前仅作为流程占位，实际自检功能仍在后续步骤中提供）
          progressModal.updateProgress(5, 'active');
          await this.delay(300);
          progressModal.updateProgress(5, 'completed');

          // 保存架构数据
          if (GUXY.State?.currentProject) {
            GUXY.State.updateProject(GUXY.State.currentProject.id, {
              architecture: architecture
            });
          }

          // 更新工作流程：步骤①（AI 分析策划案）和步骤②（生成卡片架构）都视为已完成
          if (GUXY.Workflow) {
            GUXY.Workflow.saveStepData(1, {
              fileName: file.name,
              architecture: architecture,
              textStructure: finalTextStructure,
              analyzedAt: new Date().toISOString()
            });
            GUXY.Workflow.completeStep(1);

            // 步骤②：生成卡片交互架构
            GUXY.Workflow.saveStepData(2, {
              architecture: architecture,
              generatedAt: new Date().toISOString()
            });
            GUXY.Workflow.completeStep(2);
          }

          // 记录日志
          await GUXY.Utils.logWorkflowChange(1, 'file_analyzed', {
            fileName: file.name,
            fileSize: file.size
          });
          await GUXY.Utils.logWorkflowChange(2, 'architecture_generated', {
            fileName: file.name,
            cards: architecture.cards?.length || 0,
            collections: architecture.collections?.length || 0
          });

        // 完成所有步骤，关闭弹窗
        progressModal.complete(architecture);

        // 自动生成架构到画布
        setTimeout(() => {
          if (GUXY.ArchitectureGen) {
            GUXY.ArchitectureGen.applyToCanvas(architecture);
            GUXY.Toast?.show('已根据分析结果生成交互架构', 'success');

            // 自动跳转到第3步（手动调整架构）
            if (GUXY.Workflow) {
              GUXY.Workflow.goToStep(3);
            }
          }
        }, 500);

        return architecture;
        }

        // 用户取消
        progressModal.hide();
        GUXY.Toast?.show('已取消导入', 'info');
        return null;
      }
    } catch (error) {
      if (progressModal) {
        progressModal.hide();
      }
      GUXY.State?.setLoading(false);
      GUXY.Toast?.show(`导入失败: ${error.message}`, 'error');
      console.error('Two-stage import error:', error);
      throw error;
    }
  }
};

// 如果在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.AIAnalysis;
}
