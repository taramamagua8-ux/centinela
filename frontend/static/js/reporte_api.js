const flujo = JSON.parse(sessionStorage.getItem('centinela_flujo') || 'null');
const form = document.getElementById('reportForm');
const tipo = document.getElementById('tipoViolencia');
const revisar = document.getElementById('revisar-reporte');
const tipoElegido = document.getElementById('tipo-elegido');
const pasoDatos = document.getElementById('paso-datos');
const pasoRevision = document.getElementById('paso-revision');
const ayudaCaptura = document.getElementById('ayuda-captura');
const revision = document.getElementById('revision-reporte');
const enviar = document.getElementById('enviar-reporte');
const aviso = document.getElementById('aviso-reporte');
const evidencia = document.getElementById('archivoEvidencia');
const grupos = Array.from(form.querySelectorAll('.form-group'));
const pagina = location.pathname.split('/').pop();
const rol = pagina === 'ReporteVicAno.html' ? 'victima' : 'testigo';
const anonimo = flujo?.modalidad !== 'registrada';
const claveEnvio = crypto.randomUUID();
const token = sessionStorage.getItem('centinela_token');

function volverASesion() {
    sessionStorage.setItem('centinela_regreso', pagina);
    location.assign('cuenta.html');
}

async function preparar() {
    if (!flujo?.terminos || flujo.rol !== rol) {
        location.replace('formulario_reporte.html');
        return;
    }
    if (!flujo.tipoViolencia) {
        location.replace('violentometro.html');
        return;
    }
    if (!anonimo) {
        if (!token) {
            volverASesion();
            return;
        }
        const sesion = await fetch('/api/auth/sesion', {headers: {Authorization: 'Bearer ' + token}});
        if (sesion.status === 401) {
            sessionStorage.removeItem('centinela_token');
            sessionStorage.removeItem('centinela_usuario');
            volverASesion();
            return;
        }
        if (!sesion.ok) throw new Error('No se pudo cargar tu cuenta.');
        const {usuario} = await sesion.json();
        document.querySelector('.header h1').textContent = rol === 'victima' ? 'Mi reporte (Víctima, registrado)' : 'Mi reporte (Testigo, registrado)';
        document.querySelector('.subtitle').textContent = 'Tu reporte quedará disponible en Mis reportes.';
        document.getElementById('nombre-reportante').value = usuario.nombre;
        document.getElementById('correo-reportante').value = usuario.correo;
        grupos.filter(grupo => grupo.hasAttribute('data-contacto')).forEach(grupo => { grupo.hidden = false; });
    }
    const respuesta = await fetch('/api/tipos-violencia');
    if (!respuesta.ok) throw new Error('No se pudieron cargar los tipos de violencia.');
    const {tipos} = await respuesta.json();
    tipos.forEach(item => tipo.add(new Option(item.nombre, item.id_tipo_violencia)));
    tipo.value = flujo.tipoViolencia;
    if (!tipo.value) {
        location.replace('violentometro.html');
        return;
    }
    document.getElementById('nombre-tipo-elegido').textContent = tipo.selectedOptions[0].textContent;
    tipoElegido.hidden = false;
    revisar.disabled = false;
}

function mostrarRevision() {
    form.hidden = true;
    revision.hidden = false;
    ayudaCaptura.hidden = true;
    pasoDatos.removeAttribute('aria-current');
    pasoRevision.setAttribute('aria-current', 'step');
    const campos = document.getElementById('campos-revision');
    campos.replaceChildren();
    const datos = new FormData(form);
    grupos.filter(grupo => !anonimo || !grupo.hasAttribute('data-contacto')).forEach(grupo => {
        const etiqueta = grupo.querySelector('.form-label').textContent;
        const control = grupo.querySelector('input, select, textarea');
        const fila = document.createElement('div');
        fila.className = 'fila-revision';
        const contenido = document.createElement('div');
        const titulo = document.createElement('strong');
        titulo.textContent = etiqueta;
        const valor = document.createElement('p');
        valor.textContent = (control === tipo ? tipo.selectedOptions[0].textContent :
            control === evidencia ? evidencia.files[0]?.name :
            control.readOnly ? control.value : datos.get(control.name)) || 'Sin respuesta';
        contenido.append(titulo, valor);
        fila.append(contenido);
        if (!control.readOnly) {
            const editar = document.createElement('button');
            editar.type = 'button';
            editar.textContent = 'Editar';
            editar.setAttribute('aria-label', 'Editar ' + etiqueta);
            editar.addEventListener('click', () => {
                grupos.forEach(item => { item.hidden = item !== grupo; });
                tipoElegido.hidden = true;
                revisar.textContent = 'Guardar cambio';
                form.classList.add('editando-campo');
                pasoRevision.removeAttribute('aria-current');
                pasoDatos.setAttribute('aria-current', 'step');
                revision.hidden = true;
                form.hidden = false;
                control.focus();
            });
            fila.append(editar);
        }
        campos.append(fila);
    });
    revision.querySelector('h2').tabIndex = -1;
    revision.querySelector('h2').focus();
}

form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (evidencia.files[0]?.size > 10 * 1024 * 1024) {
        aviso.textContent = 'La evidencia debe pesar como máximo 10 MB.';
        return;
    }
    aviso.textContent = '';
    flujo.tipoViolencia = tipo.value;
    sessionStorage.setItem('centinela_flujo', JSON.stringify(flujo));
    mostrarRevision();
});

enviar.addEventListener('click', async () => {
    enviar.disabled = true;
    aviso.textContent = '';
    const detalle = Object.fromEntries(new FormData(form));
    const ocurrio_en_escuela = detalle.ocurrio_en_escuela === "Sí";
    delete detalle.ocurrio_en_escuela;
    delete detalle.archivo;
    delete detalle.tipoViolencia;
    const datos = new FormData();
    datos.append('reporte', JSON.stringify({
        rol, es_anonimo: anonimo, terminos: true, tipo_violencia: Number(tipo.value),
        clave_envio: claveEnvio, ocurrio_en_escuela, detalle
    }));
    if (evidencia.files[0]) datos.append('archivo', evidencia.files[0]);
    try {
        const respuesta = await fetch('/api/reportes', {
            method: 'POST',
            headers: anonimo ? {} : {Authorization: 'Bearer ' + token},
            body: datos
        });
        const resultado = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo registrar el reporte.');
        sessionStorage.removeItem('centinela_flujo');
        const confirmacion = new URLSearchParams({
            folio: resultado.reporte.folio,
            modalidad: anonimo ? 'anonima' : 'registrada'
        });
        location.assign('confirmacion_reporte.html#' + confirmacion);
    } catch (error) {
        aviso.textContent = error.message;
        enviar.disabled = false;
    }
});
preparar().catch(error => { aviso.textContent = error.message; });
