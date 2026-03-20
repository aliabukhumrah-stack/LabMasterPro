@echo off
echo Building LabMaster Pro for Windows...
npm install && npm run electron:build
echo.
echo Done! Your Windows app is in the "release" folder.
pause
