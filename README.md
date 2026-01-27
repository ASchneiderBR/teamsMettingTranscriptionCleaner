# Teams Meeting Transcription Cleaner (HTML unico)

![License](https://img.shields.io/badge/license-MIT-green)

Projeto em HTML unico para limpar transcricoes do Microsoft Teams em `.vtt`, gerar um TXT pronto para uso, e exibir metricas de fala por participante.

## O que ele faz (v1)
- Le um arquivo `.vtt` local ou texto colado.
- Converte o conteudo para linhas no formato `Nome>Texto`.
- Remove tags VTT (`<v>`, `<c>` etc.) e normaliza espacos.
- Calcula tempo de fala por participante com base nos timestamps dos cues.
- Gera um resumo em texto puro, tabela, e transcricao limpa.
- Permite copiar o resultado e baixar um `.txt`.
- Exibe metricas visuais no proprio HTML.

## Como usar
1. Abra `index.html` no navegador.
2. Carregue um arquivo `.vtt` ou cole o conteudo no campo de entrada.
3. (Opcional) informe data, horario de inicio, titulo, e observacoes.
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
- **Transcricao limpa** no formato `Nome>Texto`.

## Opcoes do processamento
- **Unir quebras internas** dentro do mesmo cue.
- **Normalizar espacos** (remove duplicados e aparas).
- **Remover tags** (`<v>`, `<c>`, etc.).
- **Remover linhas vazias**.

## Privacidade e execucao local
- Tudo roda 100% localmente no navegador.
- Nenhum dado e enviado para servidor (funciona offline).
- Ideal para publicar no GitHub Pages sem backend.

## Limitacoes atuais
- Metricas dependem de timestamps corretos no VTT.
- Quando um cue tem mais de um participante, o tempo e dividido igualmente.
- O titulo e inferido do nome do arquivo, caso nao seja informado.

## Roadmap curto (ideias)
- Suporte a DOC/RTF de transcricoes.
- Ajustes finos para VTTs com formatos diferentes do Teams.
- Mais visualizacoes de metricas.
- Exportar CSV das metricas.

## Desenvolvimento
Este repo e um HTML unico, sem build. Basta editar `index.html`.
