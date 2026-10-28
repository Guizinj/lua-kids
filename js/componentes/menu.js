/** Menu de categorias e atendimento. Só usa destinos existentes na demonstração. */
(() => {
  'use strict';
  const { escaparHTML } = window.LuaKids.utilitarios;
  const { montarIcone } = window.LuaKids.icones;

  /** Categorias e contagens vêm do mesmo catálogo dos cartões e filtros. */
  function abrirMenu() {
    window.LuaKids.dialogos.fecharTodos();
    const dialogo = document.querySelector('#menu-lateral');
    const produtos = window.LuaKids.demonstracao.produtos;
    const categorias = [...new Set(produtos.map((produto) => produto.category))];
    const rota = window.LuaKids.navegacao.lerRota();
    const categoriaAtual = rota.parts[0] === 'catalogo' ? rota.params.get('categoria') : null;
    // Categorias vêm primeiro, em um grupo próprio, para priorizar a compra.
    const blocoCategorias = `<section class="menu-categorias" aria-labelledby="titulo-categorias-menu"><h3 id="titulo-categorias-menu">Categorias</h3><div class="lista-categorias-menu">${categorias
      .map((nome) => {
        const ativa = categoriaAtual === nome;
        return `<a class="link-categoria ${ativa ? 'categoria-ativa' : ''}" href="#/catalogo?categoria=${encodeURIComponent(nome)}" ${ativa ? 'aria-current="page"' : ''}><span>${escaparHTML(nome)}</span><span class="categoria-info"><span class="contagem-categoria">${produtos.filter((produto) => produto.category === nome).length}</span>${montarIcone('arrow')}</span></a>`;
      })
      .join('')}</div></section>`;
    const links = (itens) =>
      itens
        .map(([nome, destino]) => `<a href="${destino}">${nome}${montarIcone('arrow')}</a>`)
        .join('');
    dialogo.innerHTML = `<div class="cabecalho-painel"><div><p class="eyebrow">Lua Kids</p><h2 id="titulo-menu">Explore a loja</h2></div><button class="icon-button" data-action="menu-fechar" aria-label="Fechar menu">${montarIcone('close')}</button></div><form id="menu-search" class="busca-menu" role="search"><label for="busca-menu">Buscar produtos</label><div><input id="busca-menu" name="q" type="search" placeholder="Nome ou tecido"><button type="submit" class="icon-button" aria-label="Buscar">${montarIcone('search')}</button></div></form><nav aria-label="Menu da loja">${blocoCategorias}<h3>Acesso rápido</h3>${links(
      [
        ['Início', '#/'],
        ['Catálogo completo', '#/catalogo'],
        ['Meus pedidos', '#/pedidos'],
        ['Meus favoritos', '#/favoritos'],
        ['Meu endereço', '#/endereco'],
      ],
    )}<h3>Compra e atendimento</h3>${links([['Como comprar', '#/como-comprar']])}<a href="https://wa.me/${window.LuaKids.configuracao.WHATSAPP_LOJA}" target="_blank" rel="noopener noreferrer">Atendimento pelo WhatsApp ${montarIcone('chat')}</a></nav>`;
    dialogo.showModal();
    document.querySelector('[data-action="menu-abrir"]')?.setAttribute('aria-expanded', 'true');
  }

  function fecharMenu() {
    document.querySelector('#menu-lateral').close();
  }
  window.LuaKids.menu = { abrirMenu, fecharMenu };
})();
