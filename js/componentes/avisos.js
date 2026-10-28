/**
 * Mensagens breves de sucesso/erro, sem interpretar o texto como HTML.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { selecionar } = LuaKids.utilitarios;

  let temporizadorAviso;
  /**
   * Mostra uma mensagem acessível; erro recebe mais tempo de leitura.
   */
  function mostrarAviso(mensagem, erro = false) {
    const aviso = selecionar('#toast');
    aviso.textContent = mensagem;
    aviso.className = 'toast visible' + (erro ? ' error' : '');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove('visible'), erro ? 6500 : 3400);
  }
  LuaKids.avisos = { mostrarAviso };
})();
