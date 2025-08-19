import os
import uuid
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .services.moderation import moderate_image
from .services.puzzle import make_puzzle_tiles

ENV = os.getenv("ENV", "development")
STORAGE_DIR = os.getenv("STORAGE_DIR", "storage")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

os.makedirs(STORAGE_DIR, exist_ok=True)

app = FastAPI(title="Puzzle Image API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restreindre en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STORAGE_DIR), name="static")

class PuzzleCreateResponse(BaseModel):
    puzzle_id: str
    difficulty: int
    tiles: list[str]
    share_url: str

class ModerationResult(BaseModel):
    allowed: bool
    reasons: list[str] = []

class Puzzle(BaseModel):
    id: str
    difficulty: int
    tiles: list[str]

# In-memory registry for demo (remplacer par DB)
PUZZLES: dict[str, Puzzle] = {}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/moderate", response_model=ModerationResult)
async def api_moderate(file: UploadFile = File(...)):
    content = await file.read()
    allowed, reasons = await moderate_image(content, filename=file.filename)
    return ModerationResult(allowed=allowed, reasons=reasons)

@app.post("/api/puzzle", response_model=PuzzleCreateResponse)
async def api_create_puzzle(
    file: UploadFile = File(...),
    difficulty: int = Form(3),  # 3x3 par défaut
):
    if difficulty < 2 or difficulty > 10:
        raise HTTPException(status_code=400, detail="difficulty must be between 2 and 10")

    content = await file.read()
    allowed, reasons = await moderate_image(content, filename=file.filename)
    if not allowed:
        raise HTTPException(status_code=422, detail={"message":"Image refusée par la modération", "reasons": reasons})

    puzzle_id = str(uuid.uuid4())
    tiles_relpaths = make_puzzle_tiles(
        image_bytes=content,
        storage_dir=STORAGE_DIR,
        puzzle_id=puzzle_id,
        grid=difficulty
    )
    # Enregistre puzzle (demo en mémoire)
    PUZZLES[puzzle_id] = Puzzle(id=puzzle_id, difficulty=difficulty, tiles=tiles_relpaths)

    share_url = f"{API_BASE_URL}/api/puzzle/{puzzle_id}"
    return PuzzleCreateResponse(
        puzzle_id=puzzle_id,
        difficulty=difficulty,
        tiles=[f"{API_BASE_URL}/static/{p}" for p in tiles_relpaths],
        share_url=share_url
    )

@app.get("/api/puzzle/{puzzle_id}", response_model=PuzzleCreateResponse)
async def api_get_puzzle(puzzle_id: str):
    p = PUZZLES.get(puzzle_id)
    if not p:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    return PuzzleCreateResponse(
        puzzle_id=p.id,
        difficulty=p.difficulty,
        tiles=[f"{API_BASE_URL}/static/{t}" for t in p.tiles],
        share_url=f"{API_BASE_URL}/api/puzzle/{p.id}"
    )

# Squelettes (TODO): auth, daily image, vs bot, diamants, amis, etc.
class AuthReq(BaseModel):
    email: str
    password: str

@app.post("/api/auth/signup")
async def api_signup(req: AuthReq):
    # TODO: intégrer Firebase/Supabase/OAuth et enregistrer l'utilisateur en DB
    return {"ok": True, "message": "Signup stub. À remplacer par un provider auth réel."}

@app.post("/api/auth/login")
async def api_login(req: AuthReq):
    # TODO: vérifier via provider auth et émettre un JWT côté backend si besoin
    return {"ok": True, "message": "Login stub. À remplacer par un provider auth réel."}

@app.get("/api/daily")
async def api_daily_image():
    # TODO: retourner/produire l'image du jour (puzzle_id)
    return {"ok": True, "puzzle_id": None}

@app.post("/api/bot/start")
async def api_start_vs_bot(puzzle_id: str):
    # TODO: instancier une partie vs bot avec réglage difficulté/vitesse
    return {"ok": True, "puzzle_id": puzzle_id, "bot": {"speed": "medium"}}

@app.post("/api/wallet/claim-daily")
async def api_claim_daily():
    # TODO: incrémenter 1 diamant/jour, au 7e jour donner bonus (3), total 10
    return {"ok": True, "delta_diamonds": 1, "streak": 1}
