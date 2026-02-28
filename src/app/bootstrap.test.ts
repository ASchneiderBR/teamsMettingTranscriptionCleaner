import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { readDocxDocumentXmlMock } = vi.hoisted(() => ({
  readDocxDocumentXmlMock: vi.fn(),
}));

vi.mock("../platform/files/read-docx", () => ({
  readDocxDocumentXml: readDocxDocumentXmlMock,
}));

import { bootstrap } from "./bootstrap";

function mountApp() {
  document.body.innerHTML = '<div id="app"></div>';
  bootstrap(document.querySelector("#app"));
}

function buildDocxFile(paragraphs: string[]): File {
  readDocxDocumentXmlMock.mockResolvedValue(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        ${paragraphs
          .map((paragraph) => `<w:p><w:r><w:t xml:space="preserve">${paragraph}</w:t></w:r></w:p>`)
          .join("")}
      </w:body>
    </w:document>`);
  return new File(["dummy"], "reuniao.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

describe("bootstrap integration", () => {
  beforeEach(() => {
    readDocxDocumentXmlMock.mockReset();
  });

  it("processes manual VTT input and updates output and metrics", async () => {
    mountApp();

    const input = screen.getByLabelText(/Cole aqui o conteúdo do VTT/i);
    fireEvent.input(input, {
      target: {
        value: `WEBVTT

00:00:00.000 --> 00:00:04.000
<v Ana>Bom dia</v>

00:00:04.000 --> 00:00:08.000
<v Bruno>Vamos começar</v>`,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /Processar/i }));

    await waitFor(() => {
      const output = screen.getByLabelText(
        /Resumo \+ tabelas em texto \+ transcrição limpa/i,
      ) as HTMLTextAreaElement;
      expect(output.value).toContain("Ana>Bom dia");
    });

    expect(screen.getAllByText("Ana").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bruno").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Participantes: 2/i).length).toBeGreaterThan(0);
  });

  it("loads DOCX, fills input and processes result", async () => {
    mountApp();

    const fileInput = document.querySelector<HTMLInputElement>("#file");
    if (!fileInput) {
      throw new Error("Campo de arquivo não encontrado.");
    }
    const file = buildDocxFile(["Maria", "0:03", "Bom dia equipe"]);
    Object.defineProperty(fileInput, "files", {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      const input = screen.getByLabelText(/Cole aqui o conteúdo do VTT/i) as HTMLTextAreaElement;
      expect(input.value).toBe("Maria>Bom dia equipe");
    });

    fireEvent.click(screen.getByRole("button", { name: /Processar/i }));

    await waitFor(() => {
      const output = screen.getByLabelText(
        /Resumo \+ tabelas em texto \+ transcrição limpa/i,
      ) as HTMLTextAreaElement;
      expect(output.value).toContain("Maria>Bom dia equipe");
    });
  });

  it("rebuilds output when metadata changes after processing", async () => {
    mountApp();

    const input = screen.getByLabelText(/Cole aqui o conteúdo do VTT/i);
    fireEvent.input(input, {
      target: {
        value: `WEBVTT

00:00:00.000 --> 00:00:02.000
<v Ana>Teste</v>`,
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Processar/i }));

    fireEvent.input(screen.getByLabelText(/Título da reunião/i), {
      target: { value: "Reunião Especial" },
    });
    fireEvent.input(screen.getByLabelText(/Dia da reunião/i), {
      target: { value: "010226" },
    });
    fireEvent.input(screen.getByLabelText(/Horário de início/i), {
      target: { value: "0930" },
    });
    fireEvent.input(screen.getByLabelText(/Observações/i), {
      target: { value: "Sprint" },
    });

    await waitFor(() => {
      const output = screen.getByLabelText(
        /Resumo \+ tabelas em texto \+ transcrição limpa/i,
      ) as HTMLTextAreaElement;
      expect(output.value).toContain("Título: Reunião Especial");
      expect(output.value).toContain("Data: 01/02/26");
      expect(output.value).toContain("Horário de início: 09:30");
      expect(output.value).toContain("Observações: Sprint");
    });
  });

  it("clears state back to empty", async () => {
    mountApp();

    const input = screen.getByLabelText(/Cole aqui o conteúdo do VTT/i);
    fireEvent.input(input, {
      target: {
        value: `WEBVTT

00:00:00.000 --> 00:00:02.000
<v Ana>Teste</v>`,
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Processar/i }));
    fireEvent.click(screen.getByRole("button", { name: /Limpar/i }));

    expect(
      (screen.getByLabelText(/Cole aqui o conteúdo do VTT/i) as HTMLTextAreaElement).value,
    ).toBe("");
    expect(
      (
        screen.getByLabelText(
          /Resumo \+ tabelas em texto \+ transcrição limpa/i,
        ) as HTMLTextAreaElement
      ).value,
    ).toBe("");
    expect(screen.getAllByText(/Duração total: Sem dados/i).length).toBeGreaterThan(0);
  });

  it("applies persisted theme and handles clipboard failure", async () => {
    localStorage.setItem("tmtc-theme", "dark");
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });

    mountApp();

    expect(document.documentElement.dataset.theme).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: /Colar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Clipboard não disponível no navegador/i)).toBeTruthy();
    });

    if (clipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
    }
  });

  it("toggles theme reliably on click", async () => {
    mountApp();

    const toggle = screen.getByRole("button", { name: /Modo escuro/i });
    expect(document.documentElement.dataset.theme).toBe("light");

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
    });

    fireEvent.click(screen.getByRole("button", { name: /Modo claro/i }));
    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("light");
    });
  });

  it("keeps participant names out of the word cloud", async () => {
    mountApp();

    const input = document.querySelector<HTMLTextAreaElement>("#input");
    if (!input) {
      throw new Error("Campo de entrada não encontrado.");
    }

    fireEvent.input(input, {
      target: {
        value: `WEBVTT

00:00:00.000 --> 00:00:04.000
<v Ana>Roadmap roadmap com a equipe</v>

00:00:04.000 --> 00:00:08.000
<v Bruno>Roadmap e backlog</v>`,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /Processar/i }));

    await waitFor(() => {
      const cloud = document.querySelector<HTMLElement>("#wordCloud");
      expect(cloud?.textContent?.toLocaleLowerCase("pt-BR")).toContain("roadmap");
      expect(cloud?.textContent?.toLocaleLowerCase("pt-BR")).not.toContain("ana");
      expect(cloud?.textContent?.toLocaleLowerCase("pt-BR")).not.toContain("bruno");
    });
  });

  it("downloads with sanitized filename", async () => {
    mountApp();

    let lastDownload = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function click(
      this: HTMLAnchorElement,
    ) {
      lastDownload = this.download;
    });

    fireEvent.input(screen.getByLabelText(/Cole aqui o conteúdo do VTT/i), {
      target: {
        value: `WEBVTT

00:00:00.000 --> 00:00:02.000
<v Ana>Teste</v>`,
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Processar/i }));
    fireEvent.input(screen.getByLabelText(/Título da reunião/i), {
      target: { value: "Reunião Especial" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Baixar .txt/i }));

    expect(lastDownload).toMatch(
      /^reuniao-especial-limpa-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.txt$/,
    );
  });
});
