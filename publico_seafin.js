// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://gheomtxpsigcrbdfnybo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZW9tdHhwc2lnY3JiZGZueWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc0NDcsImV4cCI6MjA4NDg0MzQ0N30.JU2AezTf0fbzA1SX5fC3Stokm4B1cYuliwtYE224iw8';

const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let abaAtual = 'bilhetagem';

// Inicializa
window.onload = () => {
    carregarFiltros();
};

// 1. Mudar Aba
function mudarAba(tipo) {
    abaAtual = tipo;

    // Atualiza classes visuais
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    // Reseta tela
    document.getElementById('resultadoArea').classList.add('hidden');
    document.getElementById('msgVazia').classList.remove('hidden');

    // Recarrega o select com os processos da nova aba
    carregarFiltros();
}

// 2. Carregar Opções do Select (Filtro)
async function carregarFiltros() {
    const select = document.getElementById('filtroProtocolo');
    select.innerHTML = '<option value="">Carregando...</option>';

    // Busca todos os registros do tipo selecionado
    const { data, error } = await _supabase
        .from('seafin_lancamentos')
        .select('identificador, vigencia')
        .eq('tipo_contrato', abaAtual);

    if (error) {
        console.error(error);
        select.innerHTML = '<option value="">Erro ao buscar dados</option>';
        return;
    }

    // Filtra duplicatas (pois várias escolas têm o mesmo protocolo)
    const processosUnicos = new Map();
    data.forEach(item => {
        if (item.identificador && !processosUnicos.has(item.identificador)) {
            processosUnicos.set(item.identificador, item.vigencia);
        }
    });

    // Preenche o Select
    select.innerHTML = '<option value="">-- Selecione para consultar --</option>';

    if (processosUnicos.size === 0) {
        select.innerHTML = '<option value="">Nenhum processo encontrado</option>';
        return;
    }

    processosUnicos.forEach((vigencia, identificador) => {
        const option = document.createElement('option');
        option.value = identificador;
        // Mostra "Protocolo (Vigência)"
        option.text = vigencia ? `${identificador} (Vig: ${vigencia})` : identificador;
        select.appendChild(option);
    });
}

// 3. Carregar Dados do Processo Escolhido
async function carregarDados() {
    const protocolo = document.getElementById('filtroProtocolo').value;
    const areaResultado = document.getElementById('resultadoArea');
    const msgVazia = document.getElementById('msgVazia');
    const tbody = document.getElementById('listaEscolas');
    const totalEl = document.getElementById('totalNumero');

    if (!protocolo) {
        areaResultado.classList.add('hidden');
        msgVazia.classList.remove('hidden');
        return;
    }

    // Mostra carregando
    msgVazia.classList.add('hidden');
    areaResultado.classList.remove('hidden');
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px;">Carregando dados...</td></tr>';

    // Busca escolas e quantidades
    const { data, error } = await _supabase
        .from('seafin_lancamentos')
        .select('*')
        .eq('tipo_contrato', abaAtual)
        .eq('identificador', protocolo);

    if (error) {
        alert('Erro ao carregar detalhes.');
        return;
    }

    // Processa os dados
    let somaTotal = 0;
    tbody.innerHTML = '';

    // Ordena por nome da escola
    data.sort((a, b) => a.nome_escola.localeCompare(b.nome_escola));

    data.forEach(item => {
        somaTotal += item.qtd_alunos;
        tbody.innerHTML += `
            <tr>
                <td>${item.nome_escola}</td>
                <td class="text-right"><strong>${item.qtd_alunos}</strong></td>
            </tr>
        `;
    });

    totalEl.innerText = somaTotal.toLocaleString('pt-BR');
}