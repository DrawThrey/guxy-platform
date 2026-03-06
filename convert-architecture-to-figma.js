/**
 * 将游戏架构 JSON 转换为 Figma 可识别的格式
 * 输出符合 Figma REST API 文件格式的 JSON，可使用 "JSON to Figma Import" 等插件导入
 * 
 * 使用方法: node convert-architecture-to-figma.js <输入文件路径> [输出文件路径]
 * 示例: node convert-architecture-to-figma.js architecture.json figma-architecture.json
 */

const fs = require('fs');
const path = require('path');

// 生成 Figma 格式的节点 ID (格式: "pageId:nodeId")
let idCounter = 0;
function nextId() {
  idCounter++;
  return `arch-${idCounter}`;
}

// 颜色辅助
function rgba(r, g, b, a = 1) {
  return { r: r / 255, g: g / 255, b: b / 255, a };
}

// 创建 Paint 填充
function solidFill(r, g, b, a = 1) {
  return {
    type: 'SOLID',
    color: rgba(r, g, b, a),
    visible: true,
    opacity: 1
  };
}

// 创建基础 FRAME 节点
function createFrame(id, name, x, y, width, height, children = [], fills = null) {
  const node = {
    id,
    name,
    type: 'FRAME',
    blendMode: 'PASS_THROUGH',
    children,
    absoluteBoundingBox: { x, y, width, height },
    absoluteRenderBounds: { x, y, width, height },
    constraints: { vertical: 'TOP', horizontal: 'LEFT' },
    layoutAlign: 'INHERIT',
    layoutGrow: 0,
    opacity: 1,
    preserveRatio: false,
    relativeTransform: [[1, 0, x], [0, 1, y]],
    size: { x: width, y: height },
    clipsContent: false,
    layoutMode: 'VERTICAL',
    primaryAxisSizingMode: 'AUTO',
    counterAxisSizingMode: 'AUTO',
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    itemSpacing: 8,
    strokes: [],
    strokeWeight: 1,
    strokeAlign: 'INSIDE',
    cornerRadius: 8,
    effects: []
  };
  node.fills = fills || [solidFill(255, 255, 255), solidFill(245, 245, 250)];
  return node;
}

// 创建 TEXT 节点 (Figma REST API 格式)
function createText(id, name, text, x, y, width, height, fontSize = 14, bold = false) {
  return {
    id,
    name,
    type: 'TEXT',
    blendMode: 'PASS_THROUGH',
    absoluteBoundingBox: { x, y, width, height },
    absoluteRenderBounds: { x, y, width, height },
    constraints: { vertical: 'TOP', horizontal: 'LEFT' },
    layoutAlign: 'INHERIT',
    opacity: 1,
    characters: text,
    style: {
      fontFamily: 'Inter',
      fontPostScriptName: bold ? 'Inter-Bold' : 'Inter-Regular',
      fontWeight: bold ? 700 : 400,
      fontSize,
      italic: false,
      letterSpacing: 0,
      lineHeightPx: fontSize * 1.4,
      lineHeightPercent: 100,
      textAlignHorizontal: 'LEFT',
      textAlignVertical: 'TOP',
      textCase: 'ORIGINAL',
      textDecoration: 'NONE',
      textAutoResize: 'WIDTH_AND_HEIGHT'
    },
    layoutVersion: 0,
    fills: [solidFill(33, 33, 33)],
    fillStyleId: '',
    strokeWeight: 0,
    strokeAlign: 'INSIDE',
    lineHeightPx: fontSize * 1.4
  };
}

// 创建 RECTANGLE 节点 (用于卡片背景)
function createRect(id, name, x, y, width, height, fills = null) {
  return {
    id,
    name,
    type: 'RECTANGLE',
    blendMode: 'PASS_THROUGH',
    absoluteBoundingBox: { x, y, width, height },
    constraints: { vertical: 'TOP', horizontal: 'LEFT' },
    layoutAlign: 'INHERIT',
    opacity: 1,
    cornerRadius: 8,
    fills: fills || [solidFill(255, 255, 255)],
    strokes: [solidFill(220, 220, 220)],
    strokeWeight: 1,
    strokeAlign: 'INSIDE',
    effects: [
      {
        type: 'DROP_SHADOW',
        visible: true,
        radius: 4,
        color: rgba(0, 0, 0, 0.1),
        blendMode: 'NORMAL',
        offset: { x: 0, y: 2 },
        spread: 0
      }
    ]
  };
}

// 主转换函数
function convertToFigma(arch) {
  idCounter = 0;
  const collections = arch.collections || [];
  const cards = arch.cards || [];
  const cardLinks = arch.cardLinks || [];

  const CARD_WIDTH = 320;
  const CARD_HEIGHT = 120;
  const CARD_GAP = 40;
  const COLLECTION_GAP = 80;
  const MARGIN = 60;

  // 按 collection 分组 cards
  const cardsByCollection = {};
  cards.forEach(card => {
    const cid = card.collection_id || 'default';
    if (!cardsByCollection[cid]) cardsByCollection[cid] = [];
    cardsByCollection[cid].push(card);
  });

  const canvasChildren = [];
  let currentY = MARGIN;

  // 为每个 collection 创建区域
  collections.forEach((col, colIdx) => {
    const colCards = cardsByCollection[col.id] || [];
    
    // Collection 标题 Frame
    const colTitleId = nextId();
    const colFrameId = nextId();
    
    const colTitle = createText(
      colTitleId,
      `${col.title} - 系统`,
      col.title,
      MARGIN,
      currentY,
      400,
      32,
      24,
      true
    );
    canvasChildren.push(colTitle);
    currentY += 48;

    // Collection 描述
    if (col.description) {
      const colDescId = nextId();
      const descText = createText(
        colDescId,
        '系统描述',
        col.description,
        MARGIN,
        currentY,
        600,
        40,
        14,
        false
      );
      canvasChildren.push(descText);
      currentY += 50;
    }

    // 卡片网格布局
    const cardsInCol = colCards;
    let cardX = MARGIN;
    let rowMaxY = 0;
    const COLS = 3;

    cardsInCol.forEach((card, idx) => {
      const colIndex = idx % COLS;
      const rowIndex = Math.floor(idx / COLS);
      const x = MARGIN + colIndex * (CARD_WIDTH + CARD_GAP);
      const y = currentY + rowIndex * (CARD_HEIGHT + CARD_GAP);

      const cardFrameId = nextId();
      const cardTitleId = nextId();
      const cardDescId = nextId();

      const titleText = createText(
        cardTitleId,
        '标题',
        card.title,
        x + 16,
        y + 16,
        CARD_WIDTH - 32,
        24,
        16,
        true
      );

      const descPreview = (card.description || '').slice(0, 60) + (card.description?.length > 60 ? '...' : '');
      const descText = createText(
        cardDescId,
        '描述',
        descPreview || '无描述',
        x + 16,
        y + 48,
        CARD_WIDTH - 32,
        56,
        12,
        false
      );

      const levelLabel = `Lv.${card.interface_level || 1}`;
      const levelId = nextId();
      const levelText = createText(
        levelId,
        '等级',
        levelLabel,
        x + CARD_WIDTH - 50,
        y + 16,
        40,
        20,
        11,
        false
      );

      const cardFrame = createFrame(
        cardFrameId,
        card.title,
        x,
        y,
        CARD_WIDTH,
        CARD_HEIGHT,
        [titleText, levelText, descText],
        [solidFill(255, 255, 255), solidFill(250, 250, 255)]
      );
      cardFrame.strokes = [solidFill(100, 149, 237)];
      cardFrame.strokeWeight = 2;

      canvasChildren.push(cardFrame);
      rowMaxY = Math.max(rowMaxY, y + CARD_HEIGHT);
    });

    const cardRows = Math.ceil(cardsInCol.length / COLS);
    currentY = cardsInCol.length > 0 
      ? currentY + cardRows * (CARD_HEIGHT + CARD_GAP) 
      : currentY;
    currentY += COLLECTION_GAP;
  });

  // 处理没有 collection 的卡片
  const uncategorized = cards.filter(c => !c.collection_id || !collections.find(col => col.id === c.collection_id));
  if (uncategorized.length > 0 && collections.length === 0) {
    uncategorized.forEach((card, idx) => {
      const x = MARGIN + (idx % COLS) * (CARD_WIDTH + CARD_GAP);
      const y = currentY + Math.floor(idx / COLS) * (CARD_HEIGHT + CARD_GAP);

      const cardFrameId = nextId();
      const cardTitleId = nextId();
      const cardDescId = nextId();

      const titleText = createText(cardTitleId, '标题', card.title, x + 16, y + 16, CARD_WIDTH - 32, 24, 16, true);
      const descText = createText(cardDescId, '描述', (card.description || '').slice(0, 60) + '...', x + 16, y + 48, CARD_WIDTH - 32, 56, 12, false);

      const cardFrame = createFrame(cardFrameId, card.title, x, y, CARD_WIDTH, CARD_HEIGHT, [titleText, descText]);
      canvasChildren.push(cardFrame);
    });
  }

  // 计算画布尺寸
  const canvasWidth = 1200;
  const canvasHeight = Math.max(800, currentY + MARGIN);

  // 构建 Figma 文档结构
  const document = {
    id: nextId(),
    name: '游戏架构 - Architecture',
    type: 'DOCUMENT',
    children: [
      {
        id: nextId(),
        name: 'Page 1',
        type: 'CANVAS',
        backgroundColor: rgba(248, 249, 250),
        flowStartingPoints: [],
        children: canvasChildren
      }
    ]
  };

  return {
    name: '游戏架构设计',
    lastModified: new Date().toISOString(),
    version: '1',
    document,
    components: {},
    componentSets: {},
    schemaVersion: 0,
    styles: {}
  };
}

// 主入口
function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0] || path.join(__dirname, 'architecture.json');
  const outputPath = args[1] || inputPath.replace(/\.json$/i, '-figma.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`错误: 输入文件不存在: ${inputPath}`);
    process.exit(1);
  }

  console.log(`读取: ${inputPath}`);
  const raw = fs.readFileSync(inputPath, 'utf-8');
  let arch;
  try {
    arch = JSON.parse(raw);
  } catch (e) {
    console.error('JSON 解析失败:', e.message);
    process.exit(1);
  }

  const figmaDoc = convertToFigma(arch);
  fs.writeFileSync(outputPath, JSON.stringify(figmaDoc, null, 2), 'utf-8');
  console.log(`已生成: ${outputPath}`);
  console.log('\n使用说明:');
  console.log('1. 安装 Figma 插件 "JSON to Figma Import" (或类似插件)');
  console.log('2. 在 Figma 中运行插件，选择此 JSON 文件导入');
  console.log('3. 或使用 Figma REST API 格式的插件导入');
}

main();
