const SUPABASE_URL = "https://gheomtxpsigcrbdfnybo.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZW9tdHhwc2lnY3JiZGZueWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc0NDcsImV4cCI6MjA4NDg0MzQ0N30.JU2AezTf0fbzA1SX5fC3Stokm4B1cYuliwtYE224iw8";
const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
async function carregarChamados() {
  const tbody = document.getElementById("lista-corpo");
  const loading = document.getElementById("loading");
  tbody.innerHTML = "";
  loading.style.display = "block";

  try {
    const { data, error } = await _supabase
      .from("chamados")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    loading.style.display = "none";

    if (data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" style="text-align:center">Nenhum chamado encontrado.</td></tr>';
      return;
    }

    data.forEach((chamado) => {
      renderizarLinha(chamado, tbody);
    });
  } catch (erro) {
    console.error(erro);
    loading.innerText = "Erro ao carregar dados.";
  }
}

function renderizarLinha(chamado, tbody) {
  const dataFormatada = chamado.created_at
    ? new Date(chamado.created_at).toLocaleDateString("pt-BR")
    : "-";

  let servicoHtml = `<strong>${chamado.tipo_servico}</strong>`;

  if (chamado.detalhe_solicitacao) {
    servicoHtml += `<br><span style="color:#555; font-size:13px;">• ${chamado.detalhe_solicitacao}</span>`;
  }

  if (chamado.horario_agendamento) {
    servicoHtml += `<br><small style="color:#e67e22; font-weight:bold"><i class="fa-regular fa-clock"></i> ${chamado.horario_agendamento}</small>`;
  }

  let docsHtml = "";
  if (chamado.arquivo_url)
    docsHtml += `<a href="${chamado.arquivo_url}" target="_blank" class="btn-doc">Doc 1</a> `;
  if (chamado.arquivo_extra_url)
    docsHtml += `<a href="${chamado.arquivo_extra_url}" target="_blank" class="btn-doc">Doc 2</a>`;
  if (!docsHtml)
    docsHtml = '<span style="color:#ccc; font-size:12px">Sem anexo</span>';
  const statusClass = `status-${(chamado.status || "pendente").toLowerCase().replace(" ", "-")}`;

  const emailHtml = chamado.email
    ? `<a href="mailto:${chamado.email}" style="color:#2980b9; text-decoration:none;">${chamado.email}</a>`
    : '<span style="color:#999">-</span>';
  const row = `
        <tr>
            <td><strong>#${chamado.protocolo}</strong></td>
            <td>${dataFormatada}</td>
            <td>
                <strong>${chamado.nome}</strong><br>
                <small style="color:#777">${chamado.cpf}</small>
            </td>
            <td>${emailHtml}</td>
            <td>${servicoHtml}</td>
            <td>${docsHtml}</td>
            <td>
                <select onchange="atualizarStatus('${chamado.id}', this.value)" class="select-status ${statusClass}">
                    <option value="Pendente" ${chamado.status === "Pendente" ? "selected" : ""}>Pendente</option>
                    <option value="Em Andamento" ${chamado.status === "Em Andamento" ? "selected" : ""}>Em Andamento</option>
                    <option value="Concluido" ${chamado.status === "Concluido" ? "selected" : ""}>Concluído</option>
                    <option value="Cancelado" ${chamado.status === "Cancelado" ? "selected" : ""}>Cancelado</option>
                </select>
            </td>
            <td>
                <button onclick="excluirChamado('${chamado.id}')" class="btn-delete" title="Excluir Chamado">
                    🗑️
                </button>
            </td>
        </tr>
    `;
  tbody.innerHTML += row;
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
    alert("Erro ao atualizar: " + erro.message);
  }
}

async function excluirChamado(id) {
  const confirmacao = confirm(
    "Tem certeza que deseja excluir este chamado permanentemente?",
  );

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
