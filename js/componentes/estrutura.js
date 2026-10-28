/**
 * Cabeçalho e rodapé. Atualizar seus contadores não reconstrói as telas.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { selecionar } = LuaKids.utilitarios;
  const { obterEstado } = LuaKids.armazenamento;
  const { calcularTotaisSacola } = LuaKids.sacola;
  const { montarMarca } = LuaKids.componentes;
  const { montarIcone } = LuaKids.icones;
  const { WHATSAPP_LOJA } = LuaKids.configuracao;

  /**
   * Atualiza a marca, a busca e os contadores de sacola/favoritos. Pode ser chamado após
   * mudar a sacola sem reconstruir a página inteira.
   */
  function renderizarCabecalho() {
    const count = calcularTotaisSacola().grades;
    selecionar('#header').innerHTML = `<div class="container header-main">${montarMarca()}
    <form class="header-search" id="header-search" role="search"><label class="visually-hidden" for="search">O que você procura?</label><input type="search" id="search" name="q" placeholder="Encontre o próximo queridinho da sua loja…" autocomplete="off"><button class="icon-button" type="submit" aria-label="Buscar produtos">${montarIcone('search')}</button></form>
    <div class="header-actions"><a class="icon-button" href="#/favoritos" aria-label="Favoritos">${montarIcone('heart')}${obterEstado().favorites.length ? `<span class="count-badge">${obterEstado().favorites.length}</span>` : ''}</a><a class="header-account" href="#/pedidos">${montarIcone('user')}<span><small>Área demonstrativa</small>Meus pedidos</span></a><button class="icon-button" data-action="cart-open" aria-label="Abrir sacola, ${count} grades">${montarIcone('bag')}<span class="count-badge">${count}</span></button></div>
    </div><nav class="container header-nav" aria-label="Navegação principal"><a href="#/" data-nav="inicio">Início</a><a href="#/catalogo" data-nav="catalogo">Catálogo</a><a href="#/como-comprar" data-nav="como-comprar">Como comprar</a><a href="#/pedidos" data-nav="pedidos">Meus pedidos</a><a class="admin-link" href="#/painel" data-nav="painel">${montarIcone('grid')} Painel demo</a></nav>`;
  }

  /**
   * Monta os links de navegação e atendimento e a ação de reiniciar somente a demonstração.
   * Nenhuma mensagem é enviada automaticamente.
   */
  function renderizarRodape() {
    selecionar('#footer').innerHTML =
      `<div class="container"><div class="footer-grid"><div>${montarMarca()}<p>Moda infantil com delicadeza em cada detalhe. Uma seleção para encantar os pequenos e completar a sua loja.</p></div><div><p class="footer-title">A sua próxima compra</p><div class="footer-links"><a href="#/catalogo">Explorar o catálogo</a><a href="#/como-comprar">Como funcionam as grades</a><a href="#/pedidos">Acompanhar meus pedidos</a><a href="#/favoritos">Meus favoritos</a></div></div><div><p class="footer-title">Vamos conversar?</p><div class="footer-links"><a href="https://wa.me/${WHATSAPP_LOJA}" target="_blank" rel="noopener noreferrer">WhatsApp · (81) 98116-4812</a><span>Caruaru · Pernambuco</span><span>Entrega grátis em Caruaru/PE</span><a href="#/painel">Painel de acompanhamento · demo</a></div></div></div><div class="footer-bottom"><span>Lua Kids © ${new Date().getFullYear()} · Prévia com conteúdo ilustrativo</span><span>Dados salvos somente neste navegador · <button type="button" data-action="reset">Reiniciar demonstração</button></span></div></div>`;
  }
  LuaKids.estrutura = { renderizarCabecalho, renderizarRodape };
})();
