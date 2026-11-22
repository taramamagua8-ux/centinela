const formularioReporte = document.getElementById('formularioReporte');
const avisoSeleccion = document.getElementById('aviso-seleccion-reporte');

formularioReporte.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const opciones = Object.fromEntries(new FormData(formularioReporte));
    const continuar = formularioReporte.querySelector('button[type="submit"]');
    sessionStorage.setItem('centinela_flujo', JSON.stringify(opciones));
    sessionStorage.removeItem('centinela_regreso');
    avisoSeleccion.textContent = '';

    if (opciones.modalidad === 'anonima') {
        window.location.assign('comencemos_reporte.html');
        return;
    }

    continuar.disabled = true;
    try {
        const token = sessionStorage.getItem('centinela_token');
        if (token) {
            const sesion = await fetch('/api/auth/sesion', {headers: {Authorization: 'Bearer ' + token}});
            if (sesion.ok) {
                window.location.assign('comencemos_reporte.html');
                return;
            }
            if (sesion.status !== 401) throw new Error('No pudimos verificar tu sesión. Inténtalo de nuevo.');
            sessionStorage.removeItem('centinela_token');
            sessionStorage.removeItem('centinela_usuario');
        }
        sessionStorage.setItem('centinela_regreso', 'comencemos_reporte.html');
        window.location.assign('registro.html');
    } catch {
        avisoSeleccion.textContent = 'No pudimos verificar tu sesión. Inténtalo de nuevo.';
    } finally {
        continuar.disabled = false;
    }
});
