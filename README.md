# Resume Builder

Simple Flask-based resume builder with:
- live preview
- AI-assisted summary generation
- AI-assisted project bullet generation
- ATS keyword analysis
- multiple projects with edit and delete support
- PDF download
- typing animation for AI output

## Run

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 app.py
```

Open `http://127.0.0.1:5001`
