const SUPABASE_URL = 'https://gheomtxpsigcrbdfnybo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZW9tdHhwc2lnY3JiZGZueWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc0NDcsImV4cCI6MjA4NDg0MzQ0N30.JU2AezTf0fbzA1SX5fC3Stokm4B1cYuliwtYE224iw8';
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
window.onload = async function () {
    const { data, error } = await _supabase
        .from('indicadores')
        .select('*');

    if (error) console.error(error);
    if (data) {
        data.forEach(item => {
            const tipo = item.tipo === 'federal' ? 'fed' : 'pau';
            document.getElementById(`${tipo}-nao-iniciada`).value = item.nao_iniciada;
            document.getElementById(`${tipo}-revisao`).value = item.revisao;
            document.getElementById(`${tipo}-analise`).value = item.analise;
            document.getElementById(`${tipo}-seduc`).value = item.seduc;
            document.getElementById(`${tipo}-aprovada`).value = item.aprovada;
            calcularTotal(tipo);
        });
    }
}

function calcularTotal(tipo) {
    const ids = [`${tipo}-nao-iniciada`, `${tipo}-revisao`, `${tipo}-analise`, `${tipo}-seduc`, `${tipo}-aprovada`];
    let total = 0;
    ids.forEach(id => total += Number(document.getElementById(id).value) || 0);
    document.getElementById(`${tipo}-total`).innerText = total;
}

async function salvarDados(event) {
    event.preventDefault();
    const btn = document.querySelector('.btn-save');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    const fedData = {
        tipo: 'federal',
        nao_iniciada: document.getElementById('fed-nao-iniciada').value,
        revisao: document.getElementById('fed-revisao').value,
        analise: document.getElementById('fed-analise').value,
        seduc: document.getElementById('fed-seduc').value,
        aprovada: document.getElementById('fed-aprovada').value
    };

    const pauData = {
        tipo: 'paulista',
        nao_iniciada: document.getElementById('pau-nao-iniciada').value,
        revisao: document.getElementById('pau-revisao').value,
        analise: document.getElementById('pau-analise').value,
        seduc: document.getElementById('pau-seduc').value,
        aprovada: document.getElementById('pau-aprovada').value
    };

    const { error } = await _supabase
        .from('indicadores')
        .upsert([fedData, pauData], { onConflict: 'tipo' });

    if (error) {
        alert('Erro ao salvar: ' + error.message);
    } else {
        const agora = new Date();
        document.getElementById('data-update').innerText = agora.toLocaleString();
        alert('Dados salvos na nuvem com sucesso!');
    }

    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Publicar Gráficos';
}