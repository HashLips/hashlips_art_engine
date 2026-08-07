from pathlib import Path
import json
from PIL import Image

BASE_PATH = Path.cwd()
SPRITE_ROOT = BASE_PATH / "sprites" / "otb_talking_bear"
RUNTIME_DIR = SPRITE_ROOT / "runtime"
FRAME_DIR = RUNTIME_DIR / "frames"
SIZE = 2000


def sorted_pngs(dir_path: Path) -> list[str]:
    if not dir_path.exists():
        return []
    return sorted([p.name for p in dir_path.glob("*.png")])


def require_file(file_path: Path) -> None:
    if not file_path.exists():
        raise FileNotFoundError(f"Missing required layer file: {file_path}")


def composite_frame(output_path: Path, layers: list[Path]) -> None:
    base = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    for layer_path in layers:
        require_file(layer_path)
        with Image.open(layer_path).convert("RGBA") as layer:
            if layer.size != (SIZE, SIZE):
                raise ValueError(f"Layer size mismatch for {layer_path}: got {layer.size}, expected {(SIZE, SIZE)}")
            base.alpha_composite(layer)
    base.save(output_path, "PNG")


def build_spritesheet(frame_paths: list[Path], output_path: Path, columns: int) -> None:
    rows = (len(frame_paths) + columns - 1) // columns
    sheet = Image.new("RGBA", (SIZE * columns, SIZE * rows), (0, 0, 0, 0))
    for i, frame_path in enumerate(frame_paths):
        col = i % columns
        row = i // columns
        with Image.open(frame_path).convert("RGBA") as frame:
            sheet.alpha_composite(frame, (col * SIZE, row * SIZE))
    sheet.save(output_path, "PNG")


def rel(path: Path) -> str:
    return path.relative_to(SPRITE_ROOT).as_posix()


def main() -> None:
    base_layer = SPRITE_ROOT / "base" / "otb_hybrid_base.png"
    mouth_dir = SPRITE_ROOT / "mouth"
    eye_dir = SPRITE_ROOT / "eyes"
    brow_dir = SPRITE_ROOT / "brows"
    nose_dir = SPRITE_ROOT / "nose"
    hair_dir = SPRITE_ROOT / "hair_fx"

    require_file(base_layer)
    mouths = sorted_pngs(mouth_dir)
    eyes = sorted_pngs(eye_dir)
    brows = sorted_pngs(brow_dir)
    noses = sorted_pngs(nose_dir)
    hairs = sorted_pngs(hair_dir)

    if len(mouths) < 6:
        raise ValueError(f"Expected at least 6 mouth frames, found {len(mouths)}")
    if not eyes or not brows or not noses or not hairs:
        raise ValueError("Missing one or more facial overlay sets (eyes, brows, nose, hair_fx)")

    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)

    talk_frames = []
    idle_frames = []

    eye_neutral = eye_dir / "E0_neutral.png"
    brow_neutral = brow_dir / "B0_neutral.png"
    nose_neutral = nose_dir / "N0_neutral.png"

    for i in range(6):
        output = FRAME_DIR / f"talk_{i:02d}.png"
        mouth = mouth_dir / mouths[i]
        hair = hair_dir / hairs[i % len(hairs)]
        composite_frame(output, [base_layer, hair, brow_neutral, eye_neutral, nose_neutral, mouth])
        talk_frames.append(
            {
                "index": i,
                "viseme": mouth.stem,
                "hair": hair.stem,
                "path": output,
            }
        )

    idle_pattern = [
        ("E0_neutral.png", "B0_neutral.png", "N0_neutral.png", "M0_closed.png", hairs[0]),
        ("E0_neutral.png", "B0_neutral.png", "N0_neutral.png", "M0_closed.png", hairs[1]),
        ("E0_neutral.png", "B0_neutral.png", "N0_neutral.png", "M0_closed.png", hairs[2]),
        ("E1_blink.png", "B1_up.png", "N0_neutral.png", "M0_closed.png", hairs[3]),
        ("E2_squint.png", "B0_neutral.png", "N2_wrinkle.png", "M1_tight.png", hairs[4]),
        ("E0_neutral.png", "B0_neutral.png", "N0_neutral.png", "M0_closed.png", hairs[5]),
        ("E0_neutral.png", "B0_neutral.png", "N0_neutral.png", "M0_closed.png", hairs[6 % len(hairs)]),
        ("E0_neutral.png", "B0_neutral.png", "N0_neutral.png", "M0_closed.png", hairs[7 % len(hairs)]),
    ]

    for i, (eye_name, brow_name, nose_name, mouth_name, hair_name) in enumerate(idle_pattern):
        output = FRAME_DIR / f"idle_{i:02d}.png"
        eye = eye_dir / eye_name
        brow = brow_dir / brow_name
        nose = nose_dir / nose_name
        mouth = mouth_dir / mouth_name
        hair = hair_dir / hair_name
        composite_frame(output, [base_layer, hair, brow, eye, nose, mouth])
        idle_frames.append(
            {
                "index": i,
                "eye": eye.stem,
                "brow": brow.stem,
                "nose": nose.stem,
                "mouth": mouth.stem,
                "hair": hair.stem,
                "path": output,
            }
        )

    talk_sheet_path = RUNTIME_DIR / "talk_spritesheet.png"
    idle_sheet_path = RUNTIME_DIR / "idle_spritesheet.png"
    build_spritesheet([f["path"] for f in talk_frames], talk_sheet_path, 6)
    build_spritesheet([f["path"] for f in idle_frames], idle_sheet_path, 8)

    manifest = {
        "name": "otb_talking_bear_runtime",
        "size": {"width": SIZE, "height": SIZE},
        "layers": {
            "base": "base/otb_hybrid_base.png",
            "mouth": mouths,
            "eyes": eyes,
            "brows": brows,
            "nose": noses,
            "hair_fx": hairs,
        },
        "visemeMap": {
            "silence": "M0_closed",
            "low": "M1_tight",
            "mid": "M2_halfOpen",
            "open": "M3_open",
            "loud": "M4_wide",
            "round": "M5_roundO",
        },
        "states": {
            "talkCycle": {
                "fps": 24,
                "frameCount": len(talk_frames),
                "frames": [
                    {
                        "index": f["index"],
                        "viseme": f["viseme"],
                        "hair": f["hair"],
                        "file": rel(f["path"]),
                    }
                    for f in talk_frames
                ],
                "spritesheet": rel(talk_sheet_path),
            },
            "idleLoop": {
                "fps": 12,
                "frameCount": len(idle_frames),
                "frames": [
                    {
                        "index": f["index"],
                        "eye": f["eye"],
                        "brow": f["brow"],
                        "nose": f["nose"],
                        "mouth": f["mouth"],
                        "hair": f["hair"],
                        "file": rel(f["path"]),
                    }
                    for f in idle_frames
                ],
                "spritesheet": rel(idle_sheet_path),
            },
        },
        "runtimeHints": {
            "faceSolveFps": 60,
            "visemeUpdateHz": 24,
            "audioSmoothingMs": 80,
        },
    }

    manifest_path = RUNTIME_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"Runtime pack generated at: {RUNTIME_DIR}")
    print(f"Talk frames: {len(talk_frames)}, Idle frames: {len(idle_frames)}")


if __name__ == "__main__":
    main()
