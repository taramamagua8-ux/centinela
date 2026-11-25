const confirmacion = new URLSearchParams(location.hash.slice(1));
const folio = confirmacion.get('folio');
const verReporte = document.getElementById('ver-reporte');
const copiar = document.getElementById('copiar-folio');
document.getElementById('folio-confirmacion').textContent = folio || 'Folio no disponible';
if (folio) verReporte.href = 'seguimiento.html#' + encodeURIComponent(folio);
copiar.disabled = !folio;
copiar.addEventListener('click', async () => {
    const aviso = document.getElementById('aviso-copia');
    try {
        await navigator.clipboard.writeText(folio);
        aviso.textContent = 'Folio copiado.';
        copiar.dataset.copiado = 'true';
    } catch {
        delete copiar.dataset.copiado;
        aviso.textContent = 'Selecciona el folio y cópialo manualmente.';
    }
});
