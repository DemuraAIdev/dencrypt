::start Bot
echo off

cd %~dp0
;set "batch_file=%~f1"
;set "bat_name=%~nx1"
;set "bat_dir=%~dp1"

start cmd /k node index.js -e -f %~nx1


