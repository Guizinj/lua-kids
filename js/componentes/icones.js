/**
 * Desenhos SVG locais usados pela interface. Os ícones decorativos ficam ocultos de
 * leitores de tela.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;

  const DESENHOS_ICONES = {
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    heart:
      '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    bag: '<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    user: '<circle cx="12" cy="7.5" r="3.5"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>',
    back: '<path d="M20 12H5m5-5-5 5 5 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    box: '<path d="m3 7 9-5 9 5v10l-9 5-9-5V7Z"/><path d="m3 7 9 5 9-5M12 12v10M7.5 4.5l9 5"/>',
    truck:
      '<path d="M2 5h12v12H2V5Zm12 5h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    flower:
      '<path d="M12 8c-5-8-10-1-5 3-8 2-3 10 2 6 0 9 8 6 7 0 7 5 11-3 3-6 6-5-1-10-5-3"/><circle cx="12" cy="12" r="2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="M12 3 3 7v5c0 5 9 10 9 10s9-5 9-10V7l-9-4Z"/><path d="m8 12 3 3 5-6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    upload: '<path d="M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5"/>',
    chat: '<path d="M21 11.5a9 9 0 0 1-13.7 7.7L3 21l1.7-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8 8c0 4 4 8 8 8l1-3-3-1-1 1-2-2 1-1-1-3-3 1Z"/>',
    location:
      '<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  };
  const montarIcone = (name) =>
    `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${DESENHOS_ICONES[name] || DESENHOS_ICONES.box}</svg>`;

  LuaKids.icones = { montarIcone };
})();
