#!/usr/bin/env python3
# Build /Game/Goblinverse/Maps/L_NeoGoblintown_Hub with faction teleport gates.
# Run via:
#   UnrealEditor-Cmd.exe "YourProject.uproject" -ExecutePythonScript="...\pipeline\unreal\build_hub_map.py" -unattended -nop4

import unreal

HUB_MAP_PATH = "/Game/Goblinverse/Maps/L_NeoGoblintown_Hub"
HUB_DIR = "/Game/Goblinverse/Maps"
BP_GATE = "/Game/Goblinverse/Blueprints/BP_TeleportGate"
BP_RETURN = "/Game/Goblinverse/Blueprints/BP_ReturnGate"

GATES = [
    ("CORE", "RootSpire", "/Game/Goblinverse/Maps/Districts/L_CORE_RootSpire", 0),
    ("SCRAP", "TrashBurnerYard", "/Game/Goblinverse/Maps/Districts/L_SCRAP_TrashBurnerYard", 60),
    ("GUT", "BossTagspire", "/Game/Goblinverse/Maps/Districts/L_GUT_BossTagspire", 120),
    ("HYDRO", "BatterySiphonDocks", "/Game/Goblinverse/Maps/Districts/L_HYDRO_BatterySiphonDocks", 180),
    ("CLOUD", "GuestGate", "/Game/Goblinverse/Maps/Districts/L_CLOUD_GuestGate", 240),
    ("BASS", "BossVault", "/Game/Goblinverse/Maps/Districts/L_BASS_BossVault", 300),
]

FACTION_MATS = {
    "CORE": "/Game/Goblinverse/Materials/MI_Corebreakers",
    "SCRAP": "/Game/Goblinverse/Materials/MI_Scrapshamans",
    "GUT": "/Game/Goblinverse/Materials/MI_Gutterborns",
    "HYDRO": "/Game/Goblinverse/Materials/MI_Hydrohackers",
    "CLOUD": "/Game/Goblinverse/Materials/MI_Cloudjackers",
    "BASS": "/Game/Goblinverse/Materials/MI_Bassfiends",
}


def ensure_gate_bp(bp_path, is_return=False):
    if unreal.EditorAssetLibrary.does_asset_exist(bp_path):
        return bp_path
    # Minimal BP creation with Python is non-trivial; assume assets exist or the user will place a mesh manually.
    unreal.log_error(f"[Hub] Missing Blueprint: {bp_path}. Please create it manually (BP_TeleportGate / BP_ReturnGate).")
    return None


def ensure_map():
    if not unreal.EditorAssetLibrary.does_directory_exist(HUB_DIR):
        unreal.EditorAssetLibrary.make_directory(HUB_DIR)
    if unreal.EditorAssetLibrary.does_asset_exist(HUB_MAP_PATH):
        unreal.EditorLevelLibrary.load_level(HUB_MAP_PATH)
        unreal.log("[Hub] Loaded existing hub map")
    else:
        unreal.EditorLevelLibrary.new_level(HUB_MAP_PATH)
        unreal.log("[Hub] Created new hub map")


def ensure_atmosphere():
    # fog
    has_fog = any(isinstance(a, unreal.ExponentialHeightFog) for a in unreal.EditorLevelLibrary.get_all_level_actors())
    if not has_fog:
        unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.ExponentialHeightFog, unreal.Vector(0, 0, 0))
    # post process
    ppv = None
    for a in unreal.EditorLevelLibrary.get_all_level_actors():
        if isinstance(a, unreal.PostProcessVolume):
            ppv = a
            break
    if not ppv:
        ppv = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.PostProcessVolume, unreal.Vector(0, 0, 0))
    ppv.set_editor_property("b_unbound", True)
    settings = ppv.get_editor_property("settings")
    settings.bloom_intensity = 0.7
    settings.vignette_intensity = 0.4
    settings.film_grain_intensity = 0.35
    settings.scene_fringe_intensity = 1.4
    settings.auto_exposure_min_brightness = 1.0
    settings.auto_exposure_max_brightness = 1.0
    ppv.set_editor_property("settings", settings)


def place_gates():
    gate_bp = ensure_gate_bp(BP_GATE)
    if not gate_bp:
        return
    radius = 1500.0
    for faction, label, target, angle_deg in GATES:
        angle_rad = unreal.MathLibrary.deg_to_rad(angle_deg)
        x = radius * unreal.MathLibrary.cos(angle_rad)
        y = radius * unreal.MathLibrary.sin(angle_rad)
        loc = unreal.Vector(x, y, 100)
        rot = unreal.Rotator(0, angle_deg + 180, 0)
        actor = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.EditorAssetLibrary.load_blueprint_class(gate_bp), loc, rot)
        if not actor:
            continue
        actor.set_actor_label(f"Gate_{faction}")
        try:
            actor.set_editor_property("target_map", target)
            actor.set_editor_property("gate_label", f"{faction} :: {label}")
        except Exception:
            pass
        # apply faction material if available
        mat_path = FACTION_MATS.get(faction)
        if mat_path and unreal.EditorAssetLibrary.does_asset_exist(mat_path):
            mat = unreal.EditorAssetLibrary.load_asset(mat_path)
            smc = actor.get_component_by_class(unreal.StaticMeshComponent)
            if smc and mat:
                smc.set_material(0, mat)


def ensure_player_start():
    exists = [a for a in unreal.EditorLevelLibrary.get_all_level_actors() if isinstance(a, unreal.PlayerStart)]
    if not exists:
        unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.PlayerStart, unreal.Vector(0, -2000, 150), unreal.Rotator(0, 0, 0))


def main():
    log_file = Path(unreal.Paths.project_dir()) / "pipeline" / "logs" / "build_hub_map_log.txt"
    lines = []
    try:
        ensure_map()
        ensure_atmosphere()
        place_gates()
        ensure_player_start()
        unreal.EditorLevelLibrary.save_current_level()
        lines.append("OK hub built")
    except Exception as e:
        lines.append(f"FAIL: {e}")
    log_file.write_text("\n".join(lines), encoding="utf-8")
    unreal.log(f"[Hub] Done. Log: {log_file}")
    print(f"[Hub] Done. Log: {log_file}")


if __name__ == "__main__":
    main()
