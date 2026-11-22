if (new URLSearchParams(window.location.search).get('desde') === 'reporte') {
    const volver = document.getElementById('volver-terminos');
    volver.href = 'comencemos_reporte.html';
    volver.textContent = 'Volver a mi reporte';
}
