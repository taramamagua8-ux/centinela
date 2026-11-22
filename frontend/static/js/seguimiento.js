const formulario = document.getElementById('form-folio');
formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const folio = document.getElementById('folio').value.trim();
    if (folio) window.location.assign('seguimiento.html#' + encodeURIComponent(folio));
});
