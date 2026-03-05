const SUPABASE_URL = "https://gheomtxpsigcrbdfnybo.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZW9tdHhwc2lnY3JiZGZueWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc0NDcsImV4cCI6MjA4NDg0MzQ0N30.JU2AezTf0fbzA1SX5fC3Stokm4B1cYuliwtYE224iw8";

const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
let abaAtiva = "Pendente";

function trocarAba(status, btnEl) {
  document.querySelectorAll(".painel-aba").forEach((p) => (p.style.display = "none"));
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));

  const painel = document.getElementById(`painel-${status}`);
  if (painel) painel.style.display = "block";
  if (btnEl) btnEl.classList.add("active");

  abaAtiva = status;
}

async function carregarChamados() {
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "block";

  ["Pendente", "Em Andamento", "Concluido", "Cancelado"].forEach((s) => {
    const corpo = document.getElementById(`corpo-${s}`);
    if (corpo) corpo.innerHTML = "";
    const vazio = document.getElementById(`vazio-${s}`);
    if (vazio) vazio.style.display = "none";
  });

  try {
    const { data, error } = await _supabase
      .from("chamados")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (loading) loading.style.display = "none";

    const contadores = { Pendente: 0, "Em Andamento": 0, Concluido: 0, Cancelado: 0 };

    data.forEach((chamado) => {
      const status = chamado.status || "Pendente";
      const corpo = document.getElementById(`corpo-${status}`);
      if (corpo) {
        renderizarLinha(chamado, corpo);
        if (contadores[status] !== undefined) contadores[status]++;
      }
    });

    Object.entries(contadores).forEach(([status, qtd]) => {
      const badge = document.getElementById(`badge-${status}`);
      if (badge) badge.textContent = qtd;
    });

    ["Pendente", "Em Andamento", "Concluido", "Cancelado"].forEach((s) => {
      const corpo = document.getElementById(`corpo-${s}`);
      const vazio = document.getElementById(`vazio-${s}`);
      if (corpo && vazio && corpo.innerHTML.trim() === "") {
        vazio.style.display = "block";
      }
    });
  } catch (erro) {
    console.error(erro);
    if (loading) loading.innerText = "Erro ao carregar dados.";
  }
}

function renderizarLinha(chamado, tbody) {
  const dataFormatada = chamado.created_at
    ? new Date(chamado.created_at).toLocaleDateString("pt-BR") +
    " às " +
    new Date(chamado.created_at).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";

  let servicoHtml = `<strong>${chamado.tipo_servico || "Serviço não informado"}</strong>`;

  if (chamado.detalhe_solicitacao) {
    servicoHtml += `<br><span style="color:#2980b9; font-size:13px; font-weight:600;">• ${chamado.detalhe_solicitacao}</span>`;
  }
  if (chamado.exercicio) {
    servicoHtml += `<br><span style="color:#8e44ad; font-size:12px; font-weight:600;">📅 Exercício: ${chamado.exercicio}</span>`;
  }
  if (chamado.programa) {
    servicoHtml += `<br><span style="color:#16a085; font-size:12px; font-weight:600;">📂 Programa: ${chamado.programa}</span>`;
  }
  if (chamado.horario_agendamento) {
    servicoHtml += `<br><small style="color:#e67e22; font-weight:bold"><i class="fa-regular fa-clock"></i> ${chamado.horario_agendamento}</small>`;
  }
  if (chamado.observacao) {
    servicoHtml += `
      <div style="margin-top:6px; background:#f8f9fa; border-left:3px solid #95a5a6; padding:4px 8px; font-size:12px; color:#555; font-style:italic;">
        <strong>Obs:</strong> ${chamado.observacao}
      </div>`;
  }

  let docsHtml = "";
  if (chamado.arquivo_url)
    docsHtml += `<a href="${chamado.arquivo_url}" target="_blank" class="btn-doc">Doc 1</a>`;
  if (chamado.arquivo_extra_url)
    docsHtml += `<a href="${chamado.arquivo_extra_url}" target="_blank" class="btn-doc">Doc 2</a>`;
  if (!docsHtml)
    docsHtml = '<span style="color:#ccc; font-size:12px">Sem anexo</span>';

  const statusClass = `status-${(chamado.status || "pendente").toLowerCase().replace(" ", "-")}`;

  const emailHtml = chamado.email
    ? `<a href="mailto:${chamado.email}" style="color:#2980b9; text-decoration:none;">${chamado.email}</a>`
    : '<span style="color:#999">-</span>';

  const nomeExibir = chamado.nome || '<span style="color:#999; font-style:italic;">Sem Nome</span>';
  const cpfExibir = chamado.cpf || "";

  const escolaExibir = chamado.unidade_escolar
    ? `<div style="font-size:13px; color:#444;"><i class="fa-solid fa-school" style="color:#27ae60; margin-right:5px;"></i>${chamado.unidade_escolar}</div>`
    : '<span style="color:#ccc; font-size:12px;">-</span>';

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><strong>#${chamado.protocolo || "..."}</strong></td>
    <td>${dataFormatada}</td>
    <td>
      <div style="font-weight:bold; color:#2c3e50;">${nomeExibir}</div>
      <small style="color:#777">${cpfExibir}</small>
    </td>
    <td>${escolaExibir}</td>
    <td>${emailHtml}</td>
    <td>${servicoHtml}</td>
    <td>${docsHtml}</td>
    <td>
      <select onchange="atualizarStatus('${chamado.id}', this.value)" class="select-status ${statusClass}">
        <option value="Pendente"     ${chamado.status === "Pendente" ? "selected" : ""}>Pendente</option>
        <option value="Em Andamento" ${chamado.status === "Em Andamento" ? "selected" : ""}>Em Andamento</option>
        <option value="Concluido"    ${chamado.status === "Concluido" ? "selected" : ""}>Concluído</option>
        <option value="Cancelado"    ${chamado.status === "Cancelado" ? "selected" : ""}>Cancelado</option>
      </select>
    </td>
    <td>
      <div class="action-buttons">
        <button class="btn-action btn-edit" title="Editar"
          onclick="editarChamado('${chamado.id}', '${(chamado.nome || "").replace(/'/g, "\\'")}', '${(chamado.cpf || "").replace(/'/g, "\\'")}', '${(chamado.observacao || "").replace(/'/g, "\\'")}')">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn-action btn-delete" title="Excluir" onclick="excluirChamado('${chamado.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </td>
  `;
  tbody.appendChild(row);
}

async function atualizarStatus(id, novoStatus) {
  try {
    const { error } = await _supabase
      .from("chamados")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) throw error;
    carregarChamados();
  } catch (erro) {
    alert("Erro ao atualizar status: " + erro.message);
  }
}

async function editarChamado(id, nomeAtual, cpfAtual, obsAtual) {
  const novoNome = prompt("Editar Nome:", nomeAtual);
  if (novoNome === null) return;

  const novoCpf = prompt("Editar CPF:", cpfAtual);
  if (novoCpf === null) return;

  const novaObs = prompt("Editar Observação:", obsAtual);
  if (novaObs === null) return;

  try {
    const { error } = await _supabase
      .from("chamados")
      .update({ nome: novoNome, cpf: novoCpf, observacao: novaObs })
      .eq("id", id);

    if (error) throw error;
    alert("Dados atualizados com sucesso!");
    carregarChamados();
  } catch (erro) {
    console.error(erro);
    alert("Erro ao editar: " + erro.message);
  }
}

async function excluirChamado(id) {
  const confirmacao = confirm("Tem certeza que deseja excluir este chamado permanentemente?");
  if (!confirmacao) return;

  try {
    const { error } = await _supabase.from("chamados").delete().eq("id", id);
    if (error) throw error;
    alert("Chamado excluído com sucesso.");
    carregarChamados();
  } catch (erro) {
    console.error(erro);
    alert("Erro ao excluir: " + erro.message);
  }
}

window.onload = carregarChamados;