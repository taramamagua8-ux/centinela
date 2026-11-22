const flujo = JSON.parse(sessionStorage.getItem('centinela_flujo') || 'null');
const formulario = document.getElementById('inicio-reporte');

if (!flujo) {
    window.location.replace('formulario_reporte.html');
} else if (flujo.modalidad === 'registrada' && !sessionStorage.getItem('centinela_token')) {
    sessionStorage.setItem('centinela_regreso', 'comencemos_reporte.html');
    window.location.replace('registro.html');
} else {
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        flujo.terminos = true;
        sessionStorage.setItem('centinela_flujo', JSON.stringify(flujo));
        window.location.assign('violentometro.html');
    });
}
