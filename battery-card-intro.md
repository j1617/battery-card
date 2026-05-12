# 🔋 Home Assistant 电池状态卡片 — 一键掌控全家设备电量

**告别逐一检查的繁琐，让低电量提醒一目了然。**

---

## 🔍 你是否也遇到过这些困扰？

智能家居设备越来越多，**电池焦虑**也随之而来：

- 😫 门锁突然没电，被锁在门外
- 😤 烟雾报警器没电却浑然不知
- 😅 温湿度传感器数据停了半个月才发现
- 😓 每次检查都要打开五六个实体逐一查看

**Home Assistant 里的电池设备散落在各个实体中，逐一排查效率太低。**

---

## 💡 一行配置，全家电池一目了然

今天推荐一个我写的 Home Assistant 自定义卡片——**Battery Card**，只需一行配置，就能自动扫描并展示所有电池设备的状态：

```yaml
type: custom:battery-card
title: 电池状态
```

效果预览：

```
┌─────────────────────────────────────────────┐
│  🔋 电池状态                     12 个设备   │
│                                             │
│  🟢 正常 7   🟡 预警 3   🔴 紧急 2         │
│                                             │
│  🔋 客厅门锁                ████████████ 92%│
│  🔋 卧室窗帘电机            ██████████░░ 85%│
│  🔋 厨房温湿度计            █████████░░░ 78%│
│  🔋 书房烟雾报警器          ███████░░░░░ 52%│
│  🔋 走廊人体感应            █████░░░░░░░ 30%│
│  🔋 阳台门磁传感器          ███░░░░░░░░░ 15%│
│                                             │
│  🟢 实时更新                              │
└─────────────────────────────────────────────┘
```

---

## ✨ 核心功能

### 🔎 自动发现，无需手动配置

卡片会**自动识别** Home Assistant 中所有电池相关实体：
- `device_class` 为 `battery` 的传感器
- 实体 ID 或名称包含 `battery`、`电量`、`电池` 等关键词
- 支持手动指定特定实体

### 🎨 两种显示模式

**纵向列表（默认）** — 适合设备数量较多、想看清每个设备详情的场景：

```
🔋 卧室门锁       ████████░░░  85%
🔋 客厅遥控器     ██████░░░░░░  62%
🔋 厨房温度计     ████░░░░░░░░  35%
```

**横向三列** — 适合设备较少、按状态分组的场景：

```
┌───────────────┬───────────────┬───────────────┐
│   🟢 正常 5   │   🟡 预警 3   │   🔴 紧急 2   │
├───────────────┼───────────────┼───────────────┤
│ 卧室门锁 92%  │ 客厅遥控 48%  │ 厨房温度 18%  │
│ 书房台灯 85%  │ 走廊感应 45%  │ 阳台门磁 12%  │
└───────────────┴───────────────┴───────────────┘
```

配置方式：

```yaml
type: custom:battery-card
title: 电池状态
display_mode: horizontal  # vertical（纵向）| horizontal（横向三列）
```

### 🚦 三级预警，颜色一眼区分

- 🟢 **正常**：电量 > 50%
- 🟡 **预警**：20% < 电量 ≤ 50%
- 🔴 **紧急**：电量 ≤ 20%

### 🔄 灵活排序

```yaml
sort_by: level      # level（按电量）| name（按名称）
sort_order: asc     # asc（低电量在前）| desc（高电量在前）
```

### 📊 顶部统计栏

一目了然看到正常/预警/紧急设备数量，不用一个个数。

---

## 📦 完整配置示例

```yaml
type: custom:battery-card
title: 全家电池状态

# 显示模式
display_mode: vertical   # vertical | horizontal
sort_by: level            # level | name
sort_order: asc           # asc | desc

# 阈值设置
critical_level: 20       # 紧急阈值
warning_level: 50        # 预警阈值

# 手动指定实体（可选）
entities:
  - sensor.bedroom_lock_battery
  - sensor.living_room_remote_battery
```

---

## 🚀 安装方法

### 方法一：HACS 安装（推荐）

1. 打开 **HACS → 前端**
2. 点击右下角 **+** 按钮
3. 选择 **自定义仓库**
4. 输入仓库地址：
   ```
   https://github.com/j1617/battery-card
   ```
5. 类别选择 **Lovelace**
6. 点击安装 ✅

### 方法二：手动安装

1. 下载 `battery-card.js` 到 HA 配置目录：
   ```
   /config/www/battery-card.js
   ```

2. 在 `configuration.yaml` 中添加资源引用：
   ```yaml
   lovelace:
     resources:
       - url: /local/battery-card.js
         type: module
   ```

3. 重启 Home Assistant

4. 仪表板 → 添加卡片 → 选择 **"电池状态卡片"**

---

## 🛠 故障排除

**Q: 卡片显示"无电池设备"？**

> 确认你的电池传感器实体 ID 以 `sensor.` 开头，且 state 值为 0-100 的数字。

**Q: 某些电池设备没有被识别？**

> 使用 `entities` 配置项手动指定：
> ```yaml
> entities:
>   - sensor.my_device_battery
> ```

**Q: 想用深色主题？**
> ```yaml
> background_color: '#1a1f2e'
> text_color: '#f1f5f9'
> secondary_color: '#94a3b8'
> ```

---

## 📋 更新日志

- **v1.3.0**：新增横向三列显示模式
- **v1.1.0**：支持手动指定实体，优化识别逻辑
- **v1.0.0**：首发版本

---

## 🔗 项目地址

- **GitHub**：https://github.com/j1617/battery-card
- **版本**：v1.3.0
- **许可证**：MIT 开源免费

---

**如果你也在用 Home Assistant，欢迎安装体验！**

有问题或建议？欢迎在 GitHub 提 Issue，也可以在评论区留言。

> 💡 推荐配合 [phone-info-card（话费卡片）](https://github.com/j1617/phone-info-card) 一起使用，一键查看手机话费和电池，不错过任何低电量提醒。

---

*工具箱达人 · 专注 Home Assistant 自动化技巧与插件开发*