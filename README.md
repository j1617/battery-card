# Home Assistant 电池状态卡片

HA插件交流QQ群： 754364399

关注公众号【工具箱达人】，里面有详细的使用教程

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://hacs.xyz/)
[![version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/j1617/battery-card)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

一个优雅的 Home Assistant Lovelace 自定义卡片，自动显示所有电池设备的状态和电量。

**当前版本: v1.3.0**

## 预览效果

### 纵向列表模式（默认）

```
┌─────────────────────────────────────────┐
│  🔋 电池状态              5 个设备      │
│                                         │
│  🟢 正常 3  🟡 预警 1  🔴 紧急 1 │   │
│                                         │
│  📱 客厅遥控器           ████████ 85%  │
│  📱 卧室门锁             █████ 45%     │
│  📱 厨房温度计           ███ 15%       │
│  📱 书房烟雾报警器       █████████ 92% │
│  📱 走廊人体感应         ██████████ 100%│
│                                         │
│  🟢 实时更新                            │
└─────────────────────────────────────────┘
```

### 横向三列模式

```
┌─────────────────────────────────────────┐
│  🔋 电池状态              5 个设备      │
│                                         │
│  🟢 正常 3  🟡 预警 1  🔴 紧急 1 │   │
│                                         │
│ ┌───────────┬───────────┬─────────────┐ │
│ │ 🟢 正常 3 │ 🟡 预警 1 │ 🔴 紧急 1  │ │
│ ├───────────┼───────────┼─────────────┤ │
│ │ 书房烟雾  │ 卧室门锁  │ 厨房温度计  │ │
│ │   92%     │   45%     │   15%       │ │
│ │ 客厅遥控器│           │             │ │
│ │   85%     │           │             │ │
│ │ 走廊人体  │           │             │ │
│ │  100%     │           │             │ │
│ └───────────┴───────────┴─────────────┘ │
└─────────────────────────────────────────┘
```

## 功能特性

- ✅ **自动发现** - 自动扫描所有电池实体，无需手动配置
- 📊 **进度条显示** - 直观展示电量使用情况
- 🚦 **三级预警** - 正常/预警/紧急三色提醒
- 📱 **按房间分组** - 可按区域自动分组显示
- 🔄 **排序功能** - 按电量/名称排序
- 🎨 **自定义主题** - 支持浅色/深色主题
- ⚙️ **阈值可调** - 自定义预警和紧急阈值

## 安装方法

### 方法一：HACS 安装（推荐）

1. 打开 HACS → 前端
2. 点击右下角 "+" 按钮
3. 选择 "自定义仓库"
4. 输入仓库地址: `https://github.com/j1617/battery-card`
5. 选择类别为 "Lovelace"
6. 点击安装

### 方法二：手动安装

1. 将 `battery-card.js` 下载到 Home Assistant 配置目录：
   ```
   /config/www/battery-card.js
   ```

2. 在 Home Assistant 中，进入 **设置 → 仪表板 → 资源**
   或编辑 `configuration.yaml`：
   ```yaml
   lovelace:
     resources:
       - url: /local/battery-card.js
         type: module
   ```

3. 重启 Home Assistant

## 使用方法

### 添加卡片

1. 进入仪表板编辑模式
2. 点击 "添加卡片"
3. 选择 "电池状态卡片"
4. 保存即可

### YAML 配置示例

#### 基础配置

```yaml
type: custom:battery-card
title: 电池状态
```

#### 手动指定实体

如果自动识别遗漏了某些电池实体，可以手动指定：

```yaml
type: custom:battery-card
title: 电池状态
entities:
  - sensor.bedroom_lock_battery
  - sensor.living_room_remote_battery
  - sensor.my_custom_battery_sensor
```

> 配置 `entities` 后将跳过自动扫描，只显示指定的实体。

#### 显示模式配置

##### 纵向列表（默认）

```yaml
type: custom:battery-card
title: 电池状态
display_mode: vertical  # 纵向列表
sort_by: level          # level | name
sort_order: asc         # asc（低电量在前）| desc（高电量在前）
```

##### 横向三列

```yaml
type: custom:battery-card
title: 电池状态
display_mode: horizontal  # 横向三列（正常 | 预警 | 紧急）
sort_by: level            # asc：低电量在前（紧急列先看到低电量）| desc：高电量在前
sort_order: asc
```

#### 按房间分组

```yaml
type: custom:battery-card
title: 电池状态
group_by: area
sort_by: level
```

## 配置选项

### 基础配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `entities` | list | [] | 手动指定实体列表（配置后跳过自动扫描）|
| `title` | string | 电池状态 | 卡片标题 |
| `display_mode` | string | vertical | 显示模式：vertical（纵向）/ horizontal（横向三列）|
| `sort_by` | string | level | 排序方式：level（电量）/ name（名称）|
| `sort_order` | string | asc | 排序顺序：asc（低电量在前）/ desc（高电量在前）|
| `group_by` | string | null | 分组方式：null（不分组）/ area（按房间）|
| `show_empty` | boolean | false | 是否显示空状态 |

### 阈值配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `critical_level` | number | 20 | 紧急电量阈值（低于此值显示红色）|
| `warning_level` | number | 50 | 预警电量阈值（低于此值显示黄色）|

### 样式配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `background_color` | string | #ffffff | 卡片背景色 |
| `text_color` | string | #1e293b | 主文字颜色 |
| `secondary_color` | string | #64748b | 次要文字颜色 |
| `empty_value` | string | 无电池设备 | 空状态提示文字 |

## 工作原理

卡片通过以下规则识别电池实体：

1. **device_class** - 实体 `device_class` 为 `battery` 的传感器
2. **关键词匹配** - 实体 ID 或 `friendly_name` 包含以下关键词：
   - 英文：`battery`、`battery_level`
   - 中文：`电量`、`电池`、`充电`、`剩余电量`
3. **手动指定** - 通过 `entities` 配置项直接指定

> 满足以上**任一条件**即会被识别为电池实体。

支持的电池设备包括但不限于：
- 智能门锁
- 温湿度传感器
- 烟雾报警器
- 遥控器
- 门窗传感器
- 人体感应器
- 扫地机器人
- 智能手表/手环

## 故障排除

### 卡片显示"无电池设备"

1. 确认你有电池相关的传感器实体
2. 检查实体 ID 是否为 `sensor.xxx` 开头
3. 确认传感器有有效的电量数值（0-100）

### 电量显示不正确

某些设备的电量可能在实体属性中而非 state：
- 检查开发者工具中该实体的状态
- 确认 `battery_level` 或 `battery` 属性的值在 0-100 范围内

### 深色主题适配

```yaml
type: custom:battery-card
background_color: '#1a1f2e'
text_color: '#f1f5f9'
secondary_color: '#94a3b8'
```

## 项目信息

- **GitHub**: https://github.com/j1617/battery-card
- **版本**: v1.3.0
- **许可证**: MIT

## 许可证

MIT License
