@echo off
setlocal
cd /d "%~dp0"
if not exist .venv (
  py -3.14 -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -c "import fastapi,uvicorn,sqlalchemy,PIL,tifffile,numpy; print('Backend dependencies OK')"
echo.
echo Start with: python -m uvicorn backend.main:app --reload --port 8000
