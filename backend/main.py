from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import FRONTEND_URL
from backend.routers import (
    auth, species, sections, suppliers, environments, plants,
    care, growth, diseases, maintenance, dashboard
)
app = FastAPI(title="Exotic Greenhouse Monitoring System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth.router, prefix="/api")
app.include_router(species.router, prefix="/api")
app.include_router(sections.router, prefix="/api")
app.include_router(suppliers.router, prefix="/api")
app.include_router(environments.router, prefix="/api")
app.include_router(plants.router, prefix="/api")
app.include_router(care.router, prefix="/api")
app.include_router(growth.router, prefix="/api")
app.include_router(diseases.router, prefix="/api")
app.include_router(maintenance.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok"}