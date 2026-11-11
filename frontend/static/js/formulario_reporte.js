document.getElementById('formularioReporte').addEventListener('submit', function (evento) {
    evento.preventDefault();

    const tipoReporte = document.getElementById('tipo_reporte').value;

    sessionStorage.setItem('tipo_reporte', tipoReporte);

    if (tipoReporte === 'testigo_anonimo') {
        window.location.href = 'comencemos_reporte.html';
        return;
    }

    if (tipoReporte === 'victima_anonima') {
        window.location.href = 'ReporteVicAno.html';
        return;
    }

    alert('Esta modalidad todavía no está disponible. Por ahora, selecciona Anónimo y Testigo.');
});
