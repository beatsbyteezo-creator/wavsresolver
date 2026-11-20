# WavsResolver

Aplicativo Windows para explorar packs publicos do WAVS, ouvir previews e baixar arquivos MP3 disponibilizados pelo servico.

## Instalar

Baixe o instalador `WavsResolver-<versao>-Windows-x64.exe` na aba Releases e execute-o. Quem ainda usa a versao portatil 1.0.3 precisa instalar esta primeira versao uma vez; as seguintes sao baixadas pelo app e instaladas ao fecha-lo.

## Releases

O GitHub Actions gera uma release quando uma tag `v*` e enviada. Para preparar uma versao, atualize `version` em `package.json`, sincronize o lockfile, crie a tag correspondente (por exemplo `v1.0.4`) e envie-a ao GitHub.

## Desenvolvimento

Requer Node.js 22 ou superior. Execute `npm ci` e `npm start`. Para gerar um instalador local sem publica-lo, execute `npm run build:win`.

O catalogo e os previews dependem da disponibilidade e das regras atuais do WAVS.