import os
from typing import Tuple, List

# Point d'extension pour brancher un vrai provider (Google Vision, AWS Rekognition, etc.)

async def moderate_image(image_bytes: bytes, filename: str | None = None) -> Tuple[bool, List[str]]:
    """
    Retourne (allowed, reasons).
    Par défaut: stub permissif (autorise tout) pour développer rapidement.
    TODO: Implémenter SafeSearch (Google Vision) ou Rekognition.
    """
    # Exemple pseudo-code (Google Vision):
    # from google.cloud import vision
    # client = vision.ImageAnnotatorClient()
    # response = client.safe_search_detection({"content": image_bytes})
    # safe = response.safe_search_annotation
    # if safe.adult in [LIKELY, VERY_LIKELY] or safe.violence in [...]:
    #     return False, ["adult", "violence"]
    # return True, []

    return True, []
