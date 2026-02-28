export function createShell(container: Element): void {
  container.innerHTML = `
    <div class="wrap">
      <header class="top">
        <div class="topHeading">
          <div class="topCopy">
            <h1>Limpador de transcrição (.vtt/.docx) → TXT + métricas de fala</h1>
          </div>
          <div class="topActions">
            <button class="ghost" id="themeToggle" type="button" aria-pressed="false">Modo escuro</button>
          </div>
        </div>
        <div class="topDesc">
          <p class="sub">Gera linhas <span class="kbd">Nome&gt;Texto</span>, calcula tempo por participante e resume a reunião localmente.</p>
          <p class="sub">Carregue um arquivo .vtt/.docx ou cole o conteúdo do VTT e clique em Processar.</p>
        </div>
        <div class="pillGroup">
          <span class="pill" id="pillTitle">Título: —</span>
          <span class="pill" id="pillTotal">Duração total: Sem dados</span>
          <span class="pill" id="pillPeople">Participantes: Sem dados</span>
        </div>
      </header>

      <div class="stack mainGrid">
        <div class="colStack">
          <section class="card" id="cardConfig">
            <h2>Arquivo</h2>
            <label for="file">Arquivo .vtt ou .docx</label>
            <div class="dropzone" id="dropzone" role="button" tabindex="0" aria-label="Arraste e solte ou clique para selecionar">
              <div class="dropzoneText">
                <div class="dropTitle">Arraste e solte o arquivo neste card</div>
                <div class="dropHint">ou selecione um arquivo .vtt/.docx</div>
              </div>
              <div class="dropzoneActions">
                <button class="primary" id="pickFile" type="button">Selecionar arquivo</button>
              </div>
            </div>
            <input
              class="visuallyHidden"
              id="file"
              type="file"
              accept=".vtt,.docx,text/vtt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <div class="dropMeta" id="dropMeta">Nenhum arquivo selecionado</div>

            <div class="row cols3 metadataRow gapTop">
              <div>
                <label for="meetingDate">Dia da reunião (dd/mm/aa)</label>
                <input id="meetingDate" type="text" inputmode="numeric" placeholder="dd/mm/aa" />
              </div>
              <div>
                <label for="meetingStart">Horário de início (24h)</label>
                <input id="meetingStart" type="text" inputmode="numeric" placeholder="hh:mm" />
              </div>
              <div>
                <label for="meetingTitle">Título da reunião (opcional)</label>
                <input id="meetingTitle" type="text" placeholder="Se vazio, usa o nome do arquivo" />
              </div>
            </div>

            <div class="row gapTopSmall">
              <div>
                <label for="meetingNotes">Observações (opcional)</label>
                <input id="meetingNotes" type="text" placeholder="Ex.: alinhamento comercial" />
              </div>
            </div>
          </section>

          <section class="card" id="cardInput">
            <h2>Entrada</h2>
            <label for="input">Cole aqui o conteúdo do VTT (ou carregue .vtt/.docx acima)</label>
            <textarea id="input" placeholder="Cole aqui o conteúdo do .vtt..."></textarea>
            <div class="controls">
              <button class="primary" id="pasteInput" type="button">Colar</button>
              <button id="clear" type="button">Limpar</button>
              <button class="primary" id="process" type="button">Processar</button>
              <span class="status muted" id="status">Pronto.</span>
            </div>
            <p class="hint">
              A limpeza aplica unir quebras internas, normalizar espaços, remover tags e descartar linhas vazias. Para DOCX, o tempo é estimado.
            </p>
          </section>
        </div>

        <div class="colStack">
          <section class="card" id="cardOutput">
            <h2>Saída (TXT limpo)</h2>
            <div class="outputHead">
              <label for="output">Resumo + tabelas em texto + transcrição limpa</label>
              <div class="pillGroup compact">
                <span class="pill" id="outChars">Caracteres: Sem dados</span>
                <span class="pill" id="outTokens" title="Estimativa aproximada para LLM (1 token ~= 4 caracteres).">Tokens (est.): Sem dados</span>
              </div>
            </div>
            <textarea id="output" readonly placeholder="O resultado aparecerá aqui..."></textarea>
            <div class="controls">
              <button class="primary" id="copy" type="button">Copiar</button>
              <button id="download" type="button">Baixar .txt</button>
              <span class="status muted" id="outStatus">—</span>
            </div>
          </section>

          <section class="card" id="cardMetrics">
            <h2>Métricas</h2>
            <div class="metricsSticky">
              <div class="metricsStickyTitle">Resumo</div>
              <div class="metricsPills">
                <span class="pill" id="pillTotalSticky">Duração total: Sem dados</span>
                <span class="pill" id="pillPeopleSticky">Participantes: Sem dados</span>
              </div>
            </div>

            <section class="metricSection">
              <div class="chartHeader">
                <div class="chartTitle">Tempo de fala</div>
              </div>
              <table class="metricsTable">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Tempo</th>
                    <th>% fala</th>
                    <th>Distribuição</th>
                  </tr>
                </thead>
                <tbody id="statsBody">
                  <tr><td colspan="4" class="emptyState">Sem dados</td></tr>
                </tbody>
              </table>
            </section>

            <section class="metricSection">
              <div class="chartHeader">
                <div class="chartTitle">Turnos (intervenções)</div>
                <div class="chartMeta" id="turnsMeta">Sem dados</div>
              </div>
              <table class="metricsTable">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Turnos</th>
                    <th>% turnos</th>
                    <th>Distribuição</th>
                  </tr>
                </thead>
                <tbody id="turnsBody">
                  <tr><td colspan="4" class="emptyState">Sem dados</td></tr>
                </tbody>
              </table>
            </section>

            <section class="metricSection">
              <div class="chartHeader">
                <div class="chartTitle">Variedade de vocabulário (TTR e MTLD)</div>
                <div class="chartMeta" id="lexicalMeta">TTR mede variedade imediata; MTLD mede variedade com mais estabilidade.</div>
              </div>
              <table class="metricsTable">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Tipos</th>
                    <th>TTR</th>
                    <th>MTLD</th>
                  </tr>
                </thead>
                <tbody id="lexicalBody">
                  <tr><td colspan="4" class="emptyState">Sem dados</td></tr>
                </tbody>
              </table>
            </section>

            <section class="metricSection">
              <div class="chartHeader">
                <div class="chartTitle">Expressões mais frequentes (bi e tri-gramas)</div>
                <div class="chartMeta" id="ngramMeta">Bi-grama = 2 palavras em sequência; tri-grama = 3.</div>
              </div>
              <div class="ngramGrid">
                <table class="metricsTable">
                  <thead>
                    <tr>
                      <th>Bi-grama</th>
                      <th>Freq.</th>
                    </tr>
                  </thead>
                  <tbody id="bigramBody">
                    <tr><td colspan="2" class="emptyState">Sem dados</td></tr>
                  </tbody>
                </table>
                <table class="metricsTable">
                  <thead>
                    <tr>
                      <th>Tri-grama</th>
                      <th>Freq.</th>
                    </tr>
                  </thead>
                  <tbody id="trigramBody">
                    <tr><td colspan="2" class="emptyState">Sem dados</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="metricSection">
              <div class="chartHeader">
                <div class="chartTitle">Nuvem de palavras</div>
                <div class="chartMeta" id="wordCloudMeta">Sem dados</div>
              </div>
              <div class="wordCloud chartEmpty" id="wordCloud" role="img" aria-label="Nuvem de palavras">Sem dados</div>
            </section>

            <section class="metricSection">
              <div class="chartHeader">
                <div class="chartTitle">Fala ao longo do tempo</div>
                <div class="chartMeta" id="timelineMeta">Sem dados</div>
              </div>
              <div class="chartGrid chartEmpty" id="timelineChart" role="img" aria-label="Fala ao longo do tempo">Sem dados</div>
              <div class="chartAxis">
                <span id="timelineStart">Início</span>
                <span id="timelineEnd">Fim</span>
              </div>
              <div class="legend" id="timelineLegend"></div>
            </section>
          </section>
        </div>
      </div>

      <p class="siteCredit">Execução 100% local no navegador.</p>
    </div>
  `;
}
