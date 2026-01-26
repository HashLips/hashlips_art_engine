#!/usr/bin/env python3
# Add a Return-to-Hub gate to every district map (if missing).
# Run via:
#   UnrealEditor-Cmd.exe "YourProject.uproject" -ExecutePythonScript="...\pipeline\unreal\add_return_gate_to_districts.py" -unattended -nop4

import json
from pathlib import Path

import unreal

BP_RETURN = "/Game/Goblinverse/Blueprints/BP_ReturnGate"
RETURN_TAG = "ReturnGate"
HUB_MAP = "/Game/Goblinverse/Maps/L_NeoGoblintown_Hub"


def maps_list(project_root: Path):
    maps = []
    idx = project_root / "pipeline" / "district_specs" / "generated" / "_index.json"
    if idx.exists():
        try:
            data = json.loads(idx.read_text(encoding="utf-8"))
            for spec in data.get("generated", []):
                name = Path(spec).stem
                maps.append(f"/Game/Goblinverse/Maps/Districts/L_{name}")
        except Exception:
            pass
    if not maps:
        assets = unreal.EditorAssetLibrary.list_assets("/Game/Goblinverse/Maps/Districts", recursive=True, include_folder=False)
        for a in assets:
            if a.endswith(".umap"):
                maps.append(a[:-5])
            else:
                maps.append(a)
    seen = set()
    out = []
    for m in maps:
        if m not in seen:
            seen.add(m)
            out.append(m)
    return out


def has_return_gate():
    for a in unreal.EditorLevelLibrary.get_all_level_actors():
        if RETURN_TAG in [str(t) for t in a.tags]:
            return True
    return False


def add_gate():
    if not unreal.EditorAssetLibrary.does_asset_exist(BP_RETURN):
        unreal.log_error(f"[ReturnGate] Missing BP_ReturnGate: {BP_RETURN}")
        return False
    bp_cls = unreal.EditorAssetLibrary.load_blueprint_class(BP_RETURN)
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(bp_cls, unreal.Vector(0, 0, 150), unreal.Rotator(0, 180, 0))
    if actor:
        actor.tags = [RETURN_TAG]
        try:
            actor.set_editor_property("target_map", HUB_MAP)
        except Exception:
            pass
        return True
    return False


def main():
    project_root = Path(unreal.Paths.project_dir()).resolve()
    log_dir = project_root / "pipeline" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "add_return_gates_log.txt"
    lines = []

    for m in maps_list(project_root):
        try:
            unreal.log(f"[ReturnGate] Loading {m}")
            unreal.EditorLoadingAndSavingUtils.load_map(m)
            if has_return_gate():
                lines.append(f"SKIP {m} (exists)")
            else:
                if add_gate():
                    lines.append(f"OK {m}")
                else:
                    lines.append(f"FAIL {m}")
            unreal.EditorLevelLibrary.save_current_level()
        except Exception as e:
            lines.append(f"FAIL {m}: {e}")

    log_file.write_text("\n".join(lines), encoding="utf-8")
    unreal.log(f"[ReturnGate] Done. Log: {log_file}")
    print(f"[ReturnGate] Done. Log: {log_file}")


if __name__ == "__main__":
    main()
