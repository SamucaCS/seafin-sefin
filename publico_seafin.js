const SUPABASE_URL = "https://gheomtxpsigcrbdfnybo.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZW9tdHhwc2lnY3JiZGZueWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc0NDcsImV4cCI6MjA4NDg0MzQ0N30.JU2AezTf0fbzA1SX5fC3Stokm4B1cYuliwtYE224iw8";

const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let abaAtual = "bilhetagem";

window.onload = () => {
  carregarFiltros();
};

function mudarAba(tipo) {
  abaAtual = tipo;
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));

  if (event && event.target) {
    event.target.classList.add("active");
  } else {
    const btn = document.querySelector(`button[onclick="mudarAba('${tipo}')"]`);
    if (btn) btn.classList.add("active");
  }

  document.getElementById("resultadoArea").classList.add("hidden");
  document.getElementById("msgVazia").classList.remove("hidden");

  carregarFiltros();
}

async function carregarFiltros() {
  const select = document.getElementById("filtroProtocolo");
  select.innerHTML = '<option value="">Carregando..</option>';

  const { data, error } = await _supabase
    .from("seafin_lancamentos")
    .select("identificador, vigencia")
    .eq("tipo_contrato", abaAtual);

  if (error) {
    console.error(error);
    select.innerHTML = '<option value="">Erro ao buscar dados</option>';
    return;
  }

  const processosUnicos = new Map();

  data.forEach((item) => {
    let idKey = item.identificador;
    let vigenciaShow = item.vigencia;

    if ((!idKey || idKey.trim() === "") && abaAtual === "pae") {
      idKey = "PAE_GERAL";
    }

    if (idKey && !processosUnicos.has(idKey)) {
      processosUnicos.set(idKey, vigenciaShow);
    }
  });

  select.innerHTML = '<option value="">-- Selecione para consultar --</option>';

  if (processosUnicos.size === 0) {
    select.innerHTML = '<option value="">Nenhum processo encontrado</option>';
    return;
  }

  processosUnicos.forEach((vigencia, identificador) => {
    const option = document.createElement("option");

    if (identificador === "PAE_GERAL") {
      option.value = "PAE_GERAL";
      option.text = "PAE - DADOS GERAIS / OUTROS";
    } else {
      option.value = identificador;
      option.text = vigencia
        ? `${identificador} (Vig: ${vigencia})`
        : identificador;
    }

    select.appendChild(option);
  });
}

async function carregarDados() {
  const protocolo = document.getElementById("filtroProtocolo").value;
  const areaResultado = document.getElementById("resultadoArea");
  const msgVazia = document.getElementById("msgVazia");
  const tbody = document.getElementById("listaEscolas");
  const totalEl = document.getElementById("totalNumero");

  if (!protocolo) {
    areaResultado.classList.add("hidden");
    msgVazia.classList.remove("hidden");
    return;
  }

  msgVazia.classList.add("hidden");
  areaResultado.classList.remove("hidden");
  tbody.innerHTML =
    '<tr><td colspan="2" style="text-align:center; padding:20px;">Carregando dados...</td></tr>';

  let query = _supabase
    .from("seafin_lancamentos")
    .select("*")
    .eq("tipo_contrato", abaAtual);

  if (protocolo === "PAE_GERAL") {
    query = query.or('identificador.is.null,identificador.eq.""');
  } else {
    query = query.eq("identificador", protocolo);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    alert("Erro ao carregar detalhes.");
    return;
  }

  let somaTotal = 0;
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="2" style="text-align:center; padding:20px;">Nenhum registro encontrado.</td></tr>';
    totalEl.innerText = "0";
    return;
  }

  data.sort((a, b) => a.nome_escola.localeCompare(b.nome_escola));

  data.forEach((item) => {
    somaTotal += item.qtd_alunos;
    tbody.innerHTML += `
            <tr>
                <td>${item.nome_escola}</td>
                <td class="text-right"><strong>${item.qtd_alunos}</strong></td>
            </tr>
        `;
  });

  totalEl.innerText = somaTotal.toLocaleString("pt-BR");
}
