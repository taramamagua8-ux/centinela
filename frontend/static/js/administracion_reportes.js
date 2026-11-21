const acceso = document.getElementById('acceso-admin');
const panel = document.getElementById('panel-admin');
const editor = document.getElementById('actualizar-reporte');
const selector = document.getElementById('seleccionar-reporte');
const estado = document.getElementById('estado-admin');
const riesgo = document.getElementById('riesgo-admin');
const respuesta = document.getElementById('respuesta-admin');
const resumen = document.getElementById('resumen-admin');
const aviso = document.getElementById('aviso-admin');
const publicar = document.getElementById('publicar-respuesta');
let token;
let reportes = [];

async function enviar(path, method = 'GET', datos) {
    const headers = {};
    if (token) headers.Authorization = 'Bearer ' + token;
    if (datos) headers['Content-Type'] = 'application/json';
    const resultado = await fetch('/api' + path, {method, headers, body: JSON.stringify(datos)});
    const contenido = await resultado.json().catch(() => ({}));
    if (!resultado.ok) throw new Error(contenido.error || 'No se pudo completar la operación.');
    return contenido;
}

function mostrarReporte() {
    const reporte = reportes.find(item => String(item.id_reporte) === selector.value);
    editor.hidden = !reporte;
    if (!reporte) return;
    estado.value = reporte.id_estado ?? estado.options[0].value;
    riesgo.value = reporte.nivel_riesgo;
    respuesta.value = reporte.respuesta_institucion || '';
    resumen.textContent = reporte.detalle?.descripcion || reporte.descripcion;
}

acceso.addEventListener('submit', async evento => {
    evento.preventDefault();
    const boton = acceso.querySelector('button');
    boton.disabled = true;
    aviso.textContent = '';
    try {
        const sesion = await enviar('/auth/admin', 'POST', Object.fromEntries(new FormData(acceso)));
        token = sesion.token;
        const [bandeja, catalogo] = await Promise.all([enviar('/reportes'), enviar('/estados-reporte')]);
        reportes = bandeja.reportes;
        selector.replaceChildren(...reportes.map(reporte => new Option(reporte.folio, reporte.id_reporte)));
        estado.replaceChildren(...catalogo.estados.map(item => new Option(item.nombre, item.id_estado)));
        mostrarReporte();
        acceso.reset();
        acceso.hidden = true;
        panel.hidden = false;
        if (!reportes.length) aviso.textContent = 'Aún no hay reportes.';
    } catch (error) {
        aviso.textContent = error.message;
    } finally {
        boton.disabled = false;
    }
});

selector.addEventListener('change', () => {
    aviso.textContent = '';
    mostrarReporte();
});

editor.addEventListener('submit', async evento => {
    evento.preventDefault();
    publicar.disabled = true;
    selector.disabled = true;
    const reporte = reportes.find(item => String(item.id_reporte) === selector.value);
    const datos = {
        id_estado: Number(estado.value),
        nivel_riesgo: riesgo.value,
        respuesta_institucion: respuesta.value.trim() || null
    };
    try {
        await enviar('/reportes/' + reporte.id_reporte, 'PATCH', datos);
        Object.assign(reporte, datos);
        aviso.textContent = 'Seguimiento actualizado.';
    } catch (error) {
        aviso.textContent = error.message;
    } finally {
        selector.disabled = false;
        publicar.disabled = false;
    }
});

document.getElementById('salir-admin').addEventListener('click', async () => {
    try { await enviar('/auth/logout', 'POST'); }
    catch (error) { aviso.textContent = error.message; return; }
    token = null;
    reportes = [];
    resumen.textContent = '';
    editor.reset();
    selector.replaceChildren();
    panel.hidden = true;
    acceso.hidden = false;
    aviso.textContent = 'Sesión cerrada.';
});
