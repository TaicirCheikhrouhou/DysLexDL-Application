# DysLex DL 🚀

_AI-powered MRI and fMRI analysis tool for dyslexia detection_

**DysLex DL** is a medical web application designed for doctors to analyze **MRI and fMRI scans** for dyslexia detection using **Deep Learning models**. The platform allows users to **upload neuroimaging data**, optionally **preprocess it**, run **predictions**, and generate **professional PDF reports** with optional notes.

---

## Key Features ✨

- 🧠 **Deep Learning Analysis:** Pre-trained **CNN** and **CNN-LSTM** models analyze structural MRI and functional MRI data to detect patterns related to dyslexia.
- 🔄 **Preprocessing:** Optional steps include **co-registration, normalization, and smoothing** to improve prediction accuracy.
- 📝 **Interactive Review:** Doctors can view results, **add notes**, and annotate scans as needed.
- 📄 **PDF Report Generation:** Generates PDF reports summarizing analysis and optional doctor notes for documentation and sharing.

---

## Technology Stack 🛠️

- **Frontend:** React.js — responsive and user-friendly interface.
- **Backend:** Flask — handles file uploads, preprocessing, model inference, and report generation.
- **Data Support:** Supports `.nii.gz` MRI and fMRI files.
- **AI Models:** CNN for MRI, CNN-LSTM for fMRI,

---

## Quick install & run

Below are concise, corrected steps to get the project running. Adjust paths if you prefer a different environment layout.

1. Clone the repository

```bash
git clone https://github.com/TaicirCheikhrouhou/DysLexDL.git
cd DysLexDL
```

2. Backend: create a Python virtual environment and install dependencies

Windows (PowerShell):

```powershell
python -m venv venv
.\\venv\\Scripts\\Activate.ps1
cd backend
pip install -r requirements.txt
```

macOS / Linux:

```bash
python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

Run the Flask backend (from `backend/`):

```bash
python app.py

# Alternatively, if using flask CLI (and FLASK_APP is configured), you can run:
# export FLASK_APP=app.py; flask run --host=0.0.0.0 --port=5000
```

3. Frontend (from project root)

```bash
cd frontend
npm install
npm start
```

4. Docker (optional)

If you prefer Docker, there's a `docker-compose.yml` at the repo root. Example:

```bash
# Build and start services in the background
docker-compose up --build -d
```

---

## Usage 🩺

- Upload MRI or fMRI files (`.nii.gz`) via the frontend UI.
- Optionally run the preprocessing pipeline (co-registration, normalization, smoothing, ..).
- Run model inference and review results.
- Add doctor notes as needed and generate a PDF report.

---

## Developer notes

- Backend entrypoint: `backend/app.py`
- Backend dependencies: `backend/requirements.txt`
- Frontend: `frontend/` (React)

If you change environment layout, update the instructions above.

---

## Contributing

Contributions are welcome. Please open issues for bugs or feature requests and submit PRs for proposed changes.

---
