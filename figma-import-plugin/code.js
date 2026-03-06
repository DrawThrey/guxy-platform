/**
 * 游戏架构导入 Figma 插件
 * 将 architecture.json 转换为可编辑的 Figma 界面
 */

figma.showUI(__html__, { width: 400, height: 380 });

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'import') return;
  try {
    const arch = JSON.parse(msg.json);
    await createArchitectureDesign(arch);
    figma.ui.postMessage({ type: 'done' });
    figma.closePlugin();
  } catch (e) {
    figma.ui.postMessage({ type: 'done', error: e.message });
  }
};

async function createArchitectureDesign(arch) {
  const collections = arch.collections || [];
  const cards = arch.cards || [];
  const CARD_W = 300;
  const CARD_H = 100;
  const GAP = 24;
  const COLS = 3;
  const MARGIN = 40;

  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  const page = figma.currentPage;
  let y = MARGIN;

  const colsToProcess = collections.length > 0 ? collections : [{ id: 'default', title: '界面列表', description: '' }];
  const cardsByCol = collections.length > 0
    ? (cid) => cards.filter(c => c.collection_id === cid)
    : () => cards;

  for (const col of colsToProcess) {
    const colCards = cardsByCol(col.id);
    
    const title = figma.createText();
    await title.loadFontAsync({ family: 'Inter', style: 'Bold' });
    title.characters = col.title;
    title.fontSize = 24;
    title.x = MARGIN;
    title.y = y;
    page.appendChild(title);
    y += 40;

    if (col.description) {
      const desc = figma.createText();
      await desc.loadFontAsync({ family: 'Inter', style: 'Regular' });
      desc.characters = col.description;
      desc.fontSize = 12;
      desc.x = MARGIN;
      desc.y = y;
      desc.resize(500, 30);
      page.appendChild(desc);
      y += 36;
    }

    for (let i = 0; i < colCards.length; i++) {
      const card = colCards[i];
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = MARGIN + col * (CARD_W + GAP);
      const cy = y + row * (CARD_H + GAP);

      const frame = figma.createFrame();
      frame.name = card.title;
      frame.x = x;
      frame.y = cy;
      frame.resize(CARD_W, CARD_H);
      frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      frame.strokes = [{ type: 'SOLID', color: { r: 0.4, g: 0.58, b: 0.93 } }];
      frame.strokeWeight = 2;
      frame.cornerRadius = 8;
      frame.layoutMode = 'VERTICAL';
      frame.primaryAxisAlignItems = 'MIN';
      frame.counterAxisAlignItems = 'MIN';
      frame.itemSpacing = 8;
      frame.paddingLeft = 16;
      frame.paddingRight = 16;
      frame.paddingTop = 16;
      frame.paddingBottom = 16;

      const titleText = figma.createText();
      await titleText.loadFontAsync({ family: 'Inter', style: 'Bold' });
      titleText.characters = `${card.title} (Lv.${card.interface_level || 1})`;
      titleText.fontSize = 16;

      const descText = figma.createText();
      await descText.loadFontAsync({ family: 'Inter', style: 'Regular' });
      descText.characters = (card.description || '无描述').slice(0, 80) + (card.description?.length > 80 ? '...' : '');
      descText.fontSize = 12;
      descText.resize(CARD_W - 32, 40);

      frame.appendChild(titleText);
      frame.appendChild(descText);
      page.appendChild(frame);
    }

    const rows = Math.ceil(colCards.length / COLS);
    y += (rows || 1) * (CARD_H + GAP) + 40;
  }

  figma.viewport.scrollAndZoomIntoView(page.children);
}
