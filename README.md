# Teams Meeting Transcription Cleaner (HTML único)

![License](https://img.shields.io/badge/license-MIT-green)

Projeto em HTML único para limpar transcrições do Microsoft Teams em `.vtt`, gerar um TXT pronto para uso e exibir métricas de fala por participante.

Demo (GitHub Pages): `https://aschneiderbr.github.io/teamsMettingTranscriptionCleaner/`

## O que ele faz (v1)
- Lê um arquivo `.vtt` local ou texto colado.
- Converte o conteúdo para linhas no formato `Nome>Texto`.
- Remove tags VTT (`<v>`, `<c>` etc.) e normaliza espaços.
- Calcula tempo de fala por participante com base nos timestamps dos cues.
- Gera um resumo em texto puro, tabela e transcrição limpa.
- Permite copiar o resultado e baixar um `.txt`.
- Exibe métricas visuais no próprio HTML.

## Como usar
1. Abra `index.html` no navegador.
2. Carregue um arquivo `.vtt` ou cole o conteúdo no campo de entrada.
3. (Opcional) informe data, horário de início, título e observações.
4. Clique em **Processar**.
5. Copie ou baixe o TXT gerado.

## Entrada esperada
O parser tenta lidar com VTTs do Teams no formato:

```
WEBVTT

00:00:00.000 --> 00:00:02.000
<v Nome>Texto...</v>
```

Se nao houver `<v Nome>`, o codigo tenta o fallback `Nome: Texto`.

## Saida gerada
- **Resumo** com titulo, data/hora, participantes e tempos.
- **Tabela em texto** (participante, tempo, % fala).
- **Transcrição limpa** no formato `Nome>Texto`.

## Opções do processamento
- **Unir quebras internas** dentro do mesmo cue.
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
- O título é inferido do nome do arquivo, caso não seja informado.

## Roadmap curto (ideias)
- Suporte a DOC/RTF de transcrições.
- Ajustes finos para VTTs com formatos diferentes do Teams.
- Mais visualizações de métricas.
- Exportar CSV das métricas.

## Desenvolvimento
Este repo é um HTML único, sem build. Basta editar `index.html`.
