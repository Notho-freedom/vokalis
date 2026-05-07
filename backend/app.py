"""Vocalis TTS backend — entry point."""
import time
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from routes import voices, tts, tts_stream, translate, detect

VERSION = "2.0.0"
START_TIME = time.time()

logging.basicConfig(
    level=logging.INFO,
    format='{"ts":"%(asctime)s","level":"%(levelname)s","msg":"%(message)s"}',
)

limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(
    title="Vocalis TTS",
    version=VERSION,
    description="Free, fast, neural TTS API powered by edge-tts.",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Used-Voice", "X-Detected-Language"],
)

app.include_router(voices.router, prefix="/api")
app.include_router(tts.router, prefix="/api")
app.include_router(tts_stream.router, prefix="/api")
app.include_router(translate.router, prefix="/api")
app.include_router(detect.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "version": VERSION,
        "uptime_seconds": int(time.time() - START_TIME),
    }


@app.get("/")
async def root():
    return {"name": "Vocalis TTS", "version": VERSION, "docs": "/docs"}
