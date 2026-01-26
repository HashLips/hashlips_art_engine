#!/usr/bin/env python3
"""
Export per-plot "plot cards" (cropped images + manifest) from existing manifests and renders.
Outputs:
  pipeline/exports/plots/cards/<PlotID>.png (512x512)
  pipeline/exports/plots/cards/<PlotID>_labeled.png (if labeled source exists)
  pipeline/exports/plots/plots_cards_manifest.json
  pipeline/exports/plots/plots_cards_manifest.csv
  Logs: pipeline/logs/export_plot_cards_log.txt

Uses:
  - pipeline/exports/plots_master.json
  - pipeline/exports/renders/meta/<Map>.json
  - pipeline/exports/renders/final/<Map>_styled_4k.png (and labeled version if present)
"""

from __future__ import annotations

import csv
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def world_to_px(x, y, meta):
    minx, miny = meta["world_bounds_min"]
    maxx, maxy = meta["world_bounds_max"]
    w = meta["image_w"]
    h = meta["image_h"]
    u = (x - minx) / (maxx - minx + 1e-6)
    v = (y - miny) / (maxy - miny + 1e-6)
    px = int(u * w)
    py = int(v * h)
    if meta.get("axis", {}).get("v_flipped", False):
        py = h - py
    return px, py


def crop_plot(img: Image.Image, bbox_px, out_size=512):
    x0, y0, x1, y1 = bbox_px
    width = x1 - x0
    height = y1 - y0
    cx = (x0 + x1) / 2
    cy = (y0 + y1) / 2
    size = max(width, height)
    # margin 15%
    size *= 1.15
    half = size / 2
    box = (
        int(cx - half),
        int(cy - half),
        int(cx + half),
        int(cy + half),
    )
    cropped = img.crop(box)
    return cropped.resize((out_size, out_size), Image.LANCZOS)


def main():
    root = Path.cwd()
    exports = root / "pipeline" / "exports"
    cards_dir = exports / "plots" / "cards"
    ensure_dir(cards_dir)
    log_dir = root / "pipeline" / "logs"
    ensure_dir(log_dir)
    log_file = log_dir / "export_plot_cards_log.txt"

    plots_master = exports / "plots_master.json"
    data = load_json(plots_master)
    if not data:
        print("[plot_cards] ERROR: plots_master.json missing or invalid")
        return 1
    plots = data.get("plots", data if isinstance(data, list) else [])

    meta_dir = exports / "renders" / "meta"
    final_dir = exports / "renders" / "final"

    manifest = []
    lines = []

    for p in plots:
        pid = p.get("plot_id")
        src = p.get("_source", "")
        district = p.get("district", "")
        faction = p.get("faction", "")
        loc = p.get("world_location", [0, 0, 0])
        # Infer map name: expected to be like L_<FACTION>_<DistrictSlug>
        map_name = Path(src.replace("plot_manifest_", "")).stem.replace(".json", "")
        map_name = map_name.replace("plot_manifest_", "")
        if map_name.lower().startswith("plot_manifest_"):
            map_name = map_name[len("plot_manifest_") :]
        if map_name.startswith("L_"):
            map_name = map_name
        else:
            # fallback: build from faction/district
            slug = f"{faction}_{district}".replace(" ", "").replace("-", "")
            map_name = f"L_{slug}"

        meta_path = meta_dir / f"{map_name}.json"
        meta = load_json(meta_path)
        if not meta:
            lines.append(f"SKIP {pid}: meta missing {meta_path}")
            continue

        styled = final_dir / f"{map_name}_styled_4k.png"
        styled_labeled = final_dir / f"{map_name}_styled_4k_labeled.png"
        if not styled.exists():
            lines.append(f"SKIP {pid}: styled missing {styled}")
            continue

        x, y = loc[0], loc[1]
        px, py = world_to_px(x, y, meta)
        tile_cm = meta.get("tile_cm", 1000)
        # Convert tile_cm to pixels using bounds
        px_per_cm_x = meta["image_w"] / (meta["world_bounds_max"][0] - meta["world_bounds_min"][0] + 1e-6)
        px_per_cm_y = meta["image_h"] / (meta["world_bounds_max"][1] - meta["world_bounds_min"][1] + 1e-6)
        half_w = int((tile_cm * px_per_cm_x) / 2)
        half_h = int((tile_cm * px_per_cm_y) / 2)
        bbox_px = (px - half_w, py - half_h, px + half_w, py + half_h)

        img = Image.open(styled).convert("RGB")
        card = crop_plot(img, bbox_px, out_size=512)
        card_path = cards_dir / f"{pid}.png"
        card.save(card_path)

        if styled_labeled.exists():
            img_l = Image.open(styled_labeled).convert("RGB")
            card_l = crop_plot(img_l, bbox_px, out_size=512)
            card_l.save(cards_dir / f"{pid}_labeled.png")

        manifest.append({
            "plot_id": pid,
            "faction": faction,
            "district": district,
            "map": map_name,
            "image": str(card_path.relative_to(root)),
            "image_labeled": str((cards_dir / f"{pid}_labeled.png").relative_to(root)) if (cards_dir / f"{pid}_labeled.png").exists() else "",
            "world_location": loc,
            "bbox_px": bbox_px,
        })
        lines.append(f"OK {pid}")

    # Write manifests
    cards_manifest_json = exports / "plots" / "plots_cards_manifest.json"
    cards_manifest_csv = exports / "plots" / "plots_cards_manifest.csv"
    ensure_dir(cards_manifest_json.parent)
    cards_manifest_json.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    with cards_manifest_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["plot_id", "faction", "district", "map", "image", "image_labeled", "world_location", "bbox_px"])
        writer.writeheader()
        for row in manifest:
            writer.writerow(row)

    log_file.write_text("\n".join(lines), encoding="utf-8")
    print(f"[plot_cards] done, {len(manifest)} cards")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
