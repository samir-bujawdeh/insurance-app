from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes




app = FastAPI(title="The Insurance App API")

# ✅ Enable CORS for all origins (adjust later for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # you can restrict this to your domains later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)

@app.get("/")
def root():
    return {"message": "Welcome to The Insurance App"}
