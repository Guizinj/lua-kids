/**
 * Leitura de rotas por hash e comunicação com o renderizador, sem depender das telas.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;

  let renderizador;
  /**
   * Decompõe #/pagina/codigo?filtro=valor sem fazer requisição ou alterar dados.
   */
  function lerRota() {
    const hash = location.hash.startsWith('#/') ? location.hash.slice(2) : '';
    const [path, query = ''] = hash.split('?');
    return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(query) };
  }
  /**
   * A aplicação registra o renderizador depois que todas as telas foram carregadas.
   */
  function registrarRenderizador(funcao) {
    renderizador = funcao;
  }
  /**
   * Solicita redesenho à aplicação. false preserva rolagem em atualizações locais.
   */
  function renderizarPagina(rolar = true) {
    if (renderizador) renderizador(rolar);
  }
  /**
   * Muda a rota; repetir a rota atual pede um redesenho, sem duplicar eventos.
   */
  function navegar(path) {
    const destination = '#/' + path;
    if (location.hash === destination) renderizarPagina();
    else location.hash = destination;
  }

  LuaKids.navegacao = { lerRota, navegar, registrarRenderizador, renderizarPagina };
})();
