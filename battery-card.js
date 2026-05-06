/**
 * Battery Card - Home Assistant Lovelace Custom Card
 * Version: 1.1.0
 * Description: Display battery status and level for all battery entities
 */

console.info(
  '%c BATTERY-CARD %c v1.1.0 ',
  'color: #059669; font-weight: bold; background: #ecfdf5; padding: 2px 6px; border-radius: 3px 0 0 3px;',
  'color: white; background: #059669; padding: 2px 6px; border-radius: 0 3px 3px 0;'
);

class BatteryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this.config = {
      // 默认配置
      title: '电池状态',
      sort_by: 'level',  // level | name | state
      sort_order: 'asc',  // asc | desc
      group_by: null,     // null | room | device
      show_empty: false,
      empty_value: '无电池设备',
      // 阈值配置
      critical_level: 20,
      warning_level: 50,
      // 样式配置
      background_color: '#ffffff',
      text_color: '#1e293b',
      secondary_color: '#64748b',
      ...config
    };
    this._updateCard();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateCard();
  }

  connectedCallback() {
    this._updateCard();
  }

  _isBatteryEntity(entityId, state) {
    // 1. device_class 为 battery 的一定是电池
    if (state.attributes && state.attributes.device_class === 'battery') {
      return true;
    }

    // 2. 实体 ID 或 friendly_name 包含电池相关关键词
    const id = entityId.toLowerCase();
    const name = (state.attributes && (state.attributes.friendly_name || ''))
      .toLowerCase();
    const combined = id + ' ' + name;

    const keywords = [
      'battery',        // 英文：电池
      'batterylevel',   // battery level 变体
      'battery_level',
      'batterypct',
      'batterypct',
      '电量',            // 中文：电量
      '电池',            // 中文：电池
      '充电',            // 中文：充电
      '剩余电量',        // 中文：剩余电量
    ];

    for (const kw of keywords) {
      if (combined.includes(kw)) {
        return true;
      }
    }

    return false;
  }

  _getBatteryEntities() {
    if (!this._hass) return [];

    const entities = [];
    const seen = new Set();

    // 如果用户手动指定了实体列表，只显示这些
    if (this.config.entities && Array.isArray(this.config.entities) && this.config.entities.length > 0) {
      for (const entityId of this.config.entities) {
        if (seen.has(entityId)) continue;
        const state = this._hass.states[entityId];
        if (!state) continue;
        const item = this._buildBatteryItem(entityId, state);
        if (item) {
          entities.push(item);
          seen.add(entityId);
        }
      }
      return this._sortEntities(entities);
    }

    // 自动扫描：遍历所有实体，查找电池相关的
    for (const [entityId, state] of Object.entries(this._hass.states)) {
      // 跳过非传感器
      if (!entityId.startsWith('sensor.')) continue;

      // 跳过已经处理过的
      if (seen.has(entityId)) continue;

      // 关键过滤：必须通过名称/device_class 判断为电池实体
      if (!this._isBatteryEntity(entityId, state)) continue;

      const batteryLevel = this._getBatteryLevel(state);

      // 如果是电池实体，即使拿不到具体数值也展示
      if (batteryLevel !== null) {
        const item = this._buildBatteryItem(entityId, state);
        if (item) {
          entities.push(item);
          seen.add(entityId);
        }
      }
    }

    return this._sortEntities(entities);
  }

  _buildBatteryItem(entityId, state) {
    const batteryLevel = this._getBatteryLevel(state);
    const friendlyName = state.attributes.friendly_name ||
                         entityId.replace('sensor.', '').replace(/_/g, ' ');
    const areaId = this._getAreaId(entityId);

    return {
      entity_id: entityId,
      name: friendlyName,
      area: areaId,
      battery_level: batteryLevel,
      icon: this._getBatteryIcon(batteryLevel),
      color: this._getBatteryColor(batteryLevel),
      unit: '%',
      last_changed: state.last_changed,
    };
  }

  _getBatteryLevel(state) {
    // 直接是电量数值
    if (state.state && !isNaN(state.state)) {
      const level = parseInt(state.state);
      if (level >= 0 && level <= 100) {
        return level;
      }
    }
    // 从属性中获取
    if (state.attributes) {
      if (state.attributes.battery_level !== undefined) {
        return parseInt(state.attributes.battery_level);
      }
      if (state.attributes.battery !== undefined) {
        return parseInt(state.attributes.battery);
      }
    }
    return null;
  }

  _getBatteryState(state) {
    if (state.attributes) {
      return state.attributes.battery_state || 
             state.attributes.charging ||
             state.attributes.state;
    }
    return state.state;
  }

  _getAreaId(entityId) {
    // 从实体ID推断区域（常见命名模式）
    const entityName = entityId.replace('sensor.', '');
    const parts = entityName.split('_');
    
    // 常见的房间名称
    const rooms = ['living_room', 'bedroom', 'kitchen', 'bathroom', 'office', 
                   'hallway', 'garage', 'garden', 'balcony', 'master_bedroom',
                   '客厅', '卧室', '厨房', '卫生间', '书房', '走廊', '阳台'];
    
    for (const room of rooms) {
      if (entityName.includes(room)) {
        return room.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
      }
    }
    
    return null;
  }

  _getBatteryIcon(level) {
    if (level === null) return '❓';
    if (level >= 90) return '🔋';
    if (level >= 60) return '🟢';
    if (level >= 40) return '🟡';
    if (level >= 20) return '🟠';
    return '🔴';
  }

  _getBatteryColor(level) {
    if (level === null) return '#94a3b8';
    if (level <= this.config.critical_level) return '#ef4444';
    if (level <= this.config.warning_level) return '#f59e0b';
    return '#10b981';
  }

  _sortEntities(entities) {
    const { sort_by, sort_order } = this.config;
    const multiplier = sort_order === 'desc' ? -1 : 1;

    return entities.sort((a, b) => {
      if (sort_by === 'level') {
        return multiplier * ((a.battery_level || 0) - (b.battery_level || 0));
      } else if (sort_by === 'name') {
        return multiplier * a.name.localeCompare(b.name);
      } else {
        return multiplier * a.name.localeCompare(b.name);
      }
    });
  }

  _groupEntities(entities) {
    const { group_by } = this.config;
    
    if (!group_by || group_by === 'none') {
      return { '所有设备': entities };
    }

    const groups = {};
    for (const entity of entities) {
      const key = entity.area || '未分组';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entity);
    }
    
    return groups;
  }

  _createBatteryItem(entity) {
    const level = entity.battery_level;
    const color = entity.color;
    const icon = entity.icon;
    const name = entity.name;
    
    // 电池进度条
    let progressBar = '';
    if (level !== null) {
      const levelColor = this._getBatteryColor(level);
      const lowColor = level <= this.config.critical_level ? levelColor : '#e2e8f0';
      progressBar = `
        <div class="battery-progress">
          <div class="battery-progress-track">
            <div class="battery-progress-fill" style="width: ${level}%; background: ${levelColor};"></div>
          </div>
        </div>
      `;
    }

    // 电量数值
    let levelDisplay = '';
    if (level !== null) {
      levelDisplay = `
        <div class="battery-level">
          <span class="level-value" style="color: ${color};">${level}</span>
          <span class="level-unit">${entity.unit}</span>
        </div>
      `;
    }

    return `
      <div class="battery-item">
        <div class="battery-icon" style="color: ${color};">${icon}</div>
        <div class="battery-info">
          <div class="battery-name">${name}</div>
          ${progressBar}
        </div>
        ${levelDisplay}
      </div>
    `;
  }

  _updateCard() {
    if (!this.config) return;

    const entities = this._getBatteryEntities();
    const groups = this._groupEntities(entities);
    const { background_color, text_color, secondary_color, title } = this.config;

    // 统计信息
    const totalBatteries = entities.length;
    const criticalCount = entities.filter(e => e.battery_level !== null && e.battery_level <= this.config.critical_level).length;
    const warningCount = entities.filter(e => e.battery_level !== null && e.battery_level > this.config.critical_level && e.battery_level <= this.config.warning_level).length;
    const goodCount = entities.filter(e => e.battery_level !== null && e.battery_level > this.config.warning_level).length;

    let groupsHtml = '';
    for (const [groupName, groupEntities] of Object.entries(groups)) {
      if (groupEntities.length === 0) continue;

      const groupHeader = Object.keys(groups).length > 1 ? 
        `<div class="group-header">${groupName}</div>` : '';

      const itemsHtml = groupEntities.map(e => this._createBatteryItem(e)).join('');

      groupsHtml += `
        ${groupHeader}
        <div class="battery-list">${itemsHtml}</div>
      `;
    }

    // 空状态
    const emptyHtml = entities.length === 0 ? 
      `<div class="empty-state">${this.config.empty_value}</div>` : '';

    // 统计栏
    const statsHtml = totalBatteries > 0 ? `
      <div class="stats-bar">
        <div class="stat-item stat-good">
          <span class="stat-dot"></span>
          <span class="stat-label">正常</span>
          <span class="stat-value">${goodCount}</span>
        </div>
        <div class="stat-item stat-warning">
          <span class="stat-dot"></span>
          <span class="stat-label">预警</span>
          <span class="stat-value">${warningCount}</span>
        </div>
        <div class="stat-item stat-critical">
          <span class="stat-dot"></span>
          <span class="stat-label">紧急</span>
          <span class="stat-value">${criticalCount}</span>
        </div>
      </div>
    ` : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        ha-card {
          background: ${background_color};
          border-radius: var(--ha-card-border-radius, 16px);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .card-content {
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: ${text_color};
        }
        
        /* 顶部 */
        .card-header {
          padding: 18px 20px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
        }
        
        .title-icon {
          font-size: 22px;
        }
        
        .battery-count {
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: ${secondary_color};
        }
        
        /* 统计栏 */
        .stats-bar {
          display: flex;
          gap: 12px;
          padding: 12px 20px;
          margin: 14px 20px;
          background: #f8fafc;
          border-radius: 12px;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          font-size: 12px;
        }
        
        .stat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .stat-good .stat-dot { background: #10b981; }
        .stat-warning .stat-dot { background: #f59e0b; }
        .stat-critical .stat-dot { background: #ef4444; }
        
        .stat-label {
          color: ${secondary_color};
        }
        
        .stat-value {
          font-weight: 700;
          margin-left: 2px;
        }
        
        /* 分组 */
        .group-header {
          padding: 12px 20px 6px;
          font-size: 12px;
          font-weight: 600;
          color: ${secondary_color};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        /* 电池列表 */
        .battery-list {
          padding: 0 12px 12px;
        }
        
        /* 电池项 */
        .battery-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .battery-item:hover {
          background: #f8fafc;
        }
        
        .battery-icon {
          font-size: 26px;
          width: 44px;
          text-align: center;
          flex-shrink: 0;
        }
        
        .battery-info {
          flex: 1;
          min-width: 0;
        }
        
        .battery-name {
          font-size: 14px;
          font-weight: 600;
          color: ${text_color};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* 进度条 */
        .battery-progress {
          margin-top: 6px;
        }
        
        .battery-progress-track {
          height: 5px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .battery-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        
        /* 电量数值 */
        .battery-level {
          display: flex;
          align-items: baseline;
          margin-left: 12px;
          flex-shrink: 0;
        }
        
        .level-value {
          font-size: 22px;
          font-weight: 800;
        }
        
        .level-unit {
          font-size: 12px;
          color: ${secondary_color};
          margin-left: 1px;
        }
        
        /* 空状态 */
        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: ${secondary_color};
          font-size: 14px;
        }
        
        /* 底部 */
        .card-footer {
          padding: 12px 20px 18px;
          border-top: 1px solid #f1f5f9;
          margin-top: 4px;
        }
        
        .update-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: ${secondary_color};
        }
        
        .update-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
        }
        
        /* 响应式 */
        @media (max-width: 400px) {
          .stats-bar {
            flex-wrap: wrap;
          }
          .stat-item {
            flex: 1 1 33%;
          }
          .battery-level {
            margin-left: 8px;
          }
          .level-value {
            font-size: 18px;
          }
        }
      </style>
      
      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">
              <span class="title-icon">🔋</span>
              <span>${title}</span>
            </div>
            <span class="battery-count">${totalBatteries} 个设备</span>
          </div>
          
          ${statsHtml}
          ${emptyHtml}
          ${groupsHtml}
          
          <div class="card-footer">
            <div class="update-info">
              <span class="update-dot"></span>
              <span>实时更新</span>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 4;
  }

  static getStubConfig() {
    return {
      title: '电池状态',
      sort_by: 'level',
      group_by: null,
    };
  }
}

// 注册自定义元素
if (!customElements.get('battery-card')) {
  customElements.define('battery-card', BatteryCard);
}

// 注册到 Home Assistant 卡片选择器
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'battery-card',
  name: '电池状态卡片',
  description: '显示所有电池设备的状态和电量',
  documentationURL: 'https://github.com/j1617/battery-card',
});
