const API_BASE = window.CENTINELA_API || '/api';

async function cargarTiposViolencia() {
    const selector = document.getElementById('tipoViolencia');
    if (!selector) return;
    try {
        const respuesta = await fetch(API_BASE + '/tipos-violencia');
        if (!respuesta.ok) throw new Error('No se pudieron cargar los tipos.');
        const datos = await respuesta.json();
        selector.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        datos.tipos.forEach((tipo) => {
            const opcion = document.createElement('option');
            opcion.value = tipo.id_tipo_violencia;
            opcion.textContent = tipo.nombre;
            selector.appendChild(opcion);
        });
    } catch (error) {
        console.warn('Se conservaron las opciones locales:', error.message);
    }
}

function formToObject(form) {
    const result = {};
    new FormData(form).forEach((value, key) => {
        if (typeof value === 'string' && value.trim() !== '') result[key] = value;
    });
    return result;
}

async function enviarFormularioInicial(evento) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const datos = formToObject(form);
    datos.es_anonimo = true;
    datos.tipos_violencia = datos.tipoViolencia ? [Number(datos.tipoViolencia)] : [];
    datos.detalle = {
        tipoViolencia: datos.tipoViolencia,
        fecha: datos.fecha,
        lugar: datos.lugar,
        ayudaInmediata: datos.ayudaInmediata,
        haOcurrido: datos.haOcurrido,
        descripcion: datos.descripcion
    };
    datos.fecha_hecho = datos.fecha || null;

    const respuesta = await fetch(API_BASE + '/reportes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datos)
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo crear el reporte.');

    sessionStorage.setItem('reporte_activo', JSON.stringify(resultado.reporte));
    window.location.href = form.getAttribute('action') + '?reporte_id=' + resultado.reporte.id_reporte;
}

async function finalizarReporte(evento) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const reporte = JSON.parse(sessionStorage.getItem('reporte_activo') || 'null');

    if (!reporte) {
        alert('No se encontró el reporte activo.');
        return;
    }

    const archivo = document.getElementById('archivoEvidencia');
    if (archivo && archivo.files.length > 0) {
        const datosArchivo = new FormData();
        datosArchivo.append('archivo', archivo.files[0]);
        const respuestaArchivo = await fetch(API_BASE + '/reportes/' + reporte.id_reporte + '/evidencias', {
            method: 'POST',
            body: datosArchivo
        });
        if (!respuestaArchivo.ok) {
            const errorArchivo = await respuestaArchivo.json();
            throw new Error(errorArchivo.error || 'No se pudo guardar la evidencia.');
        }
    }

    sessionStorage.removeItem('reporte_activo');
    window.location.href = 'seguimiento.html?folio=' + encodeURIComponent(reporte.folio);
}

document.addEventListener('DOMContentLoaded', () => {
    cargarTiposViolencia();
    const form = document.getElementById('reportForm');
    if (!form) return;

    form.addEventListener('submit', async (evento) => {
        try {
            if (document.body.contains(document.getElementById('tipoViolencia'))) {
                await enviarFormularioInicial(evento);
            } else {
                await finalizarReporte(evento);
            }
        } catch (error) {
            evento.preventDefault();
            alert(error.message);
        }
    });
});

