#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_site.py — 由 index.csv 生成画廊数据，并把照片复制进 site/（站点自包含）：
  1. site/data/photos.json（供 GitHub Pages 部署后 fetch）
  2. 内联进 site/index.html 的 window.__GALLERY_DATA__（供本地 file:// 直接打开）
  3. 复制 photos/ → site/photos/（GitHub Pages 只发布 site/，图片必须随站点一起发布）
用法：python tools/build_site.py [--root ../]
每次入库（新增照片）后运行一次即可。
"""

import argparse
import csv
import json
import os
import re
import shutil


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="..", help="仓库根目录（默认上一级）")
    args = ap.parse_args()
    root = os.path.abspath(args.root)
    csv_path = os.path.join(root, "photos", "_meta", "index.csv")
    out_dir = os.path.join(root, "site", "data")
    out_path = os.path.join(out_dir, "photos.json")
    index_path = os.path.join(root, "site", "index.html")

    with open(csv_path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    # 过滤掉 id 为空的待处理行
    valid = [r for r in rows if r.get("id", "").strip()]

    # 1) 输出 photos.json
    os.makedirs(out_dir, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(valid, f, ensure_ascii=False, indent=2)

    # 2) 内联进 index.html（中文站 + 英文站）
    payload = json.dumps(valid, ensure_ascii=False)
    for index_rel in ("site/index.html", "site/en/index.html"):
        index_path = os.path.join(root, index_rel)
        with open(index_path, encoding="utf-8") as f:
            html = f.read()
        marker = re.compile(
            r"window\.__GALLERY_DATA__\s*=\s*[^;]*;"
        )
        if not marker.search(html):
            print(f"WARN: 未在 {index_path} 找到内联占位符，跳过内联写入")
        else:
            html = marker.sub("window.__GALLERY_DATA__ = " + payload + ";", html)
            with open(index_path, "w", encoding="utf-8") as f:
                f.write(html)

    # 3) 复制照片进 site/photos/（站点自包含）
    site_photos = os.path.join(root, "site", "photos")
    if os.path.isdir(site_photos):
        shutil.rmtree(site_photos)
    shutil.copytree(os.path.join(root, "photos"), site_photos,
                    ignore=shutil.ignore_patterns("_meta"))

    print(f"已生成 {out_path} + 内联到 index.html + 照片复制到 site/photos/：{len(valid)} 张照片")


if __name__ == "__main__":
    main()
