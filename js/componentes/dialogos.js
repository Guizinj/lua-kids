/**
 * Diálogo HTML de confirmação/aviso, independente de window.confirm.
 * O navegador controla o foco modal; Voltar, Escape e o fundo nunca confirmam a ação.
 */
(() => {
  'use strict';
  const { escaparHTML } = window.LuaKids.utilitarios;
  let confirmarAcao = null;

  /** Fecha outros painéis antes de abrir um diálogo, evitando modais empilhados. */
  function fecharTodos() {
    document.querySelectorAll('dialog[open]').forEach((dialogo) => dialogo.close());
  }

  /**
   * Recebe texto controlado e uma ação opcional. O botão de confirmar só executa
   * uma vez, mesmo em toques repetidos; um erro é tratado pelo controlador de eventos.
   */
  function abrir({ titulo, texto, confirmar = 'Entendi', acao = null, perigo = false }) {
    fecharTodos();
    const dialogo = document.querySelector('#dialogo-aviso');
    confirmarAcao = acao;
    dialogo.innerHTML = `<h2 id="titulo-dialogo-aviso">${escaparHTML(titulo)}</h2><p>${escaparHTML(texto)}</p><div class="dialog-actions">${acao ? '<button class="button secondary" data-action="dialogo-voltar" autofocus>Voltar</button>' : ''}<button class="button ${perigo ? 'danger' : ''}" data-action="dialogo-confirmar" ${acao ? '' : 'autofocus'}>${escaparHTML(confirmar)}</button></div>`;
    dialogo.showModal();
  }

  /** Descarta a referência antes de chamar o serviço para não repetir movimentações. */
  function confirmar() {
    const acao = confirmarAcao;
    confirmarAcao = null;
    document.querySelector('#dialogo-aviso').close();
    if (acao) acao();
  }

  function voltar() {
    confirmarAcao = null;
    document.querySelector('#dialogo-aviso').close();
  }

  window.LuaKids.dialogos = { abrir, confirmar, voltar, fecharTodos };
})();
