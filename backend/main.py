from fastapi import FastAPI

app = FastAPI(title="Exotic Greenhouse Monitoring System")

@app.get("/")
def root():
    return {"status": "ok"}