/**
 * GUXY 设计文档与交互架构核心数据模型
 *
 * 说明：
 * - 仅用于类型约定和文档化，不参与实际运行逻辑
 * - 通过 JSDoc typedef 约束各阶段数据结构，方便后续模块复用
 */

/* eslint-disable no-unused-vars */

/**
 * @typedef {Object} DocumentChunk
 * @property {string} id          唯一ID
 * @property {string} source      来源文件名（含扩展名）
 * @property {string} type        文本类型：design | table | slide | image_ocr | other
 * @property {string} location    位置标识：如 "sheet:装备系统!A1:D20"、"page:3"、"slide:5"
 * @property {string[]} headingPath 标题路径数组，如 ["装备系统", "强化玩法"]
 * @property {string} content     纯文本内容
 */

/**
 * @typedef {Object} SystemSpec
 * @property {string} id              系统ID（英文/拼音）
 * @property {string} name            系统名称（中文）
 * @property {string} description     系统描述
 * @property {string[]} sourceRefs    来源引用（DocumentChunk.id 列表）
 */

/**
 * @typedef {Object} FeatureSpec
 * @property {string} id              功能ID（英文/拼音）
 * @property {string} name            功能名称
 * @property {string} systemId        所属 SystemSpec.id
 * @property {string} description     功能描述（目的、交互方式、数据流向）
 * @property {string[]} sourceRefs    来源引用
 */

/**
 * @typedef {Object} ScreenSpec
 * @property {string} id                  界面ID（英文/拼音）
 * @property {string} name                界面名称
 * @property {string} systemId            所属系统ID
 * @property {string} featureId           所属功能ID
 * @property {1|2|3} interface_level      界面层级：1=系统主页，2=功能页面，3=弹窗/底部面板
 * @property {string|null} entry_from     入口界面名称或ID
 * @property {string[]} mainSections      主要信息区块标题列表
 * @property {string[]} keyComponents     关键交互组件（列表、卡片、按钮等）的描述
 * @property {string[]} mainActions       主操作（强化、提交、切换页签等）
 * @property {string} description         详细文案说明（可直接映射到卡片 description）
 * @property {string[]} sourceRefs        来源引用
 */

/**
 * @typedef {Object} TransitionSpec
 * @property {string} id              跳转ID
 * @property {string} fromScreenId    来源 ScreenSpec.id
 * @property {string} toScreenId      目标 ScreenSpec.id
 * @property {string} trigger         触发方式（点击XX按钮、长按、提交后自动等）
 * @property {string} condition       条件（可选）
 * @property {"navigate"|"back"|"popup"|"refresh"} type 连线类型
 * @property {boolean} inferred       是否为AI/规则推断出来的默认跳转（如返回）
 */

/**
 * @typedef {Object} CollectionNode
 * @property {string} id
 * @property {string} title
 * @property {"system"|"combat"|"story"|"level"|string} type
 * @property {string} [description]
 * @property {number} [x]
 * @property {number} [y]
 * @property {{id:string,title:string}[]} [children]
 */

/**
 * @typedef {Object} CardNode
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {"screen"|"hint"|"ui"|string} type
 * @property {1|2|3} [interface_level]
 * @property {string} [collection_id]
 * @property {number} [x]
 * @property {number} [y]
 */

/**
 * @typedef {Object} ArchitectureEdge
 * @property {string} id
 * @property {string} source
 * @property {string} target
 * @property {"collection"|"card"} sourceType
 * @property {"collection"|"card"} targetType
 * @property {string} [label]
 * @property {string} [type]
 */

/**
 * @typedef {Object} CardLink
 * @property {string} id
 * @property {string} from_card_id
 * @property {string} to_card_id
 * @property {string} [label]
 * @property {string|null} [iconType]
 */

/**
 * @typedef {Object} CollectionLink
 * @property {string} id
 * @property {string} from_collection_id
 * @property {string} to_collection_id
 * @property {string} [label]
 * @property {string|null} [iconType]
 */

/**
 * @typedef {Object} CardCollectionLink
 * @property {string} id
 * @property {string|null} [from_card_id]
 * @property {string|null} [from_collection_id]
 * @property {string|null} [to_card_id]
 * @property {string|null} [to_collection_id]
 * @property {string} [label]
 * @property {string|null} [iconType]
 */

/**
 * @typedef {Object} ArchitectureJson
 * @property {string} [version]
 * @property {CollectionNode[]} [collections]
 * @property {CardNode[]} [cards]
 * @property {ArchitectureEdge[]} [edges]
 * @property {CardLink[]} [cardLinks]
 * @property {CollectionLink[]} [collectionLinks]
 * @property {CardCollectionLink[]} [cardCollectionLinks]
 * @property {string} [textContent]   // from txt 架构
 */

// 暴露一个空对象作为命名空间，方便在其他模块中引用 typedef 名称
GUXY.DesignModels = {};

// Node.js 环境导出（仅用于测试/文档生成）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}

