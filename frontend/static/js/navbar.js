(function () {
  const MENU = [
    ['principal.html',      'Inicio'],
    ['descubre_mas.html',   'Descubre más'],
    ['videos.html',         'Videos'],
    ['directorio.html',     'Directorio'],
    ['sobre_nosotros.html', 'Sobre nosotros'],
    ['acceso_admin.html',   'Acceso de administrador'],
  ];
  const TITULO = 'CENTINELA DIGITAL';

  const letras = [...TITULO]
    .map((c, i) => `<b aria-hidden="true" style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</b>`)
    .join('');

  const actual = location.pathname.split('/').pop();
  const enlaces = MENU
    .map(([href, txt]) =>
      `<a href="${href}"${href === actual ? ' aria-current="page"' : ''}>${txt}</a>`)
    .join('');

  const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

  const html = `
  <header class="barra-superior">
    <input type="checkbox" id="toggle-menu" class="toggle-menu" aria-label="Menú principal">
    <label for="toggle-menu" class="btn-hamburguesa" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </label>

    <nav class="menu-lateral" aria-label="Navegación principal">${enlaces}</nav>

    <a class="logo-centro" href="principal.html">
      <img src="../img/logoB.png" alt="Logo Centinela Digital">
      <span class="fx-pop" role="img" aria-label="${TITULO}">${letras}</span>
    </a>

    <div class="iconos-derecha accesos-navbar">
      <a href="formulario.html" class="btn-nav btn-nav-folio" title="Consultar folio">
        <span class="nav-icono" aria-hidden="true">
          <svg ${SVG}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <span class="nav-texto">Consultar folio</span>
      </a>
      <a href="cuenta.html" class="btn-nav btn-nav-cuenta" title="Mi cuenta">
        <span class="nav-icono" aria-hidden="true">
          <svg ${SVG}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </span>
        <span class="nav-texto">Mi cuenta</span>
      </a>
    </div>
  </header>`;

  document.currentScript.insertAdjacentHTML('beforebegin', html);
})();