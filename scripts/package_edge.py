#!/usr/bin/env python3
"""Package the MV3 extension for Edge Add-ons without external dependencies."""

from pathlib import Path
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXTENSION = ROOT / "extension"
manifest = json.loads((EXTENSION / "manifest.json").read_text(encoding="utf-8"))
version = manifest["version"]
output_dir = ROOT / "dist"
output_dir.mkdir(exist_ok=True)
archive = output_dir / f"chat-folder-click-edge-v{version}.zip"

with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
    for item in sorted(EXTENSION.rglob("*")):
        if item.is_symlink():
            raise RuntimeError(f"Refusing to package symlink: {item}")
        if item.is_file():
            bundle.write(item, item.relative_to(EXTENSION).as_posix())

with zipfile.ZipFile(archive) as bundle:
    names = set(bundle.namelist())
    if "manifest.json" not in names or "app.html" not in names:
        raise RuntimeError("Invalid Edge package: required files missing")

print(f"Created {archive} ({archive.stat().st_size} bytes)")
