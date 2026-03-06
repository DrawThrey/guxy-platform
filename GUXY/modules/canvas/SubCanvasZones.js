/**
 * GUXY 子画布区域容器模块
 * 管理一级/二级/三级界面三个容器区域，支持拖拽跨区域移动与边缘高亮
 * 参考 PiaJi 实现
 */

GUXY.SubCanvasZones = {
  zoneContainer: null,
  ZONE_COLUMN_WIDTH: 560,
  ZONE_HEIGHT: 2400,
  ZONE_ORIGINS: null,

  /**
   * 初始化区域原点（三区域）
   */
  initOrigins() {
    const startX = 20;
    const startY = 80;
    const w = this.ZONE_COLUMN_WIDTH;
    this.ZONE_ORIGINS = {
      level1: { x: startX, y: startY },
      level2: { x: startX + w, y: startY },
      level3: { x: startX + w * 2, y: startY }
    };
    return this.ZONE_ORIGINS;
  },

  /**
   * 根据卡片获取所属区域
   * @param {object} card - 卡片数据
   * @returns {'level1'|'level2'|'level3'}
   */
  getCardZone(card) {
    const level = card.interface_level;
    if (level === 2) return 'level2';
    if (level === 3) return 'level3';
    return 'level1';
  },

  /**
   * 根据画布坐标检测所在区域
   * @param {number} canvasX - 画布 X 坐标
   * @param {number} canvasY - 画布 Y 坐标
   * @returns {'level1'|'level2'|'level3'|null}
   */
  detectZoneFromPosition(canvasX, canvasY) {
    const origins = this.ZONE_ORIGINS || this.initOrigins();
    const zoneWidth = this.ZONE_COLUMN_WIDTH;
    const zoneStartY = origins.level1.y;
    if (canvasY < zoneStartY) return null;
    for (const [zoneKey, origin] of Object.entries(origins)) {
      if (canvasX >= origin.x && canvasX < origin.x + zoneWidth) {
        return zoneKey;
      }
    }
    return null;
  },

  /**
   * 创建区域容器 DOM，插入到画布中
   * @param {HTMLElement} parent - 父容器（通常为 canvas-transform）
   * @param {HTMLElement} insertBefore - 插入到此元素之前（通常为 nodes-container）
   */
  createZoneContainers(parent, insertBefore) {
    this.removeZoneContainers();
    this.initOrigins();
    const origins = this.ZONE_ORIGINS;
    const zoneWidth = this.ZONE_COLUMN_WIDTH;
    const zoneHeight = this.ZONE_HEIGHT;

    const container = document.createElement('div');
    container.className = 'subcanvas-zone-container';

    ['level1', 'level2', 'level3'].forEach((zoneKey, i) => {
      const origin = origins[zoneKey];
      const zone = document.createElement('div');
      zone.className = `subcanvas-zone subcanvas-zone-${zoneKey}`;
      zone.dataset.zone = zoneKey;
      zone.style.cssText = `left:${origin.x}px;top:${origin.y}px;width:${zoneWidth}px;height:${zoneHeight}px`;
      container.appendChild(zone);
    });

    if (insertBefore) {
      parent.insertBefore(container, insertBefore);
    } else {
      parent.appendChild(container);
    }
    this.zoneContainer = container;
  },

  /**
   * 移除区域容器
   */
  removeZoneContainers() {
    if (this.zoneContainer && this.zoneContainer.parentNode) {
      this.zoneContainer.remove();
    }
    this.zoneContainer = null;
  },

  /**
   * 高亮指定区域
   * @param {'level1'|'level2'|'level3'|null} zoneKey - 要高亮的区域，null 则清除所有
   */
  highlightZone(zoneKey) {
    const zones = document.querySelectorAll('.subcanvas-zone');
    zones.forEach(zone => {
      zone.classList.toggle('highlighted', zone.dataset.zone === zoneKey);
    });
  },

  /**
   * 清除所有区域高亮
   */
  clearHighlight() {
    this.highlightZone(null);
  },

  /**
   * 区域键转 interface_level
   * @param {string} zoneKey
   * @returns {number}
   */
  zoneToInterfaceLevel(zoneKey) {
    if (zoneKey === 'level1') return 1;
    if (zoneKey === 'level2') return 2;
    if (zoneKey === 'level3') return 3;
    return 1;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.SubCanvasZones;
}
