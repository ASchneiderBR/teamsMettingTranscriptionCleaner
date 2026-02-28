export interface AppRefs {
  themeToggle: HTMLButtonElement;
  file: HTMLInputElement;
  dropzone: HTMLDivElement;
  dropMeta: HTMLDivElement;
  pickFile: HTMLButtonElement;
  configCard: HTMLElement;
  input: HTMLTextAreaElement;
  output: HTMLTextAreaElement;
  status: HTMLSpanElement;
  outStatus: HTMLSpanElement;
  outChars: HTMLSpanElement;
  outTokens: HTMLSpanElement;
  meetingDate: HTMLInputElement;
  meetingStart: HTMLInputElement;
  meetingTitle: HTMLInputElement;
  meetingNotes: HTMLInputElement;
  pillTitle: HTMLSpanElement;
  pillTotal: HTMLSpanElement;
  pillPeople: HTMLSpanElement;
  pillTotalSticky: HTMLSpanElement;
  pillPeopleSticky: HTMLSpanElement;
  statsBody: HTMLTableSectionElement;
  turnsBody: HTMLTableSectionElement;
  turnsMeta: HTMLDivElement;
  lexicalBody: HTMLTableSectionElement;
  lexicalMeta: HTMLDivElement;
  ngramMeta: HTMLDivElement;
  bigramBody: HTMLTableSectionElement;
  trigramBody: HTMLTableSectionElement;
  timelineChart: HTMLDivElement;
  timelineLegend: HTMLDivElement;
  timelineMeta: HTMLDivElement;
  timelineStart: HTMLSpanElement;
  timelineEnd: HTMLSpanElement;
  wordCloud: HTMLDivElement;
  wordCloudMeta: HTMLDivElement;
  process: HTMLButtonElement;
  pasteInput: HTMLButtonElement;
  clear: HTMLButtonElement;
  copy: HTMLButtonElement;
  download: HTMLButtonElement;
}

export function createAppRefs(root: ParentNode): AppRefs {
  return {
    themeToggle: query(root, "themeToggle"),
    file: query(root, "file"),
    dropzone: query(root, "dropzone"),
    dropMeta: query(root, "dropMeta"),
    pickFile: query(root, "pickFile"),
    configCard: query(root, "cardConfig"),
    input: query(root, "input"),
    output: query(root, "output"),
    status: query(root, "status"),
    outStatus: query(root, "outStatus"),
    outChars: query(root, "outChars"),
    outTokens: query(root, "outTokens"),
    meetingDate: query(root, "meetingDate"),
    meetingStart: query(root, "meetingStart"),
    meetingTitle: query(root, "meetingTitle"),
    meetingNotes: query(root, "meetingNotes"),
    pillTitle: query(root, "pillTitle"),
    pillTotal: query(root, "pillTotal"),
    pillPeople: query(root, "pillPeople"),
    pillTotalSticky: query(root, "pillTotalSticky"),
    pillPeopleSticky: query(root, "pillPeopleSticky"),
    statsBody: query(root, "statsBody"),
    turnsBody: query(root, "turnsBody"),
    turnsMeta: query(root, "turnsMeta"),
    lexicalBody: query(root, "lexicalBody"),
    lexicalMeta: query(root, "lexicalMeta"),
    ngramMeta: query(root, "ngramMeta"),
    bigramBody: query(root, "bigramBody"),
    trigramBody: query(root, "trigramBody"),
    timelineChart: query(root, "timelineChart"),
    timelineLegend: query(root, "timelineLegend"),
    timelineMeta: query(root, "timelineMeta"),
    timelineStart: query(root, "timelineStart"),
    timelineEnd: query(root, "timelineEnd"),
    wordCloud: query(root, "wordCloud"),
    wordCloudMeta: query(root, "wordCloudMeta"),
    process: query(root, "process"),
    pasteInput: query(root, "pasteInput"),
    clear: query(root, "clear"),
    copy: query(root, "copy"),
    download: query(root, "download"),
  };
}

function query<T extends HTMLElement>(root: ParentNode, id: string): T {
  const element = root.querySelector<T>(`#${id}`);
  if (!element) {
    throw new Error(`Elemento obrigatório não encontrado: #${id}`);
  }
  return element;
}
