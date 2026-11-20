# WavsResolver

Aplicativo Windows para explorar packs públicos do WAVS, ouvir previews e baixar arquivos MP3.

## Instalar

Baixe o instalador Windows x64 na página de [Releases](https://github.com/beatsbyteezo-creator/wavsresolver/releases/latest) e execute-o. A instalação é por usuário e cria atalhos no Menu Iniciar e na área de trabalho. O app precisa de internet para acessar o catálogo WAVS.

Quem usa a versão portátil precisa instalar o instalador uma vez. Depois disso, o app verifica atualizações ao abrir, baixa as novas versões automaticamente e as instala ao fechar o app.

O instalador ainda não tem assinatura digital; o Windows pode exibir um aviso na primeira execução.

## Recursos

- Explorar packs recentes, filtrar por gênero e período e ordenar resultados.
- Pesquisar packs, samples e criadores; abrir perfis públicos.
- Salvar packs favoritos neste computador.
- Reproduzir previews com waveform, controle de volume, repetição e atalhos.
- Baixar previews MP3 individualmente ou baixar um pack inteiro.
- Alterar tema e manter preferências entre execuções.

Catálogo, metadados e previews dependem da disponibilidade e das regras atuais do WAVS.

## Atualizações

O GitHub Actions gera um instalador e uma release quando o código do app é atualizado na branch principal. A versão é incrementada automaticamente. Também é possível iniciar o workflow pela aba **Actions** do repositório.

## Desenvolvimento

Requer Node.js 22 ou superior. Execute `npm ci` e depois `npm start` para abrir o app. Para gerar localmente o instalador sem publicá-lo, execute `npm run build:win`.
