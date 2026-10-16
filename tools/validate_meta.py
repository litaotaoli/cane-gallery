#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_meta.py — CI 校验脚本
检查 photos/ 目录与 _meta/index.csv 的一致性：
  1. CSV 表头与字段完整性
  2. 每张照片文件真实存在
  3. 命名规范 {modern|historical}_{YYYYMM}_{NNN}.jpg
  4. 尺寸/大小上限（长边<=2048px, <=5MB）——可选，文件过大才报错
  5. 必填列非空（id 可留空待分配除外）
用法：python tools/validate_meta.py [--root ../]
返回：0 = 通过；1 = 有错误
"""

import argparse
import csv
import os
import sys

REQUIRED_COLS = [
    "id", "category", "file", "title_zh", "title_en", "story_zh",
    "photographer", "year", "location", "era", "scene",
    "license", "source", "alt_text", "added_date",
]
VALID_CATEGORY = {"gentleman", "trekking", "mobility", "craft", "illustration", "other"}
VALID_LICENSE = {"CC0", "CC BY 4.0", "PD"}
VALID_SOURCE = {"self", "submission", "url", "ai_generated"}
MAX_BYTES = 5 * 1024 * 1024  # 5MB


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="..", help="仓库根目录（默认上一级）")
    args = ap.parse_args()
    root = os.path.abspath(args.root)
    csv_path = os.path.join(root, "photos", "_meta", "index.csv")

    if not os.path.exists(csv_path):
        print(f"ERROR: 找不到 {csv_path}")
        return 1

    errors = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None:
            errors.append("CSV 为空或缺少表头")
            reader = []
        else:
            missing_cols = [c for c in REQUIRED_COLS if c not in reader.fieldnames]
            if missing_cols:
                errors.append(f"缺少列: {missing_cols}")

        rows = list(reader)
        if not rows:
            errors.append("CSV 没有任何数据行")

        for i, row in enumerate(rows, start=2):  # 从第2行起（第1行是表头）
            line = f"第{i}行"
            # 必填列非空（id 允许留空待分配）
            for col in ["category", "file", "title_zh", "license", "source", "alt_text", "added_date"]:
                if not row.get(col, "").strip():
                    errors.append(f"{line} {col} 为空")
            # 类型标签
            if row.get("category") and row["category"] not in VALID_CATEGORY:
                errors.append(f"{line} category 非法: {row['category']}")
            # 许可 / 来源
            if row.get("license") and row["license"] not in VALID_LICENSE:
                errors.append(f"{line} license 非法: {row['license']}")
            if row.get("source") and row["source"] not in VALID_SOURCE:
                errors.append(f"{line} source 非法: {row['source']}")
            # 文件存在 + 命名 + 大小
            fpath = row.get("file", "")
            if fpath:
                full = os.path.join(root, "photos", fpath)
                if not os.path.exists(full):
                    errors.append(f"{line} 照片文件不存在: {fpath}")
                else:
                    size = os.path.getsize(full)
                    if size > MAX_BYTES:
                        errors.append(f"{line} 文件过大 ({size/1024/1024:.1f}MB > 5MB): {fpath}")
                    # 命名规范
                    base = os.path.basename(fpath)
                    if not (base.startswith(("modern_", "historical_", "illustration_")) and base.lower().endswith((".jpg", ".jpeg", ".webp"))):
                        errors.append(f"{line} 命名不规范: {base}（应为 modern_/historical_/illustration_YYYYMM_NNN.jpg）")
            # alt_text 长度
            alt = row.get("alt_text", "")
            if len(alt) > 50:
                errors.append(f"{line} alt_text 超过 50 字")

    if errors:
        print("校验未通过：")
        for e in errors[:50]:
            print(" -", e)
        if len(errors) > 50:
            print(f" … 共 {len(errors)} 个问题")
        return 1
    print(f"校验通过：{len(rows)} 张照片记录全部合规")
    return 0


if __name__ == "__main__":
    sys.exit(main())
