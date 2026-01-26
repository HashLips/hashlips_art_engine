#!/usr/bin/env python3
"""
Install the Goblinverse UE↔Blender pipeline template into the Unreal project root.

Steps:
- Locate the Unreal project root (latest .uproject).
- Locate goblinverse_pipeline_template.zip (latest).
- Backup existing pipeline/ and run scripts if present.
- Extract zip safely to a temp dir, then copy into project root (no nested folders).
- Append .gitignore entries for generated outputs.
- Verify required files and print a summary.
"""

from __future__ import annotations

import shutil
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path
import sys


REQUIRED_ROOT_FILES = [
    "run_pipeline.bat",
    "run_pipeline.sh",
    "run_blender_headless.bat",
    "run_blender_headless.sh",
    "README.txt",
]

REQUIRED_PIPELINE_FILES = [
    "pipeline/config.json",
    "pipeline/unreal/export_generated_meshes_to_fbx.py",
    "pipeline/unreal/import_reimport_from_blender.py",
    "pipeline/unreal/seed_placeholder_meshes.py",
    "pipeline/blender/process_fbx_uv_material_export.py",
]


def uniq_existing(paths):
    seen = set()
    result = []
    for p in paths:
        rp = Path(p).resolve()
        if rp not in seen and rp.exists():
            seen.add(rp)
            result.append(rp)
    return result


def find_latest(pattern: str, bases: list[Path]) -> Path | None:
    matches: list[Path] = []
    for base in bases:
        try:
            matches.extend(list(base.rglob(pattern)))
        except (PermissionError, OSError):
            continue
    if not matches:
        return None
    matches.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return matches[0]


def safe_extract(zip_path: Path, dest: Path) -> Path:
    """Extract zip to dest safely (zip-slip protection). Return extraction root."""
    with zipfile.ZipFile(zip_path, "r") as zf:
        for info in zf.infolist():
            member = Path(info.filename)
            if member.is_absolute():
                raise RuntimeError(f"Unsafe absolute path in zip: {info.filename}")
            # Reject path traversal
            resolved = (dest / member).resolve()
            if not str(resolved).startswith(str(dest.resolve())):
                raise RuntimeError(f"Unsafe path in zip: {info.filename}")
        zf.extractall(dest)
    return dest


def pick_base_after_extract(tempdir: Path) -> Path:
    candidates = [p for p in tempdir.iterdir() if p.name != "__MACOSX"]
    if len(candidates) == 1 and candidates[0].is_dir():
        return candidates[0]
    return tempdir


def ensure_gitignore(project_root: Path):
    gi_path = project_root / ".gitignore"
    needed = ["pipeline/exports/", "pipeline/logs/"]
    existing = []
    if gi_path.exists():
        existing = [line.strip() for line in gi_path.read_text().splitlines()]
    with gi_path.open("a", encoding="utf-8") as f:
        for entry in needed:
            if entry not in existing:
                f.write(("\n" if existing else "") + entry)
                existing.append(entry)


def main():
    cwd = Path.cwd().resolve()
    home = Path.home().resolve()
    search_roots = uniq_existing(
        [
            cwd,
            cwd.parent,
            home,
            home / "Documents",
            home / "Documents" / "Unreal Projects",
            home / "Downloads",
        ]
    )

    uproject = find_latest("*.uproject", search_roots)
    if not uproject:
        print("ERROR: No .uproject found. Searched in: " + ", ".join(map(str, search_roots)))
        sys.exit(1)
    project_root = uproject.parent

    zip_path = find_latest("goblinverse_pipeline_template.zip", search_roots)
    if not zip_path:
        print("ERROR: goblinverse_pipeline_template.zip not found. Searched in: " + ", ".join(map(str, search_roots)))
        sys.exit(1)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = project_root / f"pipeline_backup_{timestamp}"
    backup_root_files = backup_dir / "root_files"
    made_backup = False

    pipeline_dir = project_root / "pipeline"
    root_files = [project_root / name for name in REQUIRED_ROOT_FILES]

    if pipeline_dir.exists() or any(p.exists() for p in root_files):
        backup_dir.mkdir(parents=True, exist_ok=True)
        backup_root_files.mkdir(parents=True, exist_ok=True)
        made_backup = True
        if pipeline_dir.exists():
            shutil.move(str(pipeline_dir), str(backup_dir / "pipeline"))
        for rf in root_files:
            if rf.exists():
                shutil.move(str(rf), str(backup_root_files / rf.name))

    tempdir = Path(tempfile.mkdtemp(prefix="goblinverse_install_")).resolve()
    try:
        safe_extract(zip_path, tempdir)
        base = pick_base_after_extract(tempdir)
        src_pipeline = base / "pipeline"
        if not src_pipeline.is_dir():
            raise RuntimeError("Extracted zip does not contain pipeline/ at the expected level.")

        shutil.copytree(src_pipeline, pipeline_dir)
        for name in REQUIRED_ROOT_FILES:
            src_file = base / name
            if src_file.exists():
                shutil.copy2(src_file, project_root / name)

        ensure_gitignore(project_root)

        required_paths = [project_root / p for p in REQUIRED_ROOT_FILES] + [
            project_root / p for p in REQUIRED_PIPELINE_FILES
        ]
        missing = [str(p) for p in required_paths if not p.exists()]

        print("Installation summary:")
        print(f"  ProjectRoot: {project_root}")
        print(f"  Zip used:    {zip_path}")
        if made_backup:
            print(f"  Backup:      {backup_dir}")
        else:
            print("  Backup:      none (not needed)")
        print("  Installed files:")
        for p in required_paths:
            status = "OK" if p.exists() else "MISSING"
            print(f"    [{status}] {p}")
        if missing:
            print("WARNING: Missing required files:")
            for m in missing:
                print(f"  - {m}")
            sys.exit(2)
    finally:
        shutil.rmtree(tempdir, ignore_errors=True)


if __name__ == "__main__":
    main()
