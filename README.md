# Teams Meeting Transcription Cleaner (HTML único)

![License](https://img.shields.io/badge/license-MIT-green)

Projeto em HTML único para limpar transcrições do Microsoft Teams em `.vtt` e `.docx`, gerar um TXT pronto para uso e exibir métricas de fala por participante.

Demo (GitHub Pages): https://aschneiderbr.github.io/teamsMettingTranscriptionCleaner/

## O que ele faz (v2)
- Lê arquivo `.vtt` local ou texto colado.
- Lê arquivo `.docx` de transcrição do Teams.
- Converte o conteúdo para linhas no formato `Nome>Texto`.
- Remove tags VTT (`<v>`, `<c>` etc.) e normaliza espaços.
- Normaliza nomes de participantes para o formato com primeira letra maiúscula (ex.: `joAO da silva` -> `Joao Da Silva`).
- Calcula tempo de fala por participante:
  - VTT: usa timestamps dos cues.
  - DOCX: estima pela contagem de caracteres.
- Calcula turnos (número de intervenções e % de turnos) por participante.
- Calcula variedade de vocabulário por participante e na reunião:
  - TTR (tipos/total de palavras, mais sensível ao tamanho do texto).
  - MTLD (medida mais estável da diversidade lexical; quanto maior, maior a variedade).
- Gera um resumo em texto puro, tabela e transcrição limpa.
- Permite copiar o resultado e baixar um `.txt`.
- Exibe métricas visuais no próprio HTML.
- Gera uma nuvem de palavras com as 30 palavras mais repetidas.
- Exibe expressões mais frequentes da reunião:
  - Bi-gramas (sequências de 2 palavras).
  - Tri-gramas (sequências de 3 palavras).
  - Ignora repetições idênticas como `sim sim` e `não não não`.
- Inclui botão **Colar** na área de entrada (cola direto da área de transferência).
- Layout responsivo melhorado para modo vertical mobile (1 coluna, centralizado, com padding lateral reduzido).
- Gráfico **Fala ao longo do tempo** com resolução dinâmica pela largura disponível:
  - Mantém largura visual das barras mais estável.
  - Ajusta a janela entre **2 e 5 minutos** (maior janela em áreas menores).

## Como usar
1. Abra `index.html` no navegador.
2. Carregue um arquivo `.vtt` ou `.docx` (ou use o botão **Colar** no card de entrada para colar da área de transferência).
3. (Opcional) informe data, horário de início, título e observações.
4. Clique em **Processar**.
5. Use **Limpar** para resetar os dados quando necessário.
6. Copie ou baixe o TXT gerado.

## Entrada esperada (VTT)
O parser tenta lidar com VTTs do Teams no formato:

```
WEBVTT

00:00:00.000 --> 00:00:02.000
<v Nome>Texto...</v>
```

Se não houver `<v Nome>`, o código tenta o fallback `Nome: Texto`.

## Entrada esperada (DOCX)
Arquivos `.docx` exportados pelo Microsoft Teams com blocos de fala no formato:

```
Nome
0:03
Texto...
```

## Saída gerada
- **Resumo** com título, data/hora, participantes e tempos.
- **Tabela em texto** (participante, tempo, % fala).
- **Tabela em texto de turnos** (participante, turnos, % turnos).
- **Tabela em texto de variedade de vocabulário** (tipos, TTR e MTLD por participante e reunião).
- **Expressões mais frequentes em texto** (bi-gramas e tri-gramas, com filtro de repetições idênticas).
- **Transcrição limpa** no formato `Nome>Texto`.
- **Nomes padronizados** com capitalização consistente em VTT, DOCX e métricas.
- **Indicadores de tamanho da saída**: total de caracteres e total de tokens estimados para uso com LLM (`1 token ~= 4 caracteres`).

## Opções do processamento
- **Unir quebras internas** dentro do mesmo bloco.
- **Normalizar espaços** (remove duplicados e aparas).
- **Remover tags** (`<v>`, `<c>`, etc.).
- **Remover linhas vazias**.

## Privacidade e execução local
- Tudo roda 100% localmente no navegador.
- Nenhum dado é enviado para servidor (funciona offline).
- Ideal para publicar no GitHub Pages sem backend.

## Limitações atuais
- Métricas dependem de timestamps corretos no VTT.
- Quando um cue tem mais de um participante, o tempo é dividido igualmente.
- No DOCX o tempo é estimado por caracteres (não há timestamp por palavra).
- O título é inferido do nome do arquivo, caso não seja informado.
- O navegador precisa suportar `DecompressionStream` para ler DOCX (Chrome/Edge modernos).

## Roadmap curto (ideias)
- Ajustes finos no parser de DOCX para variações de layout.
- Exportar CSV das métricas.
- Mais visualizações de métricas.

## Desenvolvimento
Este repo é um HTML único, sem build. Basta editar `index.html`.
