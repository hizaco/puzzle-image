import io
import os
from typing import List
from PIL import Image, ImageOps

def make_puzzle_tiles(image_bytes: bytes, storage_dir: str, puzzle_id: str, grid: int = 3) -> List[str]:
    """
    Pipeline amélioré pour un découpage propre:
    - Corrige l'orientation EXIF
    - Centre-crop en carré
    - Redimensionne à une taille parfaitement divisible par grid
    - Découpe en tuiles identiques
    - Enregistre en PNG (évite les artefacts JPEG aux jointures)
    """
    base_dir = os.path.join(storage_dir, puzzle_id)
    os.makedirs(base_dir, exist_ok=True)

    with Image.open(io.BytesIO(image_bytes)) as img:
        # 1) Normalisation
        img = ImageOps.exif_transpose(img)     # respecter l'orientation EXIF
        img = img.convert("RGB")

        # 2) Crop carré centré
        w, h = img.size
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        img = img.crop((left, top, left + side, top + side))

        # 3) Redimensionner vers une taille multiple de grid (ex: 256 * grid)
        tile_target = 256  # Ajustable (320/384 pour plus de détails)
        target_size = tile_target * grid
        img = img.resize((target_size, target_size), resample=Image.LANCZOS)

        # 4) Découpe stricte
        tile_w = target_size // grid
        tile_h = target_size // grid

        relpaths: List[str] = []
        idx = 0
        for r in range(grid):
            for c in range(grid):
                left = c * tile_w
                upper = r * tile_h
                right = left + tile_w
                lower = upper + tile_h
                tile = img.crop((left, upper, right, lower))

                filename = f"tile_{idx:03d}.png"
                out_path = os.path.join(base_dir, filename)
                tile.save(out_path, format="PNG", optimize=True)
                relpaths.append(f"{puzzle_id}/{filename}")
                idx += 1

    return relpaths
