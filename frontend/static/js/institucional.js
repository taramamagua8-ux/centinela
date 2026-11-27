const page = document.body.dataset.pagina;
const admin = page === 'acceso_admin' || page === 'administracion_reportes' || page === 'expedientes';
const role = admin ? 'admin' : 'autoridad';
const sessionKey = 'centinela_' + role + '_token';
const loginPage = 'acceso_' + role + '.html';
const panelPage = admin ? 'administracion_reportes.html' : 'casos_autoridad.html';
const byId = id => document.getElementById(id);
const notice = byId('aviso-institucional');

function activityDeadline(task) {
    if (task.vencida) return 'Vencida';
    return task.proxima_a_vencer ? 'Próxima a vencer' : '';
}

function node(tag, text) {
    const result = document.createElement(tag);
    if (text != null) result.textContent = text;
    return result;
}

async function api(path, method = 'GET', body) {
    const headers = {};
    const token = sessionStorage.getItem(sessionKey);
    if (token) headers.Authorization = 'Bearer ' + token;
    if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const response = await fetch('/api' + path, {method, headers, body: body instanceof FormData ? body : JSON.stringify(body)});
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 && byId('cerrar-sesion')) {
            sessionStorage.removeItem(sessionKey);
            location.replace(loginPage);
        }
        throw new Error(data.error || 'No se pudo completar la operación.');
    }
    return data;
}

function handle(control, event, action) {
    control.addEventListener(event, async e => {
        e.preventDefault();
        notice.textContent = '';
        const button = e.submitter || (control.tagName === 'BUTTON' ? control : null);
        if (button) button.disabled = true;
        try {
            await action();
        } catch (error) {
            notice.textContent = error.message;
            notice.scrollIntoView({block: 'nearest'});
        } finally {
            if (button) button.disabled = false;
        }
    });
}

const values = form => Object.fromEntries(new FormData(form));

if (byId('acceso')) {
    const form = byId('acceso');
    handle(form, 'submit', async () => {
        const result = await api('/auth/' + role, 'POST', values(form));
        sessionStorage.setItem(sessionKey, result.token);
        location.replace(panelPage);
    });
}

if (byId('registro-autoridad')) {
    const form = byId('registro-autoridad');
    const type = form.elements.id_tipo_violencia;
    const select = form.elements.tipo_autoridad;
    function updateType() {
        const specialist = select.value === 'especialista';
        byId('campo-tipo-violencia').hidden = !specialist;
        type.required = specialist;
    }
    select.addEventListener('change', updateType);
    updateType();
    api('/tipos-violencia').then(({tipos}) => {
        tipos.forEach(item => type.add(new Option(item.nombre, item.id_tipo_violencia)));
    }).catch(error => { notice.textContent = error.message; });
    handle(form, 'submit', async () => {
        const payload = new FormData(form);
        const response = await api('/auth/autoridades/registro', 'POST', payload);
        form.reset();
        updateType();
        notice.textContent = response.mensaje;
    });
}

if (byId('cerrar-sesion')) {
    if (!sessionStorage.getItem(sessionKey)) location.replace(loginPage);
    handle(byId('cerrar-sesion'), 'click', async () => {
        await api('/auth/logout', 'POST');
        sessionStorage.removeItem(sessionKey);
        location.replace(loginPage);
    });
}

function replaceList(container, list, render, empty) {
    container.replaceChildren(...(list.length ? list.map(render) : [node('p', empty)]));
}

function action(label, callback) {
    const button = node('button', label);
    button.type = 'button';
    handle(button, 'click', callback);
    return button;
}

function appendField(container, label, value) {
    if (!value) return;
    const paragraph = node('p');
    paragraph.append(node('strong', label + ' · '), document.createTextNode(value));
    container.append(paragraph);
}

async function downloadFile(path, filename) {
    const token = sessionStorage.getItem(sessionKey);
    const response = await fetch('/api' + path, {headers: {Authorization: 'Bearer ' + token}});
    if (!response.ok) throw new Error('No se pudo descargar el archivo.');
    saveFile(await response.blob(), filename);
}

function saveFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = node('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showEvidence(container, evidence, path) {
    for (const file of evidence) {
        const row = node('p');
        row.append(action(file.nombre_archivo, () => downloadFile(path + '/' + file.id_evidencia, file.nombre_archivo)));
        if (file.id_evento) row.append(' · Atención ' + file.id_evento);
        container.append(row);
    }
}

function textField(form, name, label, type = 'textarea', required = true) {
    const wrapper = node('label', label);
    const input = node(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') input.type = type;
    input.name = name;
    input.required = required;
    if (type === 'textarea') input.maxLength = 8000;
    wrapper.append(input);
    form.append(wrapper);
    return input;
}

function choiceField(form, name, label, options) {
    const wrapper = node('label', label);
    const select = node('select');
    select.name = name;
    select.required = true;
    select.add(new Option('Selecciona una opción', ''));
    for (const [key, text] of options) select.add(new Option(text, key));
    wrapper.append(select);
    form.append(wrapper);
    return select;
}

function operationForm(container, title, build, callback) {
    const details = node('details');
    details.append(node('summary', title));
    const form = node('form');
    form.className = 'formulario-institucional';
    build(form);
    const submit = node('button', title);
    submit.type = 'submit';
    form.append(submit);
    handle(form, 'submit', () => callback(values(form), form));
    details.append(form);
    container.append(details);
    return form;
}

if (page === 'casos_autoridad' && sessionStorage.getItem(sessionKey)) {
    const form = byId('evaluacion');
    let selected;
    const pending = byId('solo-pendientes');
    const enough = form.elements.informacion_suficiente;
    function showRequest() {
        byId('solicitud-datos').hidden = enough.value !== 'false';
        form.elements.solicitud_datos.required = enough.value === 'false';
    }
    enough.addEventListener('change', showRequest);
    handle(pending, 'change', listCases);
    api('/autoridad/avisos').then(({avisos}) => {
        for (const item of avisos) appendField(byId('avisos-autoridad'), item.folio, item.mensaje);
    }).catch(error => { notice.textContent = error.message; });
    async function listCases() {
        const {casos} = await api('/autoridad/casos');
        replaceList(byId('lista-casos'), casos.filter(item => !pending.checked || ['Recibido', 'En revisión', 'Devuelto con observaciones'].includes(item.estado)), item => {
            const label = item.folio + ' · ' + (item.estado || 'Recibido');
            return action(label, () => openCase(item.id_reporte));
        }, 'No hay casos disponibles para tu perfil.');
    }
    async function openCase(id, showHistory = false) {
        const {caso} = await api('/autoridad/casos/' + id + '/abrir', 'POST');
        selected = id;
        byId('folio-caso').textContent = caso.folio;
        const information = byId('datos-caso');
        information.replaceChildren();
        appendField(information, 'Estado', caso.estado);
        appendField(information, 'Tipos de violencia', caso.tipos.join(', '));
        appendField(information, 'En una escuela', caso.ocurrio_en_escuela == null ? 'Sin dato' : caso.ocurrio_en_escuela ? 'Sí' : 'No');
        const fields = {fecha: 'Fecha', hora: 'Hora', lugar: 'Lugar', ayudaInmediata: 'Ayuda inmediata',
            haOcurrido: 'Había ocurrido antes', descripcion: 'Descripción'};
        Object.entries(fields).forEach(([key, label]) => appendField(information, label, caso.detalle[key]));
        appendField(information, 'Observaciones del administrador', caso.evaluacion?.observaciones);
        appendField(information, 'Folio de canalización', caso.evaluacion?.folio);
        if (caso.detalle.ayudaInmediata === 'SI' || caso.evaluacion?.evaluacion?.riesgo_inmediato) {
            const danger = node('p', 'Riesgo inmediato indicado');
            danger.className = 'bandera-riesgo';
            information.append(danger);
        }
        for (const item of caso.ampliaciones) appendField(information, 'Ampliación del reportante · ' + item.fecha, item.detalle);
        for (const person of caso.personas) appendField(information, person.tipo_participacion,
            [person.nombre, person.descripcion].filter(Boolean).join(' · '));
        showEvidence(information, caso.evidencias, '/autoridad/casos/' + id + '/evidencias');
        const activities = byId('actividades-autoridad');
        activities.replaceChildren();
        const history = node('details');
        history.open = showHistory;
        history.append(node('summary', 'Historial de mis atenciones'));
        for (const item of caso.atenciones) appendField(history, item.fecha, item.detalle);
        if (!caso.atenciones.length) history.append(node('p', 'Todavía no has registrado atenciones para este caso.'));
        activities.append(history);
        if (caso.responsable) {
            operationForm(activities, 'Registrar atención', f => textField(f, 'detalle', 'Acciones realizadas'), async item => {
                await api('/expedientes/' + id + '/acciones', 'POST', {...item, clase: 'atencion'});
                await openCase(id, true);
                notice.textContent = 'Atención registrada.';
            });
            operationForm(activities, 'Programar próxima atención', f => {
                textField(f, 'descripcion', 'Motivo de la cita');
                textField(f, 'vence', 'Fecha', 'date');
            }, async item => {
                await api('/expedientes/' + id + '/actividad', 'POST', {...item, accion: 'crear'});
                await openCase(id);
                notice.textContent = 'Próxima atención programada.';
            });
        }
        for (const task of caso.actividades) {
            const alert = activityDeadline(task);
            if (alert) {
                const warning = node('p', alert + ' · ' + task.vence + ' · ' + task.descripcion);
                warning.className = 'bandera-riesgo';
                activities.append(warning);
            } else {
                appendField(activities, task.vence, task.descripcion + ' · ' + task.estado);
            }
            appendField(activities, 'Resultado', task.resultado);
            if (caso.abierta && task.estado === 'pendiente') operationForm(activities, 'Completar actividad', f => {
                textField(f, 'resultado', 'Resultado de la intervención');
            }, async item => {
                await api('/expedientes/' + id + '/actividad', 'POST', {...item, id_actividad: task.id_actividad, accion: 'completar'});
                await openCase(id);
                notice.textContent = 'Actividad completada.';
            });
        }
        for (const input of form.elements) {
            const value = caso.evaluacion?.[input.name] ?? caso.evaluacion?.evaluacion?.[input.name];
            if (input.type === 'checkbox') input.checked = Boolean(value);
            else if (input.name) input.value = value ?? (input.name === 'prioridad' ? 'Normal' : '');

        }
        showRequest();
        form.hidden = !caso.puede_enviar;
        byId('detalle-caso').hidden = false;
        byId('folio-caso').focus();
        await listCases();
    }
    handle(form, 'submit', async () => {
        const item = values(form);
        item.riesgo_inmediato = form.elements.riesgo_inmediato.checked;
        item.informacion_suficiente = enough.value === 'true';
        await api('/autoridad/casos/' + selected + '/enviar', 'POST', item);
        await openCase(selected);
        notice.textContent = item.informacion_suficiente ? 'Solicitud enviada a canalización.' : 'Evaluación guardada y solicitud de datos publicada.';
    });
    listCases().catch(error => { notice.textContent = error.message; });
}

if (page === 'administracion_reportes' && sessionStorage.getItem(sessionKey)) {
    const adminForm = byId('nuevo-admin');

    async function loadApplications() {
        const {autoridades} = await api('/canalizacion/autoridades');
        replaceList(byId('solicitudes-autoridad'), autoridades, item => {
            const card = node('article');
            card.append(node('h3', item.nombre));
            appendField(card, 'Correo', item.correo);
            appendField(card, 'Institución y cargo', item.institucion + ' · ' + item.cargo);
            appendField(card, 'Perfil', item.violencia || 'Orientador escolar');
            appendField(card, 'Estado', 'En revisión');
            const path = '/canalizacion/autoridades/' + item.id_autoridad;
            const confirmed = node('input');
            confirmed.type = 'checkbox';
            const label = node('label', ' Confirmo que el documento acredita a la autoridad.');
            label.prepend(confirmed);
            if (item.comprobante) {
                card.append(action('Descargar comprobante', () => downloadFile(path + '/comprobante', item.comprobante)), label);
            } else {
                appendField(card, 'Comprobante', 'Pendiente de adjuntar');
            }
            const buttons = node('div');
            buttons.className = 'acciones-institucionales';
            for (const [label, aprobar] of [['Aprobar acceso', true], ['Rechazar acceso', false]]) {
                const decision = action(label, async () => {
                    await api(path, 'PATCH', {aprobar, comprobante_validado: confirmed.checked,
                        version_comprobante: item.fecha_comprobante});
                    await loadApplications();
                    notice.textContent = aprobar ? 'Acceso aprobado.' : 'Acceso rechazado.';
                });
                if (aprobar) {
                    decision.disabled = true;
                    confirmed.addEventListener('change', () => { decision.disabled = !confirmed.checked; });
                }
                buttons.append(decision);
            }
            card.append(buttons);
            return card;
        }, 'No hay solicitudes pendientes.');
    }

    function field(form, name, label) {
        const wrapper = node('label', label);
        const input = node('textarea');
        input.name = name;
        input.required = true;
        input.maxLength = 8000;
        wrapper.append(input);
        form.append(wrapper);
        return input;
    }

    function renderCase(item, institutions) {
        const card = node('details');
        card.append(node('summary', (item.folio_canalizacion || item.folio) + ' · ' + item.estado));
        appendField(card, 'Folio del reporte', item.folio);
        appendField(card, 'Autoridad', item.autoridad);
        appendField(card, 'Prioridad y vencimiento', [item.prioridad, item.vence].filter(Boolean).join(' · '));
        appendField(card, 'Fecha de evaluación', item.fecha_evaluacion);
        appendField(card, 'Factores de riesgo', item.evaluacion?.factores);
        appendField(card, 'Nivel de atención', item.evaluacion?.nivel_atencion);
        appendField(card, 'Observaciones de evaluación', item.evaluacion?.observaciones_evaluacion);
        if (item.evaluacion?.riesgo_inmediato) card.append(node('p', 'Riesgo inmediato indicado'));
        for (const entry of item.historial) appendField(card, entry.estado, entry.fecha_actualizacion);
        appendField(card, 'Tipo de violencia', item.tipos.join(', '));
        appendField(card, 'Riesgo', item.nivel_riesgo);
        appendField(card, 'Valoración', item.valoracion);
        appendField(card, 'Propuesta', item.propuesta);
        appendField(card, 'Observaciones', item.observaciones);
        const path = '/canalizacion/' + item.id_reporte;
        for (const delivery of item.envios) appendField(card, delivery.nombre, delivery.vigente ? delivery.estado : 'Reasignada');
        showEvidence(card, item.evidencias, '/reportes/' + item.id_reporte + '/evidencias');
        for (const reply of item.respuestas) {
            appendField(card, reply.nombre + ' · Respuesta interna', reply.mensaje);
            appendField(card, 'Resumen publicado', reply.resumen_publico);
        }

        if (item.id_estado === 5) {
            let destinations;
            if (!item.id_administrador) {
                const label = node('label', 'Destinos institucionales. Sin selección, se usa el catálogo por tipo de violencia.');
                destinations = node('select');
                destinations.multiple = true;
                for (const i of institutions.filter(i => i.correo)) destinations.add(new Option(
                    [i.nombre, i.correo, i.telefono, i.direccion].filter(Boolean).join(' · '), i.id_institucion));
                label.append(destinations);
                card.append(label);
            }
            card.append(action(item.id_administrador ? 'Reintentar correos pendientes' : 'Aprobar y enviar correo', async () => {
                try {
                    const selected = Array.from(destinations?.selectedOptions || [], entry => Number(entry.value));
                    await api(path + '/decision', 'POST', {accion: 'aprobar', instituciones: selected.length ? selected : undefined});
                    notice.textContent = 'Caso canalizado.';
                } finally {
                    await loadCases(item.id_reporte);
                }
            }));
            if (!item.id_administrador) {
                const form = node('form');
                form.className = 'formulario-institucional';
                field(form, 'observaciones', 'Observaciones para la autoridad');
                form.append(node('button', 'Devolver para corrección'));
                handle(form, 'submit', async () => {
                    await api(path + '/decision', 'POST', {...values(form), accion: 'devolver'});
                    await loadCases(item.id_reporte);
                    notice.textContent = 'Solicitud devuelta a la autoridad.';
                });
                card.append(form);
            }
        }

        if ([3, 7].includes(item.id_estado)) {
            const form = node('form');
            form.className = 'formulario-institucional';
            const label = node('label', 'Institución que respondió');
            const select = node('select');
            select.name = 'id_institucion';
            select.required = true;
            item.envios.filter(delivery => delivery.vigente && delivery.estado === 'enviado').forEach(delivery => {
                select.add(new Option(delivery.nombre, delivery.id_institucion));
            });
            label.append(select);
            form.append(label);
            field(form, 'mensaje', 'Respuesta interna de la institución');
            field(form, 'resumen_publico', 'Resumen para seguimiento por folio (sin datos personales)');
            form.append(node('button', 'Registrar respuesta institucional'));
            handle(form, 'submit', async () => {
                const payload = values(form);
                payload.id_institucion = Number(payload.id_institucion);
                await api(path + '/respuestas', 'POST', payload);
                await loadCases(item.id_reporte);
                notice.textContent = 'Respuesta publicada en el seguimiento.';
            });
            card.append(form);
        }
        if ([3, 7].includes(item.id_estado)) {
            operationForm(card, 'Reasignar institución', form => {
                choiceField(form, 'anterior', 'Institución actual', item.envios.filter(x => x.vigente).map(x => [x.id_institucion, x.nombre]));
                choiceField(form, 'id_institucion', 'Nueva institución', institutions.filter(x => x.correo).map(x => [x.id_institucion, x.nombre]));
                textField(form, 'motivo', 'Motivo de reasignación');
            }, async form => {
                try {
                    await api(path + '/reasignar', 'POST', {...form, anterior: Number(form.anterior), id_institucion: Number(form.id_institucion)});
                    notice.textContent = 'Institución reasignada.';
                } finally {
                    await loadCases(item.id_reporte);
                }
            });
        }
        if (item.id_estado === 7) {
            operationForm(card, 'Marcar como atendido', form => {
                textField(form, 'motivo', 'Motivo del cierre');
                textField(form, 'resultado', 'Resultado de la atención');
            }, async form => {
                if (!confirm('¿Confirmas que concluyó la atención del caso?')) return;
                await api(path + '/atendido', 'POST', {...form, confirmar: true});
                await loadCases(item.id_reporte);
                notice.textContent = 'Caso marcado como atendido.';
            });
        }
        return card;
    }

    let referrals;
    function renderReferrals(openId) {
        const {casos, instituciones} = referrals;
        const query = byId('filtro-canalizacion').value.trim().toUpperCase();
        const results = casos.filter(item => [item.folio, item.folio_canalizacion].some(value => value?.includes(query)));
        replaceList(byId('lista-canalizaciones'), results, item => {
            const card = renderCase(item, instituciones);
            card.open = item.id_reporte === openId;
            return card;
        }, 'No hay reportes enviados a canalización.');
    }

    async function loadCases(openId) {
        referrals = await api('/canalizacion');
        renderReferrals(openId);
        const area = byId('instituciones-canalizacion');
        area.replaceChildren();
        for (const item of referrals.instituciones) appendField(area, item.nombre,
            [item.correo, item.telefono, item.direccion].filter(Boolean).join(' · '));
        if (!area.childElementCount) area.append(node('p', 'Todavía no hay instituciones en el catálogo de canalización.'));
    }

    handle(byId('filtro-canalizacion'), 'input', () => {
        if (referrals) renderReferrals();
    });
    const institutionForm = byId('nueva-institucion');
    handle(institutionForm, 'submit', async () => {
        await api('/canalizacion/instituciones', 'POST', values(institutionForm));
        institutionForm.reset();
        await loadCases();
        notice.textContent = 'Institución registrada.';
    });
    async function loadAdministrators() {
        const {administradores} = await api('/canalizacion/administradores');
        replaceList(byId('lista-administradores'), administradores, item => {
            const card = node('article');
            card.append(node('h3', item.nombre));
            appendField(card, 'Correo', item.correo);
            appendField(card, 'Estado', item.activo === 1 ? 'Activo' : 'Desactivado');
            if (item.activo !== 1 || item.cuenta_actual) return card;
            const output = node('output');
            const actions = node('div');
            actions.className = 'acciones-institucionales';
            for (const [label, accion] of [['Renovar folio', 'renovar_folio'], ['Desactivar acceso', 'desactivar']]) {
                actions.append(action(label, async () => {
                    if (!confirm(label + ' para ' + item.nombre + '? Sus sesiones se cerrarán.')) return;
                    const reply = await api('/canalizacion/administradores/' + item.id_administrador, 'PATCH', {accion});
                    if (reply.folio) {
                        output.textContent = 'Nuevo folio de acceso · ' + reply.folio;
                        notice.textContent = 'Folio renovado.';
                    } else {
                        await loadAdministrators();
                        notice.textContent = 'Acceso administrativo desactivado.';
                    }
                }));
            }
            card.append(actions, output);
            return card;
        }, 'No hay administradores registrados.');
    }

    handle(adminForm, 'submit', async () => {
        byId('folio-admin').textContent = '';
        const result = await api('/canalizacion/administradores', 'POST', values(adminForm));
        adminForm.reset();
        byId('folio-admin').textContent = 'Folio de acceso · ' + result.folio;
        notice.textContent = 'Administrador creado. Guarda su folio de acceso.';
        await loadAdministrators();
    });
    Promise.all([loadApplications(), loadCases(), loadAdministrators()]).catch(error => { notice.textContent = error.message; });
}
