document.getElementById('formularioReporte').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const opciones = Object.fromEntries(new FormData(evento.currentTarget));
    sessionStorage.setItem('centinela_flujo', JSON.stringify(opciones));
    window.location.assign('terminos.html');
});
