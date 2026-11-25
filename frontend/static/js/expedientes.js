if (sessionStorage.getItem(sessionKey)) {
    const filters = byId('filtros-expediente');
    const createForm = byId('crear-expediente');
    const panel = byId('detalle-expediente');
    let records;

    function matchesPeriod(value, from, to) {
        if (!from && !to) return true;
        return Boolean(value) && (!from || value >= from) && (!to || value <= to);
    }

    function calendarDate(value) {
        return value ? new Date(value).toLocaleDateString('en-CA', {timeZone: 'America/Mexico_City'}) : '';
    }

    function refreshLists() {
        const {folio, estado, tipo, responsable, desde, hasta, periodo} = values(filters);
        const query = folio.trim().toUpperCase();
        const selected = records.casos.filter(item =>
            (!query || [item.folio, item.folio_canalizacion, item.folio_expediente].some(value => value?.includes(query))) &&
            (!estado || item.id_estado === Number(estado)) &&
            (!tipo || item.tipos.includes(Number(tipo))) &&
            (!responsable || item.responsable_id === Number(responsable)) &&
            matchesPeriod(calendarDate(periodo === 'cierre' ? item.cierre : item.fecha_registro), desde, hasta)
        );
        replaceList(byId('registro-expedientes'), selected, item => action(
            [item.folio_expediente || item.folio, item.estado || 'Sin estado', item.responsable].filter(Boolean).join(' · '),
            () => openCase(item.id_reporte)
        ), 'No hay reportes para los filtros elegidos.');

        const alerts = byId('agenda-global');
        alerts.replaceChildren();
        for (const task of records.actividades) {
            const row = node('p');
            const alert = activityDeadline(task);
            if (alert) row.className = 'bandera-riesgo';
            row.append([task.vence, alert, task.responsable, task.descripcion].filter(Boolean).join(' · ') + ' ',
                action(task.folio, () => openCase(task.id_reporte)));
            alerts.append(row);
        }
        if (!alerts.childElementCount) alerts.append(node('p', 'No hay actividades pendientes.'));
        const inbox = byId('avisos-global');
        inbox.replaceChildren();
        for (const item of records.avisos) appendField(inbox, item.folio, item.mensaje + ' · ' + item.fecha);
        renderReports(selected);
    }

    function downloadReport(items) {
        const csv = [
            ['Folio', 'Expediente', 'Canalización', 'Estado', 'Fecha de registro', 'Fecha de cierre', 'Calificación'],
            ...items.map(x => [x.folio, x.folio_expediente, x.folio_canalizacion, x.estado, x.fecha_registro, x.cierre, x.calificacion])
        ].map(row => row.map(value => '"' + String(value ?? '').replaceAll('"', '""') + '"').join(',')).join('\n');
        saveFile(new Blob(['\ufeff', csv], {type: 'text/csv;charset=utf-8'}), 'informe-expedientes.csv');
    }

    function renderReports(items) {
        const area = byId('informes-global');
        const folios = new Set(items.map(item => item.folio));
        const surveys = records.evaluaciones.filter(item => folios.has(item.folio));
        const closed = items.filter(item => item.cierre);
        area.replaceChildren();
        appendField(area, 'Reportes', String(items.length));
        appendField(area, 'Solicitudes de canalización', String(items.filter(x => x.folio_canalizacion).length));
        appendField(area, 'Expedientes cerrados', String(closed.length));
        const byStatus = Map.groupBy(items, entry => entry.estado || 'Sin estado');
        for (const [name, rows] of byStatus) appendField(area, name, String(rows.length));
        area.append(action('Descargar informe de casos (CSV)', () => downloadReport(items)));
        area.append(action('Descargar informe de cierres (CSV)', () => downloadReport(closed)));
        const workload = node('details');
        workload.append(node('summary', 'Carga de trabajo por responsable'));
        for (const worker of records.personal) appendField(workload, worker.nombre,
            String(items.filter(item => !item.cierre && item.responsable_id === worker.id_autoridad).length));
        area.append(workload);
        const history = node('details');
        history.append(node('summary', 'Historial de cierres y evaluaciones'));
        for (const item of closed) appendField(history, item.folio,
            calendarDate(item.cierre) + ' · ' + (item.calificacion ? item.calificacion + '/5' : 'Sin evaluación'));
        area.append(history);
        area.append(node('h3', 'Satisfacción y oportunidades de mejora'));
        if (!surveys.length) {
            area.append(node('p', 'No hay evaluaciones para los filtros elegidos.'));
            return;
        }
        appendField(area, 'Promedio', (surveys.reduce((sum, x) => sum + x.calificacion, 0) / surveys.length).toFixed(1) + ' de 5');
        for (let score = 1; score <= 5; score += 1) {
            const count = surveys.filter(item => item.calificacion === score).length;
            const row = node('p', score + ' de 5 · ' + count + ' ');
            const bar = node('meter');
            bar.value = count;
            bar.max = surveys.length;
            bar.setAttribute('aria-label', 'Evaluaciones con ' + score + ' de 5');
            row.append(bar);
            area.append(row);
        }
        const categories = Map.groupBy(surveys, item => item.categoria);
        const prioritized = Array.from(categories).sort((a, b) =>
            b[1].filter(x => x.calificacion < 4).length - a[1].filter(x => x.calificacion < 4).length);
        area.append(action('Generar reporte de oportunidades de mejora', () => {
            const rows = [['Tema', 'Evaluaciones', 'Calificaciones de 1 a 3', 'Promedio'],
                ...prioritized.map(([category, entries]) => [category, entries.length,
                    entries.filter(entry => entry.calificacion < 4).length,
                    (entries.reduce((sum, entry) => sum + entry.calificacion, 0) / entries.length).toFixed(2)])];
            const csv = rows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(',')).join('\n');
            saveFile(new Blob(['\ufeff', csv], {type: 'text/csv;charset=utf-8'}), 'oportunidades-de-mejora.csv');
        }));
        for (const [category, entries] of prioritized) {
            const categoryDetails = node('details');
            categoryDetails.append(node('summary', category + ' · ' + entries.filter(x => x.calificacion < 4).length + ' evaluaciones de 1 a 3'));
            for (const entry of entries) appendField(categoryDetails, entry.folio + ' · ' + entry.calificacion + '/5',
                [entry.comentario, entry.sugerencia].filter(Boolean).join(' · ') || 'Sin comentario');
            area.append(categoryDetails);
        }
    }

    async function reloadRecords() {
        records = await api('/expedientes');
        refreshLists();
    }

    function eligible(caseItem) {
        return records.personal.filter(worker => worker.tipo_autoridad === 'orientador'
            ? caseItem.ocurrio_en_escuela
            : caseItem.tipos.includes(worker.id_tipo_violencia)).map(worker => [worker.id_autoridad, worker.nombre]);
    }

    async function openCase(id) {
        const info = await api('/expedientes/' + id);
        const item = info.caso;
        const summary = records.casos.find(x => x.id_reporte === id);
        const path = '/expedientes/' + id;
        const heading = node('h2', item.folio_expediente || item.folio);
        heading.tabIndex = -1;
        panel.replaceChildren(heading);
        appendField(panel, 'Estado', item.estado);
        appendField(panel, 'Tipo de violencia', info.tipos.join(', '));
        appendField(panel, 'Responsable', summary?.responsable);
        appendField(panel, 'Reportante', [item.nombre_reportante, item.correo_reportante].filter(Boolean).join(' · '));
        const incident = {fecha: 'Fecha', hora: 'Hora', lugar: 'Lugar', ayudaInmediata: 'Ayuda inmediata', huboTestigos: 'Testigos', descripcion: 'Narración'};
        Object.entries(incident).forEach(([key, label]) => appendField(panel, label, item.detalle?.[key]));
        if (!item.detalle) appendField(panel, 'Narración', item.descripcion);
        for (const person of info.personas || []) appendField(panel, person.tipo_participacion,
            [person.nombre, person.descripcion].filter(Boolean).join(' · '));
        appendField(panel, 'Resultado del cierre', item.resultado_cierre);
        appendField(panel, 'Motivo del cierre', item.motivo_cierre);
        const evaluation = info.evaluacion;
        if (evaluation) {
            appendField(panel, 'Folio de canalización', evaluation.folio);
            appendField(panel, 'Valoración', evaluation.valoracion);
            appendField(panel, 'Propuesta', evaluation.propuesta);
            appendField(panel, 'Factores de riesgo', evaluation.evaluacion.factores);
        }
        const history = node('details');
        history.append(node('summary', 'Historial de estados'));
        for (const entry of info.historial) appendField(history, entry.estado,
            [entry.fecha_actualizacion, entry.observaciones].filter(Boolean).join(' · '));
        panel.append(history);
        const notes = node('details');
        notes.append(node('summary', 'Bitácora de atenciones y acciones'));
        for (const entry of info.bitacora) appendField(notes, [entry.fecha, entry.autor, entry.clase].filter(Boolean).join(' · '), entry.detalle);
        panel.append(notes);
        const files = node('details');
        files.append(node('summary', 'Evidencias'));
        showEvidence(files, info.evidencias, '/reportes/' + id + '/evidencias');
        panel.append(files);

        const update = async (suffix, data) => {
            await api(path + suffix, 'POST', data);
            await reloadRecords();
            await openCase(id);
            notice.textContent = 'Cambio guardado.';
        };

        if ([1, 2].includes(item.id_estado)) operationForm(panel, 'Clasificar tipo de violencia', form => {
            choiceField(form, 'tipo_violencia', 'Tipo confirmado', records.tipos.map(kind => [kind.id_tipo_violencia, kind.nombre]));
        }, data => update('/clasificacion', {tipo_violencia: Number(data.tipo_violencia)}));
        if (![4, 8].includes(item.id_estado)) {
            const staff = eligible(summary);
            if (staff.length) operationForm(panel, item.responsable_id ? 'Reasignar responsable' : 'Asignar responsable', form => {
                choiceField(form, 'responsable_id', 'Autoridad responsable', staff);
            }, data => update('/asignar', {responsable_id: Number(data.responsable_id)}));

            const operationNames = [['atencion', 'Registrar atención'], ['nota', 'Agregar observaciones'],
                ['intervencion', 'Registrar resultado de intervención'], ['correccion', 'Corregir narrativa'],
                ['persona', 'Registrar persona involucrada']];
            for (const [kind, title] of operationNames) operationForm(panel, title, form => {
                if (kind === 'persona') {
                    choiceField(form, 'tipo_participacion', 'Participación', [['testigo', 'Testigo'], ['afectado', 'Afectado'], ['otra', 'Otra']]);
                    if (!item.es_anonimo) textField(form, 'nombre', 'Nombre', 'text', false);
                }
                textField(form, 'detalle', 'Descripción');
            }, data => update('/acciones', {...data, clase: kind}));

            operationForm(files, 'Adjuntar evidencia', form => {
                const options = [['expediente', 'Expediente']];
                if (evaluation) options.push(['canalizacion', 'Canalización']);
                const attention = info.bitacora.filter(x => x.clase === 'atencion');
                if (attention.length) options.push(['atencion', 'Atención específica']);
                const target = choiceField(form, 'uso', 'Destino', options);
                const session = choiceField(form, 'id_evento', 'Atención vinculada', attention.map(x => [x.id_evento, x.fecha + ' · ' + x.autor]));
                session.disabled = true;
                session.parentElement.hidden = true;
                target.addEventListener('change', () => {
                    session.disabled = target.value !== 'atencion';
                    session.parentElement.hidden = session.disabled;
                });
                textField(form, 'archivo', 'Archivo (hasta 10 MB)', 'file');
            }, (_, form) => update('/evidencias', new FormData(form)));

            function activityFields(form, task) {
                const responsible = choiceField(form, 'responsable_id', 'Responsable', staff);
                const title = textField(form, 'descripcion', 'Actividad');
                const due = textField(form, 'vence', 'Fecha límite o cita', 'date');
                const repeat = textField(form, 'recurrencia_dias', 'Repetir cada cuántos días (opcional)', 'number', false);
                repeat.min = 1;
                repeat.max = 365;
                if (!task) {
                    const end = textField(form, 'fin_recurrencia', 'Última fecha de la programación preventiva', 'date', false);
                    end.parentElement.hidden = true;
                    repeat.addEventListener('input', () => {
                        end.required = Boolean(repeat.value);
                        end.parentElement.hidden = !end.required;
                        if (!end.required) end.value = '';
                    });
                }
                if (task) {
                    responsible.value = task.responsable_id;
                    title.value = task.descripcion;
                    due.value = task.vence;
                    repeat.value = task.recurrencia_dias ?? '';
                }
            }
            const saveActivity = (data, item = {}) => update('/actividad', {...data, ...item,
                responsable_id: Number(data.responsable_id), recurrencia_dias: Number(data.recurrencia_dias) || null});

            if (staff.length) operationForm(panel, 'Programar actividad o próxima atención', form => activityFields(form),
                data => saveActivity(data, {accion: 'crear'}));
            for (const task of info.actividades) {
                const row = node('details');
                row.append(node('summary', task.vence + ' · ' + task.descripcion + (task.vencida ? ' · Vencida' : '')));
                appendField(row, task.responsable, task.estado);
                appendField(row, 'Resultado', task.resultado);
                if (task.estado === 'pendiente') {
                    operationForm(row, 'Editar actividad', form => activityFields(form, task),
                        data => saveActivity(data, {accion: 'editar', id_actividad: task.id_actividad}));
                    operationForm(row, 'Completar actividad', form => textField(form, 'resultado', 'Resultado'),
                        data => update('/actividad', {...data, accion: 'completar', id_actividad: task.id_actividad}));
                    row.append(action('Cancelar actividad', async () => {
                        if (confirm('¿Cancelar esta actividad?')) await update('/actividad',
                            {accion: 'eliminar', id_actividad: task.id_actividad});
                    }));
                }
                panel.append(row);
            }
        }

        const state = item.id_estado;
        const transitions = ({
            1: [[2, 'En revisión']], 2: [[4, 'Cerrado']], 4: [[9, 'Abierto en seguimiento']],
            7: [[4, 'Cerrado']], 8: [[9, 'Abierto en seguimiento']], 9: [[2, 'En revisión'], [4, 'Cerrado']]
        })[state];
        if (transitions) operationForm(panel, 'Cambiar estado del expediente', form => {
            const target = choiceField(form, 'id_estado', 'Nuevo estado', transitions);
            textField(form, 'motivo', 'Motivo');
            const result = textField(form, 'resultado', 'Resultado final', 'textarea', false);
            const change = () => {
                result.required = target.value === '4';
                result.parentElement.hidden = !result.required;
            };
            target.addEventListener('change', change);
            change();
        }, async data => {
            const target = Number(data.id_estado);
            if (target === 4 && !confirm('¿Confirmas el cierre del expediente?')) return;
            await update('/estado', {...data, id_estado: target, confirmar: target === 4});
        });
        panel.hidden = false;
        heading.focus();
    }

    handle(filters, 'submit', async () => {
        if (filters.elements.desde.value && filters.elements.hasta.value && filters.elements.desde.value > filters.elements.hasta.value) {
            throw new Error('La fecha inicial debe ser anterior o igual a la final.');
        }
        refreshLists();
    });
    handle(createForm, 'submit', async () => {
        const data = values(createForm);
        const result = await api('/expedientes', 'POST', {...data, tipo_violencia: Number(data.tipo_violencia),
            ocurrio_en_escuela: createForm.elements.ocurrio_en_escuela.checked});
        createForm.reset();
        await reloadRecords();
        await openCase(result.id_reporte);
        notice.textContent = 'Expediente creado.';
    });
    Promise.all([reloadRecords(), api('/estados-reporte')]).then(([, {estados}]) => {
        for (const item of estados) filters.elements.estado.add(new Option(item.nombre, item.id_estado));
        createForm.elements.tipo_violencia.add(new Option('Selecciona un tipo', ''));
        for (const item of records.tipos) {
            filters.elements.tipo.add(new Option(item.nombre, item.id_tipo_violencia));
            createForm.elements.tipo_violencia.add(new Option(item.nombre, item.id_tipo_violencia));
        }
        for (const item of records.personal) filters.elements.responsable.add(new Option(item.nombre, item.id_autoridad));
    }).catch(error => { notice.textContent = error.message; });
}
