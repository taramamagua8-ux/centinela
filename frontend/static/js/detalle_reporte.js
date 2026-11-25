const aviso = document.getElementById('aviso-seguimiento');
const resumen = document.getElementById('detalle-seguimiento');
const respuestaInstitucion = document.getElementById('respuesta-institucion');
const folio = location.hash.slice(1) || new URLSearchParams(location.search).get('folio');
const token = sessionStorage.getItem('centinela_token');

function mostrarDato(etiqueta, valor, anchoCompleto = false) {
    if (!valor) return;
    const fila = document.createElement('div');
    fila.classList.toggle('dato-reporte-ancho', anchoCompleto);
    const termino = document.createElement('dt');
    termino.textContent = etiqueta;
    const dato = document.createElement('dd');
    dato.textContent = valor;
    fila.append(termino, dato);
    resumen.append(fila);
}

function parrafo(texto, clase) {
    const elemento = document.createElement('p');
    elemento.textContent = texto;
    if (clase) elemento.className = clase;
    return elemento;
}

function mostrarOrientacion(reporte) {
    if (reporte.respuesta_institucion) {
        respuestaInstitucion.append(parrafo(reporte.respuesta_institucion, 'respuesta-publicada-reporte'));
        document.getElementById('directorio-reporte').hidden = true;
        return;
    }

    respuestaInstitucion.append(parrafo('Pendiente de respuesta institucional.', 'espera-institucional-reporte'));
    for (const tipo of reporte.tipos || []) {
        const recurso = document.createElement('article');
        recurso.className = 'recurso-institucional-reporte';
        const titulo = document.createElement('h3');
        titulo.textContent = tipo.nombre;
        recurso.append(titulo);
        if (tipo.orientacion) recurso.append(parrafo(tipo.orientacion));
        const contacto = [tipo.institucion, tipo.telefono].filter(Boolean).join(' · ');
        if (contacto) recurso.append(parrafo(contacto, 'contacto-institucional-reporte'));
        respuestaInstitucion.append(recurso);
    }
}

async function consultar() {
    if (!folio) throw new Error('Ingresa un folio para consultar tu reporte.');
    const headers = {'Content-Type': 'application/json'};
    if (token) headers.Authorization = 'Bearer ' + token;
    const respuesta = await fetch('/api/reportes/consulta', {
        method: 'POST', headers, body: JSON.stringify({folio: decodeURIComponent(folio)})
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.error || 'No se pudo consultar el reporte.');
    const reporte = datos.reporte;

    document.getElementById('folio-reporte').textContent = reporte.folio;
    const fechaRegistro = document.getElementById('fecha-registro-reporte');
    fechaRegistro.hidden = !reporte.fecha_registro;
    if (reporte.fecha_registro) fechaRegistro.textContent = 'Registrado el ' + reporte.fecha_registro;
    document.getElementById('estatus-reporte').textContent = reporte.estado || 'Recibido';
    const riesgo = document.getElementById('riesgo-reporte');
    riesgo.textContent = reporte.nivel_riesgo || 'Por evaluar';
    riesgo.parentElement.dataset.riesgo = riesgo.textContent.toLowerCase();

    mostrarDato('Tipo de violencia', reporte.tipos?.map(tipo => tipo.nombre).join(', '));
    mostrarDato('Fecha del incidente', reporte.detalle?.fecha);
    mostrarDato('Hora aproximada', reporte.detalle?.hora);
    if (reporte.ocurrio_en_escuela != null) mostrarDato('Ocurrió en una escuela', reporte.ocurrio_en_escuela ? 'Sí' : 'No');
    mostrarDato('Hubo testigos', reporte.detalle?.huboTestigos);
    mostrarDato('Lugar', reporte.detalle?.lugar);
    mostrarDato('Ayuda inmediata', reporte.detalle?.ayudaInmediata);
    mostrarDato('¿Había ocurrido anteriormente?', reporte.detalle?.haOcurrido);
    mostrarDato('Descripción', reporte.detalle?.descripcion, true);
    document.getElementById('panel-detalle-reporte').hidden = !resumen.childElementCount;

    mostrarOrientacion(reporte);
    for (const item of reporte.instituciones_canalizadas || []) {
        respuestaInstitucion.append(parrafo(
            [item.nombre, item.telefono].filter(Boolean).join(' · '),
            'contacto-institucional-reporte'
        ));
    }
    const history = document.getElementById('historial-folio');
    if (reporte.historial?.length) {
        history.hidden = false;
        const list = history.querySelector('ol');
        for (const event of reporte.historial) {
            const row = document.createElement('li');
            row.textContent = [event.estado, new Date(event.fecha_actualizacion).toLocaleString('es-MX'), event.observaciones]
                .filter(Boolean).join(' · ');
            list.append(row);
        }
    }
    if (reporte.comprobante) {
        const closure = document.getElementById('comprobante-cierre');
        closure.hidden = false;
        closure.addEventListener('click', () => {
            const {folio, estado, fecha, codigo} = reporte.comprobante;
            const verification = new URL('/api/comprobantes/' + codigo, location.origin);
            const doc = 'Centinela Digital\nComprobante de conclusión\n' + folio + '\n' +
                estado + '\n' + new Date(fecha).toLocaleString('es-MX') + '\nCódigo de verificación: ' +
                codigo + '\nVerificar en ' + verification.href + '\n';
            const url = URL.createObjectURL(new Blob([doc], {type: 'text/plain;charset=utf-8'}));
            const link = document.createElement('a');
            link.href = url;
            link.download = folio + '-cierre.txt';
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
    }
    const supplemental = document.getElementById('ampliar-reporte');
    if (reporte.puede_ampliar) {
        supplemental.hidden = false;
        supplemental.addEventListener('submit', async event => {
            event.preventDefault();
            const status = document.getElementById('aviso-evaluacion');
            try {
                const detail = new FormData(supplemental).get('detalle');
                event.submitter.disabled = true;
                const response = await fetch('/api/reportes/consulta/ampliacion', {
                    method: 'POST', headers, body: JSON.stringify({folio: reporte.folio, detalle: detail})
                });
                if (!response.ok) throw new Error((await response.json()).error);
                supplemental.reset();
                status.textContent = 'Información adicional enviada.';
            } catch (error) {
                status.textContent = error.message || 'No se pudo enviar la información.';
            } finally {
                event.submitter.disabled = false;
            }
        });
    }
    const feedback = document.getElementById('evaluar-servicio');
    if (reporte.puede_evaluar) {
        feedback.hidden = false;
        feedback.addEventListener('submit', async event => {
            event.preventDefault();
            const status = document.getElementById('aviso-evaluacion');
            const button = event.submitter;
            button.disabled = true;
            try {
                const fields = Object.fromEntries(new FormData(feedback));
                const response = await fetch('/api/reportes/consulta/evaluacion', {
                    method: 'POST', headers, body: JSON.stringify({...fields, folio: reporte.folio, calificacion: Number(fields.calificacion)})
                });
                if (!response.ok) throw new Error((await response.json()).error);
                status.textContent = 'Gracias. Tu evaluación quedó registrada.';
                feedback.hidden = true;
            } catch (error) {
                status.textContent = error.message || 'No se pudo registrar la evaluación.';
            } finally {
                button.disabled = false;
            }
        });
    }
    aviso.hidden = true;
    document.getElementById('contenido-seguimiento').hidden = false;
}

consultar().catch(error => { aviso.textContent = error.message || 'No se pudo consultar el reporte.'; });
