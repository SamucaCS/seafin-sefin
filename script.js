const SUPABASE_URL = "https://gheomtxpsigcrbdfnybo.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZW9tdHhwc2lnY3JiZGZueWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc0NDcsImV4cCI6MjA4NDg0MzQ0N30.JU2AezTf0fbzA1SX5fC3Stokm4B1cYuliwtYE224iw8";
const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const opcoesMenu = {
  diaria: [
    "Pagamento Diária",
    "Cadastro de conta SIAFEM",
    "Requisição de Transporte",
  ],
  federal: [
    "Categorização BB Gestão Agil",
    "Erro de Lançamento - Nota Fiscal",
    "Erro no sistema",
    "Importação de repasse na SED",
    "Orientação sobre retenção de imposto",
    "Reabertura de prestação de conta",
    "Lançamento de Recursos Próprios",
  ],
  paulista: [
    "Categorização BB Gestão Agil",
    "Erro de Lançamento - Nota Fiscal",
    "Erro no sistema",
    "Importação de repasse na SED",
    "Orientação sobre retenção de imposto",
    "Reabertura de prestação de conta",
    "Lançamento de Recursos Próprios",
  ],
  duvidas: [
    "Solicitação de orientação PDDE Federal",
    "Solicitação de orientação PDDE Paulista",
  ],
  fatura: ["Envio de Fatura", "Informação Geral", "Outros"],
};

function abrirFormulario(tipoServico) {
  if (tipoServico === "duvidas") {
    const agendaModal = document.getElementById("agendaModal");
    if (agendaModal) {
      agendaModal.style.display = "flex";
      verificarDisponibilidade();
    } else {
      console.error("Erro: Modal de Agenda não encontrado no HTML.");
    }
  } else {
    configurarModalPadrao(tipoServico);
    const modalOverlay = document.getElementById("modalOverlay");
    if (modalOverlay) {
      modalOverlay.style.display = "flex";
    }
  }
}

function configurarModalPadrao(tipoKey, horarioSelecionado = null) {
  const titulo = document.getElementById("tituloModal");
  const areaDinamica = document.getElementById("areaDinamica");
  const inputHorario = document.getElementById("horarioEscolhido");

  const titulos = {
    diaria: "Diária - Pagamentos e Transporte",
    federal: "PDDE Federal - Gestão Ágil",
    paulista: "PDDE Paulista - Prestação de Contas",
    fatura: "Fatura / Informação",
    duvidas: "Dúvidas / Orientações",
  };

  if (titulo) titulo.innerText = titulos[tipoKey] || "Solicitação de Serviço";
  const labelObs = Array.from(document.querySelectorAll("label")).find((el) =>
    el.innerText.includes("Observações"),
  );

  if (labelObs) {
    if (tipoKey === "federal") {
      labelObs.innerText =
        "Observações (Inserir o programa e Exercício EX: Educação Básica 2025)";
    } else if (tipoKey === "paulista") {
      labelObs.innerText =
        "Observações (Inserir a categoria EX: Custeio de exercício de 2025)";
    } else {
      labelObs.innerText = "Observações (Explique a situação)";
    }
  }

  areaDinamica.innerHTML = "";
  let selectHtml = "";
  if (opcoesMenu[tipoKey]) {
    const options = opcoesMenu[tipoKey]
      .map((opt) => `<option value="${opt}">${opt}</option>`)
      .join("");
    selectHtml = `
            <div class="input-group" style="margin-bottom: 15px;">
                <label style="color:#2c3e50; font-weight:600;">Selecione o Assunto: *</label>
                <select id="detalheServico" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                    <option value="" disabled selected>-- Selecione uma opção --</option>
                    ${options}
                </select>
            </div>
        `;
  }

  if (horarioSelecionado) {
    areaDinamica.innerHTML = `
            ${selectHtml}
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border: 1px solid #27ae60; color: #1e8449;">
                <strong><i class="fa-regular fa-clock"></i> Agendamento Confirmado:</strong><br>
                ${horarioSelecionado}
            </div>
        `;
    if (inputHorario) inputHorario.value = horarioSelecionado;
  } else {
    if (inputHorario) inputHorario.value = "";
    areaDinamica.innerHTML = `
            ${selectHtml}
            <div class="input-group">
                <label>Documento Principal (Obrigatório) *</label>
                <input type="file" id="arquivo1" accept=".pdf,.jpg,.png,.jpeg" required>
            </div>
            <div class="input-group">
                <label>Documento Extra (Opcional)</label>
                <input type="file" id="arquivo2" accept=".pdf,.jpg,.png,.jpeg">
            </div>
        `;
  }
}

async function verificarDisponibilidade() {
  try {
    const { data, error } = await _supabase
      .from("chamados")
      .select("horario_agendamento")
      .neq("status", "Cancelado")
      .neq("status", "Concluido")
      .not("horario_agendamento", "is", null);

    if (error) throw error;

    const horariosOcupados = (data || [])
      .map((h) => h.horario_agendamento)
      .filter((h) => h && h.trim().length > 0);

    const botoes = document.querySelectorAll(".time-btn");

    botoes.forEach((btn) => {
      const textoOnclick = btn.getAttribute("onclick");
      const match = textoOnclick.match(/'([^']+)'/);
      const horarioBotao = match ? match[1] : null;

      if (horarioBotao) {
        const estaOcupado = horariosOcupados.includes(horarioBotao);

        if (estaOcupado) {
          btn.disabled = true;
          btn.style.backgroundColor = "#ccc";
          btn.style.textDecoration = "line-through";
          btn.style.cursor = "not-allowed";
          btn.title = "Horário Indisponível";
        } else {
          btn.disabled = false;
          btn.style.backgroundColor = "";
          btn.style.textDecoration = "none";
          btn.style.cursor = "pointer";
          btn.title = "Disponível";
        }
      }
    });
  } catch (err) {
    console.error("Erro ao verificar agenda:", err);
  }
}

function confirmarAgendamento(textoHorario) {
  fecharAgenda();
  configurarModalPadrao("duvidas", textoHorario);
  document.getElementById("modalOverlay").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

function fecharAgenda() {
  document.getElementById("agendaModal").style.display = "none";
}

async function enviarFormulario(e) {
  e.preventDefault();
  const submitBtn = document.querySelector(".btn-submit");
  const textoOriginal = submitBtn.innerText;
  submitBtn.innerText = "Processando...";
  submitBtn.disabled = true;

  try {
    const form = document.getElementById("formSuporte");

    const getVal = (selector) => {
      const el = form.querySelector(selector);
      return el ? el.value : "";
    };
    const nome = getVal('input[placeholder="Nome Completo"]');
    const cpf = getVal('input[placeholder="CPF"]');
    const unidade = getVal('input[placeholder="Unidade Escolar"]');
    const email = getVal('input[type="email"]');
    const observacao = getVal("textarea");
    const detalheElement = document.getElementById("detalheServico");
    const detalheSolicitacao = detalheElement ? detalheElement.value : "";
    const inputHorario = document.getElementById("horarioEscolhido");
    const horarioAgendado = inputHorario ? inputHorario.value : null;

    if (
      !nome.trim() ||
      !cpf.trim() ||
      !unidade.trim() ||
      !email.trim() ||
      !observacao.trim()
    ) {
      throw new Error(
        "Por favor, preencha todos os campos obrigatórios (Nome, CPF, Unidade, Email e Observação).",
      );
    }

    if (detalheElement && !detalheSolicitacao) {
      throw new Error("Por favor, selecione uma opção no menu de assunto.");
    }

    if (!horarioAgendado) {
      const f1 = document.getElementById("arquivo1");
      if (!f1 || f1.files.length === 0) {
        throw new Error("O Documento Principal é obrigatório.");
      }
    }

    const tituloServico = document.getElementById("tituloModal").innerText;
    const protocolo = Date.now().toString().slice(-8);
    let urlArquivo1 = null;
    let urlArquivo2 = null;

    if (!horarioAgendado) {
      const f1 = document.getElementById("arquivo1");
      const f2 = document.getElementById("arquivo2");
      if (f1 && f1.files.length > 0)
        urlArquivo1 = await uploadArquivo(f1.files[0], protocolo + "_doc1");
      if (f2 && f2.files.length > 0)
        urlArquivo2 = await uploadArquivo(f2.files[0], protocolo + "_doc2");
    }

    const { error } = await _supabase.from("chamados").insert({
      protocolo: protocolo,
      tipo_servico: tituloServico,
      detalhe_solicitacao: detalheSolicitacao,
      nome: nome,
      cpf: cpf,
      unidade_escolar: unidade,
      email: email,
      observacao: observacao,
      arquivo_url: urlArquivo1,
      arquivo_extra_url: urlArquivo2,
      horario_agendamento: horarioAgendado,
      status: "Pendente",
    });

    if (error) throw error;

    alert(`Sucesso! Seu protocolo é: ${protocolo}`);
    fecharModal();
    form.reset();
  } catch (erro) {
    console.error(erro);
    alert("Atenção: " + erro.message);
  } finally {
    submitBtn.innerText = textoOriginal;
    submitBtn.disabled = false;
  }
}

async function uploadArquivo(file, nomeBase) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${nomeBase}.${fileExt}`;

  const { error } = await _supabase.storage
    .from("documentos")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = _supabase.storage.from("documentos").getPublicUrl(filePath);
  return data.publicUrl;
}

window.abrirFormulario = abrirFormulario;
window.fecharModal = fecharModal;
window.fecharAgenda = fecharAgenda;
window.confirmarAgendamento = confirmarAgendamento;
window.enviarFormulario = enviarFormulario;
