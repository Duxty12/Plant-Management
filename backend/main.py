from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import FRONTEND_URL
from backend.routers import (
    auth, species, suppliers, environments, plants, sections,
    care, maintenance, growth, diseases, dashboard
)

app = FastAPI(title="Exotic Greenhouse Monitoring System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth.router)
app.include_router(species.router)
app.include_router(suppliers.router)
app.include_router(environments.router)
app.include_router(plants.router)
app.include_router(sections.router)
app.include_router(care.router)
app.include_router(maintenance.router)
app.include_router(growth.router)
app.include_router(diseases.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"status": "ok"}