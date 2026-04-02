@echo off
:: Organizador OPECVAR - Script de Inicializacao
:: Inicia o servidor Node.js em modo producao

cd /d "C:\Sistema\Organizador_OPECVAR\backend"

:: Definir variaveis de ambiente caso o .env nao seja carregado
set NODE_ENV=production

:: Iniciar o servidor
node dist/index.js
