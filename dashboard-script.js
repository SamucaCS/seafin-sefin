const SUPABASE_URL = 'https://gheomtxpsigcrbdfnybo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZW9tdHhwc2lnY3JiZGZueWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc0NDcsImV4cCI6MjA4NDg0MzQ0N30.JU2AezTf0fbzA1SX5fC3Stokm4B1cYuliwtYE224iw8';
const { createClient } = window.supabase || supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const cores = {
    verde: '#27ae60',
    vermelho: '#e74c3c',
    amarelo: '#f1c40f',
    azulAgua: '#00ced1',
    azulEscuro: '#2980b9'
};
let charts = {};

async function carregarDados() {
    const { data, error } = await _supabase
        .from('indicadores')
        .select('*');

    if (error) {
        console.error('Erro Supabase:', error);
        return;
    }

    const fed = data.find(d => d.tipo === 'federal') || {};
    const pau = data.find(d => d.tipo === 'paulista') || {};
    const arrayFed = [fed.nao_iniciada, fed.revisao, fed.analise, fed.seduc, fed.aprovada];
    const arrayPau = [pau.nao_iniciada, pau.revisao, pau.analise, pau.seduc, pau.aprovada];

    atualizarNumeros('fed', fed);
    atualizarNumeros('pau', pau);

    renderizarGraficos('chartBarFed', 'chartPieFed', arrayFed);
    renderizarGraficos('chartBarPau', 'chartPiePau', arrayPau);
}

function atualizarNumeros(tipo, dados) {
    const safeGet = (val) => val || 0;

    document.getElementById(`num-${tipo}-ni`).innerText = safeGet(dados.nao_iniciada);
    document.getElementById(`num-${tipo}-rev`).innerText = safeGet(dados.revisao);
    document.getElementById(`num-${tipo}-ana`).innerText = safeGet(dados.analise);
    document.getElementById(`num-${tipo}-sed`).innerText = safeGet(dados.seduc);
    document.getElementById(`num-${tipo}-apr`).innerText = safeGet(dados.aprovada);

    const totalReal = safeGet(dados.nao_iniciada) + safeGet(dados.revisao) + safeGet(dados.analise) + safeGet(dados.seduc) + safeGet(dados.aprovada);
    document.getElementById(`total-${tipo}`).innerText = totalReal;
}

function renderizarGraficos(idBar, idPie, dados) {
    const labels = ['Não Iniciada', 'Em Revisão', 'Em Análise', 'Aguard. Seduc', 'Aprovada'];
    const backgroundColors = [cores.verde, cores.vermelho, cores.amarelo, cores.azulAgua, cores.azulEscuro];
    const ctxBar = document.getElementById(idBar);
    if (ctxBar) {
        if (charts[idBar]) charts[idBar].destroy();

        charts[idBar] = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Processos',
                    data: dados,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    const ctxPie = document.getElementById(idPie);
    if (ctxPie) {
        if (charts[idPie]) charts[idPie].destroy();

        charts[idPie] = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: dados,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

window.onload = carregarDados;