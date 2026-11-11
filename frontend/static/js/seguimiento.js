const formulario = document.getElementById('form-folio');
const campoFolio = document.getElementById('folio');
const aviso = document.getElementById('aviso-folio');
const API_SEGUIMIENTO = 'http://' + window.location.hostname + ':5000/api';

formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    if (campoFolio.value.trim() === '') {
        aviso.classList.add('visible');
        campoFolio.classList.add('campo-error');
        campoFolio.focus();
        return;
    }

    fetch(API_SEGUIMIENTO + '/reportes/folio/' + encodeURIComponent(campoFolio.value.trim()))
        .then(function (respuesta) {
            return respuesta.json().then(function (datos) {
                return { ok: respuesta.ok, datos: datos };
            });
        })
        .then(function (resultado) {
            if (!resultado.ok) {
                aviso.classList.add('visible');
                aviso.querySelector('span:last-child').textContent = resultado.datos.error || 'Folio no encontrado';
                return;
            }
            aviso.classList.remove('visible');
            window.location.href = 'seguimiento.html?folio=' + encodeURIComponent(resultado.datos.reporte.folio);
        })
        .catch(function () {
            aviso.classList.add('visible');
            aviso.querySelector('span:last-child').textContent = 'No se pudo conectar con el servidor';
        });
});

// Quita el aviso en cuanto el usuario empieza a escribir
campoFolio.addEventListener('input', function () {
    aviso.classList.remove('visible');
    campoFolio.classList.remove('campo-error');
});
