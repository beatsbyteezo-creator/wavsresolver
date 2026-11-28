# WavsResolver

**Versão do projeto: 1.2.10.**

Aplicativo Windows para explorar packs públicos do WAVS, ouvir previews e baixar arquivos MP3.

## Instalar

Baixe o instalador Windows x64 na página de [Releases](https://github.com/beatsbyteezo-creator/wavsresolver/releases/latest) e execute-o. A instalação é por usuário e cria atalhos no Menu Iniciar e na área de trabalho. O app precisa de internet para acessar o catálogo WAVS.

O app verifica a versão assim que abre. Se houver atualização, é preciso instalá-la antes de entrar. O download acontece dentro do app e a instalação reinicia o WavsResolver. A verificação acontece em segundo plano e o aviso aparece quando há uma atualização disponível.

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

As publicações são iniciadas manualmente pela aba **Actions**. Informe a versão desejada e as notas resumidas da release. O instalador e os arquivos do atualizador são compilados e publicados no GitHub Releases. A versão semver `1.2.0` aparece no app como `1.2`.

## Desenvolvimento

Requer Node.js 22 ou superior. Execute `npm ci` e depois `npm start` para abrir o app. Para gerar localmente o instalador sem publicá-lo, execute `npm run build:win`.
