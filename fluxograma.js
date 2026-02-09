function voltar() {
    window.location.href = 'index.html';
}

function imprimirFluxo() {
    window.print();
}

document.addEventListener('keydown', function (event) {
    if (event.key === "Escape") {
        voltar();
    }
});