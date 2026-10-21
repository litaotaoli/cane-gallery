# 万杖长廊 · Cane Gallery

> 古往今来，人与杖同行。
> A public gallery of canes and walking sticks — one photo at a time, from every era.

**万杖长廊**是一个只收录手杖静态照片的公开图库社区：绅士杖、徒步登山杖、白手杖、收藏杖、工艺杖，以及「人与杖」的历史瞬间与生活片段。

## 收录内容

| ✅ 收录 | ⛔ 不收 |
| --- | --- |
| 手杖 / 拐杖 / 徒步登山杖 / 白手杖 / 收藏杖 / 工艺杖照片 | 影视剧照、截图、海报、动画/电影帧 |
| 「人与杖」的生活瞬间、场景照片 | 视频、GIF、动图 |
| 公有领域历史影像（老照片、画作扫描，附出处） | AMBLE 产品图、品牌物料、商业广告 |
| — | 未经授权的他人作品 |
| — | 可识别未成年人未经监护人同意的照片 |
| — | 隐私、敏感地点、可识别个人住址等内容 |

## 快速浏览

- **画廊站点**：`site/`（GitHub Pages 部署后，可直接浏览全部照片，按来源 / 类型标签筛选）
- **照片库**：`photos/`，只按来源分三层：
  - `photos/modern/` — 当代照片（我拍的 / 我家的杖 / 街头随拍）
  - `photos/historical/` — 公有领域历史影像（老照片 / 画作扫描）
  - `photos/illustration/` — 场景图鉴插画（AI 生成示意画，与真实照片分离）
- **全量索引**：`photos/_meta/index.csv`（一行一张照片，机器可读）

## 如何贡献

投稿 = 你的一张照片 + 一段简短的说明。**不需要懂代码。**

- **路径 A（推荐）**：在站点点「投稿一张照片」走站内向导——选来源、写标题、提交，自动打开预填好的 Issue，把照片拖进附件框即可；
- **路径 B**：熟悉 GitHub 的话，Fork → 照片放入 `photos/modern/` 或 `photos/historical/` → 在 `index.csv` 末尾追加一行 → 提 Pull Request。

详细规则见 **[CONTRIBUTING.md](CONTRIBUTING.md)**。

## 许可

| 对象 | 许可 |
| --- | --- |
| 代码与文档 | MIT（见 [LICENSE](LICENSE)） |
| 图片 | 逐图声明：`CC0` / `CC BY 4.0` / `PD`（见 [IMAGE_LICENSE.md](IMAGE_LICENSE.md)） |

## 目录结构

```
cane-gallery/
├── README.md / LICENSE / IMAGE_LICENSE.md
├── CONTRIBUTING.md / CODE_OF_CONDUCT.md
├── .github/            # Issue / PR 模板
├── photos/             # 照片库（modern / historical / illustration / _meta）
├── site/               # GitHub Pages 画廊站点
├── tools/              # 校验与构建脚本
└── docs/               # 分类与标签体系说明
```

## 项目状态

- v0.1：仓库骨架 + 种子照片（12 张场景图鉴插画）+ Pages 展示站 ✅
- v0.2：开放投稿（Issue 模板 + CI 校验）✅
- v0.3：站点增强（明暗主题 + 中英文切换 + 画廊分页）✅
- v0.4：社区化（Discussions + 月度精选 + 真实照片入库）
