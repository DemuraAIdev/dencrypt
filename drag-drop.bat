@echo off

cd %~dp0

set "batch_file=%~f1"
set "bat_name=%~nx1"
set "bat_dir=%~dp1"

if  "%bat_name:~-8%"==".drmdec" (
    start cmd /k node index.js -d -f %~nx1
) else (
    start cmd /k node index.js -e -f %~nx1
)
