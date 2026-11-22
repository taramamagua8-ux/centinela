const flujo = JSON.parse(sessionStorage.getItem('centinela_flujo') || 'null');
const form = document.getElementById('form-violentometro');
const escala = document.getElementById('escala-violentometro');
const opciones = document.getElementById('opciones-violentometro');
const control = document.getElementById('control-violentometro');
const nombreSeleccion = document.getElementById('seleccion-violentometro');
const paletaViolentometro = ['#24a35a', '#73b82f', '#e8be18', '#eb771e', '#db3738'];

function colorCategoria(indice) {
    const avance = Math.max(0, indice) / Math.max(1, tipos.length - 1);
    return paletaViolentometro[Math.round(avance * (paletaViolentometro.length - 1))];
}
const descripcion = document.getElementById('descripcion-violentometro');
const ejemplo = document.getElementById('ejemplo-violentometro');
const textoEjemplo = document.getElementById('texto-ejemplo-violentometro');
const ejemplosPorTipo = new Map([
    [1, 'Una persona ridiculiza a su pareja frente a otras personas y la insulta para hacerla sentir menos.'],
    [2, 'Durante una discusión, una persona empuja a otra o la sujeta del brazo para impedir que se aleje.'],
    [3, 'Una persona toca íntimamente a otra sin su consentimiento.'],
    [4, 'Una persona controla el sueldo de su pareja y le impide usar su propio dinero para gastos básicos.'],
    [5, 'Una persona retiene los documentos personales de su pareja o destruye sus pertenencias.']
]);
let tipos = [];
let segmentos = [];
let puntero = null;
let indiceSeleccionado = -1;
const aviso = document.getElementById('aviso-violentometro');
const continuar = document.getElementById('continuar-violentometro');

function actualizarSeleccion(indice, posicion) {
    indiceSeleccionado = indice;
    const tipo = tipos[indice];
    const nombre = tipo?.nombre || 'Sin seleccionar';
    const posicionCentro = (Math.max(0, indice) + .5) / tipos.length;

    continuar.disabled = !tipo;
    control.value = Math.max(0, indice);
    control.setAttribute('aria-valuetext', nombre);
    nombreSeleccion.textContent = tipo?.nombre || '';
    nombreSeleccion.hidden = !tipo;
    descripcion.textContent = tipo?.descripcion || '';
    descripcion.hidden = !descripcion.textContent;
    textoEjemplo.textContent = ejemplosPorTipo.get(Number(tipo?.id_tipo_violencia)) || '';
    ejemplo.hidden = !textoEjemplo.textContent;
    escala.style.setProperty('--color-violentometro', colorCategoria(indice));
    escala.style.setProperty('--posicion-violentometro', (posicion ?? posicionCentro) * 100 + '%');
    segmentos.forEach((segmento, index) => segmento.classList.toggle('seleccionado', index === indice));
}

async function cargarViolentometro() {
    if (!flujo?.terminos || !['victima', 'testigo'].includes(flujo.rol)) {
        location.replace('formulario_reporte.html');
        return;
    }

    document.getElementById('pregunta-violentometro').textContent = flujo.rol === 'victima'
        ? '¿Qué tipo de violencia estás viviendo?'
        : '¿Qué tipo de violencia observaste?';

    const respuesta = await fetch('/api/tipos-violencia');
    if (!respuesta.ok) throw new Error('No se pudieron cargar los tipos de violencia.');
    ({tipos} = await respuesta.json());
    if (!tipos.length) throw new Error('Por el momento no hay tipos de violencia disponibles.');

    segmentos = tipos.map((tipo, indice) => {
        const segmento = document.createElement('span');
        segmento.className = 'opcion-violentometro';
        segmento.style.setProperty('--color-opcion', colorCategoria(indice));
        segmento.textContent = tipo.nombre.replace(/^Violencia (física|sexual|económica|patrimonial)$/i, '$1')
            .replace(/^Violencia psicológica o emocional$/i, 'Psicológica');
        opciones.append(segmento);
        return segmento;
    });
    control.max = tipos.length - 1;
    escala.style.setProperty('--categorias-violentometro', tipos.length);
    escala.hidden = false;
    aviso.textContent = '';
    actualizarSeleccion(tipos.findIndex(tipo => String(tipo.id_tipo_violencia) === String(flujo.tipoViolencia)));
}

function seleccionarConPuntero(evento) {
    const rect = control.getBoundingClientRect();
    const posicion = Math.min(1, Math.max(0, (evento.clientX - rect.left) / rect.width));
    const indice = Math.min(tipos.length - 1, Math.floor(posicion * tipos.length));
    actualizarSeleccion(indice, posicion);
}

control.addEventListener('pointerdown', evento => {
    if (!evento.isPrimary || evento.button !== 0 || !tipos.length) return;
    evento.preventDefault();
    control.focus({preventScroll: true});
    control.setPointerCapture(evento.pointerId);
    puntero = evento.pointerId;
    escala.classList.add('arrastrando-violentometro');
    seleccionarConPuntero(evento);
});
control.addEventListener('pointermove', evento => {
    if (evento.pointerId === puntero) seleccionarConPuntero(evento);
});
control.addEventListener('lostpointercapture', evento => {
    if (evento.pointerId !== puntero) return;
    puntero = null;
    escala.classList.remove('arrastrando-violentometro');
    actualizarSeleccion(indiceSeleccionado);
});
control.addEventListener('input', () => actualizarSeleccion(Number(control.value)));
control.addEventListener('keydown', evento => {
    if (evento.key === ' ' || evento.key === 'Enter') {
        evento.preventDefault();
        actualizarSeleccion(Number(control.value));
    }
});
form.addEventListener('submit', evento => {
    evento.preventDefault();
    if (indiceSeleccionado < 0) return;
    const seleccionado = String(tipos[indiceSeleccionado].id_tipo_violencia);
    flujo.tipoViolencia = seleccionado;
    sessionStorage.setItem('centinela_flujo', JSON.stringify(flujo));
    location.assign(flujo.rol === 'victima' ? 'ReporteVicAno.html' : 'ReporteTesAno.html');
});

cargarViolentometro().catch(error => { aviso.textContent = error.message; });
