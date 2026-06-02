# Lunar Spectra — Web App

FastAPI backend + React frontend for the Chandrayaan-2 IIRS classifier.

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt

# Copy your saved model artifacts into backend/models/
# From Google Drive: lunar_cnn.h5, pca_transform.pkl, kmeans.pkl
mkdir models
# then copy the 3 files in

uvicorn main:app --reload
# runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# runs on http://localhost:5173
```

## Deploy Frontend to Vercel
```bash
cd frontend
npm run build
npx vercel
```

Set `VITE_API_URL` in Vercel environment variables to your machine's IP when demoing.

## API Endpoints
| Method | Path         | Description                              |
|--------|--------------|------------------------------------------|
| GET    | /health      | Check backend + artifact status          |
| POST   | /classify    | Upload .qub + .hdr → classified map      |
| POST   | /pixel       | x, y → spectrum + class + confidence     |
| GET    | /validation  | Band depth + spectral signature data     |
