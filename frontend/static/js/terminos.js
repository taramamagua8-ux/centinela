const flujo = JSON.parse(sessionStorage.getItem('centinela_flujo') || 'null');
const aceptar = document.getElementById('aceptar-terminos');
if (flujo) {
    aceptar.hidden = false;
    document.getElementById('volver-terminos').hidden = true;
    aceptar.addEventListener('submit', (evento) => {
        evento.preventDefault();
        flujo.terminos = true;
        sessionStorage.setItem('centinela_flujo', JSON.stringify(flujo));
        window.location.assign('violentometro.html');
    });
}
