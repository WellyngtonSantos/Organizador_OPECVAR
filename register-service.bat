@echo off
:: Registrar Organizador OPECVAR como tarefa agendada do Windows
:: EXECUTAR COMO ADMINISTRADOR

schtasks /create /tn "OrganizadorOPECVAR" /tr "wscript.exe 'C:\Sistema\Organizador_OPECVAR\start-silent.vbs'" /sc onstart /ru SYSTEM /rl HIGHEST /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo === Servico registrado com sucesso! ===
    echo O Organizador OPECVAR vai iniciar automaticamente com o Windows.
    echo.
    echo Para iniciar agora sem reiniciar, execute: start.bat
    echo.
) else (
    echo.
    echo === ERRO ao registrar servico ===
    echo Certifique-se de executar este script como ADMINISTRADOR.
    echo.
)

pause
