@echo off

echo Setting up git hooks...
call npm install
icacls .husky\pre-commit /grant Everyone:F

echo Creating Python virtual environment for development...
python -m venv .venv

echo Activating virtual environment...
call .venv\Scripts\activate.bat

:: Verify the virtual environment is active
echo Verifying virtual environment...
for /f "tokens=*" %%i in ('where python') do (
    echo %%i | findstr /i ".venv" > nul
    if not errorlevel 1 (
        set VENV_FOUND=1
    )
)

if not defined VENV_FOUND (
    echo Error: Failed to activate virtual environment properly.
    echo Current Python path:
    where python
    exit /b 1
) else (
    echo Virtual environment successfully activated.
    echo Current Python: 
    where python
)

echo Installing backend development dependencies...
pip install -r backend\dev-requirements.txt

echo Installing frontend dependencies...
cd frontend
call npm install
call npm run build
cd ..

echo Development environment setup complete!
echo To activate the virtual environment manually, run: .venv\Scripts\activate.bat
