const SUPABASE_URL = 'https://gheomtxpsigcrbdfnybo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZW9tdHhwc2lnY3JiZGZueWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc0NDcsImV4cCI6MjA4NDg0MzQ0N30.JU2AezTf0fbzA1SX5fC3Stokm4B1cYuliwtYE224iw8';

const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const listaEscolas = [
    "ALFREDO ROBERTO",
    "ALICE ROMANOS PROFª",
    "ANDERSON DA SILVA SOARES",
    "ANGELA SUELI P DIAS",
    "ANIS FADUL DOUTOR",
    "ANTONIO BRASILIO MENEZES DA FONSECA PROF",
    "ANTONIO GARCIA VEREADOR",
    "ANTONIO JOSE CAMPOS DE MENEZES PROF",
    "ANTONIO RODRIGUES DE ALMEIDA",
    "ANTONIO VALDEMAR GALO VEREADOR",
    "BATISTA RENZI",
    "BENEDITA DE CAMPOS MARCOLONGO PROFª",
    "BRASILIO MACHADO NETO COMENDADOR",
    "CARLINDO REIS",
    "CARLOS MOLTENI PROF",
    "CHOJIRO SEGAWA",
    "DAVID JORGE CURI PROF",
    "EDIR DO COUTO ROSA",
    "ELIANE APARECIDA D DA SILVA",
    "EUCLIDES IGESCA",
    "GERALDO JUSTINIANO DE REZENDE SILVA PROF",
    "GILBERTO DE CARVALHO PROF",
    "GIOVANNI BATTISTA RAFFO PROF DOUTOR",
    "HELENA ZERRENNER",
    "IIJIMA",
    "IGNES CORREA ALLEN",
    "JACQUES YVES COUSTEAU COMANDANTE",
    "JANDYRA COUTINHO PROFª",
    "JARDIM SAO PAULO II",
    "Jose Eduardo Viera Raduan",
    "JOSE BENEDITO LEITE BARTHOLOMEI PROF",
    "JOSE CAMILO DE ANDRADE",
    "JOSE PAPAIZ PROF",
    "JOVIANO SATLER DE LIMA PROF",
    "JUSSARA FEITOSA DOMSCHKE PROFª",
    "Justino Marcondes Rangel",
    "Landia dos Santos Batista",
    "LEDA FERNANDES LOPES PROFª",
    "LUCY FRANCO KOWALSKI PROFª",
    "LUIZ BIANCONI",
    "LUIZA HIDAKA PROFª",
    "MANUEL DOS SANTOS PAIVA",
    "MARIA ELISA DE AZEVEDO CINTRA PROFª",
    "Mario Manoel Dantas de Aquino",
    "MARTHA CALIXTO CAZAGRANDE",
    "MASAITI SEKINE PROF",
    "MORATO DE OLIVEIRA DOUTOR",
    "OLAVO LEONEL FERREIRA PROF",
    "OLZANETTI GOMES PROFESSOR",
    "OSWALDO DE OLIVEIRA LIMA",
    "PARQUE DOURADO II",
    "PAULO AMERICO PAGANUCCI",
    "PAULO KOBAYASHI PROF",
    "RAUL BRASIL PROF EE",
    "RAUL BRASIL PROF",
    "ROBERTO BIANCHI",
    "SEBASTIAO PEREIRA VIDAL",
    "Tacito Zancheta",
    "TOCHICHICO YOCHICAVA PROF",
    "TOKUZO TERAZAKI",
    "YOLANDA BASSI PROFª",
    "ZELIA GATTAI AMADO",
    "ZEIKICHI FUKUOKA"

];

let abaAtual = 'bilhetagem';
let idEmEdicao = null;

window.onload = () => {
    carregarEscolas();
    carregarDadosTabela();
};

function carregarEscolas() {
    const select = document.getElementById('escolaSelect');
    listaEscolas.sort();
    listaEscolas.forEach(escola => {
        const opt = document.createElement('option');
        opt.value = escola;
        opt.innerText = escola;
        select.appendChild(opt);
    });
}

function mudarAba(tipo) {
    abaAtual = tipo;
    cancelarEdicao();

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    const labelId = document.getElementById('label-identificador');
    const grupoVigencia = document.getElementById('grupo-vigencia');

    if (tipo === 'bilhetagem') {
        labelId.innerText = "Protocolo SEI";
        grupoVigencia.style.display = 'flex';
    } else if (tipo === 'emtu') {
        labelId.innerText = "Número do Contrato";
        grupoVigencia.style.display = 'flex';
    } else if (tipo === 'pae') {
        labelId.innerText = "Identificador (Opcional)";
        grupoVigencia.style.display = 'none';
    }
    carregarDadosTabela();
}

async function salvarRegistro() {
    const identificador = document.getElementById('identificador').value;
    const vigencia = document.getElementById('vigencia').value;
    const escola = document.getElementById('escolaSelect').value;
    const qtd = document.getElementById('qtdAlunos').value;

    if (abaAtual !== 'pae' && !identificador) return alert("Preencha o Protocolo/Contrato.");
    if (!escola) return alert("Selecione uma escola.");
    if (!qtd) return alert("Digite a quantidade.");

    const btn = document.getElementById('btnSalvar');
    const textoOriginal = btn.innerHTML;
    btn.innerText = idEmEdicao ? "Atualizando..." : "Salvando...";
    btn.disabled = true;

    try {
        let error;
        if (idEmEdicao) {
            const { error: err } = await _supabase
                .from('seafin_lancamentos')
                .update({
                    nome_escola: escola,
                    qtd_alunos: parseInt(qtd)
                })
                .eq('id', idEmEdicao);
            error = err;
        } else {
            const { error: err } = await _supabase
                .from('seafin_lancamentos')
                .insert({
                    tipo_contrato: abaAtual,
                    identificador: identificador,
                    vigencia: vigencia,
                    nome_escola: escola,
                    qtd_alunos: parseInt(qtd)
                });
            error = err;
        }

        if (error) throw error;

        cancelarEdicao();
        carregarDadosTabela();

    } catch (erro) {
        alert("Erro: " + erro.message);
    } finally {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
}

function prepararEdicao(id, escola, qtd) {
    idEmEdicao = id;
    document.getElementById('escolaSelect').value = escola;
    document.getElementById('qtdAlunos').value = qtd;
    const btn = document.getElementById('btnSalvar');
    btn.innerHTML = '<i class="fa-solid fa-pen"></i> Atualizar Registro';
    btn.style.background = "#2980b9";
    document.getElementById('btnCancelar').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicao() {
    idEmEdicao = null;
    document.getElementById('escolaSelect').value = "";
    document.getElementById('qtdAlunos').value = "";

    const btn = document.getElementById('btnSalvar');
    btn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Escola ao Contrato';
    btn.style.background = "";

    document.getElementById('btnCancelar').style.display = 'none';
}

async function carregarDadosTabela() {
    const identificador = document.getElementById('identificador').value;
    const tbody = document.getElementById('lista-escolas');
    const totalSpan = document.getElementById('totalAlunos');

    let query = _supabase.from('seafin_lancamentos').select('*').eq('tipo_contrato', abaAtual);

    if (identificador) {
        query = query.eq('identificador', identificador);
    }

    const { data, error } = await query;
    if (error) return console.error(error);

    tbody.innerHTML = '';
    let somaTotal = 0;

    data.sort((a, b) => a.nome_escola.localeCompare(b.nome_escola));

    data.forEach(item => {
        somaTotal += item.qtd_alunos;
        tbody.innerHTML += `
            <tr>
                <td>${item.nome_escola}</td>
                <td><strong>${item.qtd_alunos}</strong></td>
                <td>
                    <button onclick="prepararEdicao('${item.id}', '${item.nome_escola}', '${item.qtd_alunos}')" 
                        class="btn-remove" 
                        style="color:#2980b9; background:rgba(41, 128, 185, 0.1); margin-right:5px;">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button onclick="removerItem('${item.id}')" class="btn-remove">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    totalSpan.innerText = somaTotal;
}

async function removerItem(id) {
    if (!confirm("Remover este lançamento?")) return;
    await _supabase.from('seafin_lancamentos').delete().eq('id', id);
    if (id === idEmEdicao) cancelarEdicao();
    carregarDadosTabela();
}

document.getElementById('identificador').addEventListener('change', carregarDadosTabela);
