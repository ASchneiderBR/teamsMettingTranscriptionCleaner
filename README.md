# Teams Meeting Transcription Cleaner

Aplicacao web estatica para limpar transcricoes do Microsoft Teams em `.vtt` e `.docx`, gerar um TXT pronto para uso e exibir metricas de fala por participante. Tudo roda localmente no navegador, sem backend.

## Visao geral

O projeto foi refatorado de um HTML unico para uma aplicacao modular em `Vite + TypeScript`, com separacao clara entre:

- `app`: bootstrap, store, acoes, selectors e controller.
- `domain`: parsing, metricas e exportacao em funcoes puras.
- `platform`: integracao com browser, arquivos e runtime.
- `ui`: shell HTML, refs e renderers.
- `styles`: tokens, base, layout e componentes.

## Stack

- Vite
- TypeScript estrito
- Vitest + jsdom
- Biome
- `fflate` para leitura de `.docx`

## Funcionalidades

- Importa arquivos `.vtt` do Teams.
- Importa arquivos `.docx` exportados pelo Teams.
- Aceita texto VTT colado manualmente.
- Converte falas para o formato `Nome>Texto`.
- Remove tags VTT e normaliza espacos.
- Padroniza nomes de participantes.
- Calcula tempo de fala por participante.
- Calcula turnos e percentual de turnos.
- Calcula TTR e MTLD por participante e na reuniao.
- Exibe bigramas, trigramas, nuvem de palavras e timeline de fala.
- Gera saida em texto puro para copiar ou baixar.
- Mantem execucao 100% local.

## Como usar

1. Carregue um `.vtt` ou `.docx`, ou cole o conteudo de um VTT.
2. Preencha opcionalmente data, horario, titulo e observacoes.
3. Clique em `Processar`.
4. Copie ou baixe o TXT gerado.

## Desenvolvimento

### Instalacao

```bash
npm install
```

### Rodar localmente

```bash
npm run dev
```

### Build de producao

```bash
npm run build
npm run preview
```

O bundle final e gerado em `dist/`.

## Scripts disponiveis

- `npm run dev`: servidor local de desenvolvimento.
- `npm run build`: build de producao.
- `npm run preview`: preview local do build.
- `npm run test`: executa a suite de testes.
- `npm run test:watch`: roda testes em modo watch.
- `npm run typecheck`: validacao TypeScript.
- `npm run lint`: checagem Biome.
- `npm run check`: lint + typecheck + testes.

## Estrutura do projeto

```text
src/
  app/
  domain/
  platform/
  ui/
  styles/
public/
```

- `src/app`: bootstrap, estado e orquestracao.
- `src/domain`: regras de negocio, parsers e metricas.
- `src/platform`: integracao com browser, arquivos e runtime.
- `src/ui`: shell e renderizacao.
- `src/styles`: tokens e folhas de estilo.
- `public`: assets estaticos como favicon.

## Formatos de entrada

### VTT

Formato esperado principal:

```text
WEBVTT

00:00:00.000 --> 00:00:02.000
<v Nome>Texto...</v>
```

Fallback suportado:

```text
Nome: Texto
```

### DOCX

Formato esperado principal:

```text
Nome
0:03
Texto...
```

Tambem ha fallback para linhas inline:

```text
Nome 0:03 Texto...
```

## Saida gerada

- Resumo com titulo, data, horario e observacoes.
- Tabelas em texto de fala, turnos e lexico.
- Bigramas e trigramas mais frequentes.
- Transcricao limpa em `Nome>Texto`.
- Contagem de caracteres e estimativa de tokens.

## Qualidade

O projeto hoje e validado com:

- testes unitarios de parser VTT
- testes unitarios de parser DOCX
- testes de metricas
- testes de integracao da UI em jsdom
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Limitacoes

- As metricas dependem de timestamps corretos no VTT.
- Quando um cue possui mais de um participante, o tempo e dividido igualmente.
- No DOCX, o tempo e estimado por caracteres.
- O parser DOCX cobre o layout mais comum do Teams e possui fallback, mas nao garante compatibilidade com toda variacao de export.
- O titulo e inferido do nome do arquivo quando nao e informado manualmente.

## Deploy no homelab

O repositorio inclui o script `deploy-homelab.cmd`, que:

- roda `npm run build`
- limpa a pasta remota `/usr/share/caddy/reuniaoTeams`
- envia os arquivos de `dist/` usando `plink` e `pscp`

Pre-requisitos:

- PuTTY instalado em:
  - `C:\Program Files\PuTTY\plink.exe`
  - `C:\Program Files\PuTTY\pscp.exe`
- acesso SSH ao host configurado no script

Para executar:

```bat
deploy-homelab.cmd
```

## Privacidade

- Nenhum dado e enviado para servidor pela aplicacao.
- O processamento acontece no navegador do usuario.
- Ideal para uso interno ou publicacao estatica.
