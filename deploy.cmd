@echo off
setlocal EnableExtensions

set "HOST=192.168.20.37"
set "USER=root"
set "PASS=root"
set "TARGET=/usr/share/caddy/reuniaoTeams"
set "PLINK=C:\Program Files\PuTTY\plink.exe"
set "PSCP=C:\Program Files\PuTTY\pscp.exe"

set "EXIT_CODE=0"
set "ERROR_MSG="
set "STEP_VALIDACAO=NAO EXECUTADO"
set "STEP_LIMPEZA=NAO EXECUTADO"
set "STEP_INDEX=NAO EXECUTADO"
set "STEP_ASSETS=NAO APLICAVEL"

cd /d "%~dp0"

echo [0/3] Validando ambiente local...
if not exist "%PLINK%" (
  set "EXIT_CODE=1"
  set "ERROR_MSG=plink nao encontrado em %PLINK%."
  set "STEP_VALIDACAO=FALHOU"
  goto :resumo
)

if not exist "%PSCP%" (
  set "EXIT_CODE=1"
  set "ERROR_MSG=pscp nao encontrado em %PSCP%."
  set "STEP_VALIDACAO=FALHOU"
  goto :resumo
)

if not exist "index.html" (
  set "EXIT_CODE=1"
  set "ERROR_MSG=index.html nao encontrado na raiz do projeto."
  set "STEP_VALIDACAO=FALHOU"
  goto :resumo
)
set "STEP_VALIDACAO=OK"

echo [1/3] Limpando pasta remota...
"%PLINK%" -ssh -batch -l %USER% -pw %PASS% %HOST% "mkdir -p '%TARGET%' && find '%TARGET%' -mindepth 1 -maxdepth 1 -exec rm -rf {} +"
if errorlevel 1 (
  set "EXIT_CODE=1"
  set "ERROR_MSG=Falha ao limpar pasta remota."
  set "STEP_LIMPEZA=FALHOU"
  goto :resumo
)
set "STEP_LIMPEZA=OK"

echo [2/3] Enviando index.html...
"%PSCP%" -pw %PASS% "index.html" %USER%@%HOST%:%TARGET%/
if errorlevel 1 (
  set "EXIT_CODE=1"
  set "ERROR_MSG=Falha no upload do index.html."
  set "STEP_INDEX=FALHOU"
  goto :resumo
)
set "STEP_INDEX=OK"

echo [3/3] Verificando assets...
if exist "assets" (
  "%PSCP%" -pw %PASS% -r "assets" %USER%@%HOST%:%TARGET%/
  if errorlevel 1 (
    set "EXIT_CODE=1"
    set "ERROR_MSG=Falha no upload da pasta assets."
    set "STEP_ASSETS=FALHOU"
    goto :resumo
  )
  set "STEP_ASSETS=OK"
) else (
  set "STEP_ASSETS=NAO ENCONTRADA (ignorada)"
)

:resumo
echo.
echo ================== RESUMO DO DEPLOY ==================
echo Data/Hora........: %date% %time%
echo Host.............: %HOST%
echo Destino..........: %TARGET%
echo Validacao local..: %STEP_VALIDACAO%
echo Limpeza remota...: %STEP_LIMPEZA%
echo Upload index.....: %STEP_INDEX%
echo Upload assets....: %STEP_ASSETS%
if "%EXIT_CODE%"=="0" (
  echo Resultado final.: SUCESSO
) else (
  echo Resultado final.: FALHA
  echo Motivo..........: %ERROR_MSG%
)
echo ======================================================
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
exit /b %EXIT_CODE%
