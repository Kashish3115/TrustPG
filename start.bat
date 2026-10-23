@echo off
title TrustPG Server
echo ==============================================================
echo   TrustPG: Bengaluru Student PG Discovery Platform
echo   Tagline: Find Your Stay. Know What You Pay.
echo ==============================================================
echo Starting TrustPG server on http://127.0.0.1:3000 ...
set AGY_NODE="C:\Users\hp\AppData\Roaming\Antigravity\bin\agy-node.cmd"
if exist %AGY_NODE% (
  %AGY_NODE% server.js
) else (
  node server.js
)
pause
