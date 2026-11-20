# WavsResolver

Aplicativo Windows para explorar packs publicos do WAVS, ouvir previews e baixar arquivos MP3 disponibilizados pelo servico.

## Instalar

Baixe o instalador `WavsResolver-<versao>-Windows-x64.exe` na aba Releases do repositorio e execute-o. A instalacao e por usuario e cria atalhos no Menu Iniciar e na area de trabalho. O app precisa de conexao com a internet para acessar o catalogo WAVS.

Quem ainda usa a versao portatil 1.0.3 precisa instalar esta primeira versao uma vez. Depois, novas versoes sao baixadas pelo app e instaladas quando ele for fechado.

O instalador nao e assinado digitalmente; o Windows pode exibir um aviso na primeira execucao.

## Recursos

- Explorar packs recentes, filtrar por genero e periodo e ordenar resultados.
- Pesquisar packs, samples e criadores; abrir perfis publicos.
- Salvar packs favoritos neste computador.
- Reproduzir previews com waveform, controle de volume, repeticao e atalhos.
- Baixar previews MP3 individualmente ou baixar um pack inteiro.
- Alterar tema e manter preferencias entre execucoes.

Catalogo, metadados e previews dependem da disponibilidade e das regras atuais do WAVS.

## Releases

O workflow do GitHub Actions gera e publica uma release do Windows quando uma tag `v*` e enviada. A release inclui o instalador e os metadados usados pelo atualizador automatico.

Para preparar uma versao, atualize o campo `version` em `package.json`, sincronize `package-lock.json`, crie uma tag igual a versao (por exemplo, `v1.0.4`) e envie a tag ao GitHub.

## Desenvolvimento

Requer Node.js 22 ou superior. Execute `npm ci` e depois `npm start` para abrir o app. Para gerar localmente o instalador sem publica-lo, execute `npm run build:win`.
