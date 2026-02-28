@echo off
setlocal

set "HOST=192.168.20.37"
set "USER=root"
set "PASS=root"
set "TARGET=/usr/share/caddy/reuniaoTeams"
set "PLINK=C:\Program Files\PuTTY\plink.exe"
set "PSCP=C:\Program Files\PuTTY\pscp.exe"

cd /d "%~dp0"

if not exist "%PLINK%" (
  echo plink nao encontrado em "%PLINK%".
  set "EXIT_CODE=1"
  goto wait_exit
)

if not exist "%PSCP%" (
  echo pscp nao encontrado em "%PSCP%".
  set "EXIT_CODE=1"
  goto wait_exit
)

echo [1/3] Buildando projeto...
call npm run build
if errorlevel 1 (
  echo Build falhou.
  set "EXIT_CODE=1"
  goto wait_exit
)

echo [2/3] Limpando pasta remota...
"%PLINK%" -batch -ssh -l %USER% -pw %PASS% %HOST% "mkdir -p '%TARGET%' && find '%TARGET%' -mindepth 1 -maxdepth 1 -exec rm -rf {} +"
if errorlevel 1 (
  echo Falha ao limpar pasta remota.
  set "EXIT_CODE=1"
  goto wait_exit
)

echo [3/3] Enviando dist para o homelab...
"%PSCP%" -batch -pw %PASS% -r "dist\*" %USER%@%HOST%:%TARGET%/
if errorlevel 1 (
  echo Falha no upload.
  set "EXIT_CODE=1"
  goto wait_exit
)

echo Deploy concluido com sucesso.
set "EXIT_CODE=0"

:wait_exit
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
exit /b %EXIT_CODE%
