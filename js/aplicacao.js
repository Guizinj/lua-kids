/**
 * Entrada da loja. Mantém a ordem de inicialização e liga o roteador às telas.
 * Para encontrar regras de sacola, pedidos ou anexos, consulte os respectivos serviços.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { selecionar, selecionarTodos, encontrarProduto } = LuaKids.utilitarios;
  const { lerRota, registrarRenderizador } = LuaKids.navegacao;
  const { carregarEstado } = LuaKids.armazenamento;
  const { renderizarCabecalho, renderizarRodape } = LuaKids.estrutura;
  const { montarInicio } = LuaKids.inicio;
  const { montarCatalogo, atualizarResultadosCatalogo } = LuaKids.catalogo;
  const { montarPaginaProduto } = LuaKids.produto;
  const { montarFechamento, atualizarAvisoEntrega } = LuaKids.fechamento;
  const { montarHistoricoCliente, montarDetalhesPedido } = LuaKids.telaPedidos;
  const { montarFavoritos } = LuaKids.telaFavoritos;
  const { montarPainel, atualizarTabelaPedidos } = LuaKids.painel;
  const { montarComoComprar } = LuaKids.comoComprar;
  const { montarPaginaNaoEncontrada } = LuaKids.componentes;

  /**
   * Escolhe a tela pela rota, atualiza título e navegação, e executa as atualizações
   * específicas da tela. Pode preservar a rolagem em mudanças locais, como status e
   * favoritos.
   */
  function renderizarPagina(rolar = true) {
    const { parts: partes } = lerRota();
    const nome = partes[0] || 'inicio';
    const conteudo = selecionar('#conteudo');
    const paginas = {
      inicio: montarInicio,
      catalogo: montarCatalogo,
      produto: () => montarPaginaProduto(partes[1]),
      finalizar: montarFechamento,
      pedidos: montarHistoricoCliente,
      endereco: LuaKids.enderecoConta.montarEnderecoConta,
      favoritos: montarFavoritos,
      pedido: () => montarDetalhesPedido(partes[1]),
      painel: () =>
        partes[1] === 'pedido' ? montarDetalhesPedido(partes[2], true) : montarPainel(),
      'como-comprar': montarComoComprar,
    };
    conteudo.innerHTML = (paginas[nome] || montarPaginaNaoEncontrada)();
    const titulos = {
      inicio: 'Moda infantil no atacado',
      catalogo: 'Catálogo',
      produto: encontrarProduto(partes[1])?.name || 'Produto',
      finalizar: 'Fechar pedido',
      pedidos: 'Meus pedidos',
      endereco: 'Meu endereço',
      favoritos: 'Favoritos',
      pedido: 'Detalhes do pedido',
      painel: 'Painel demonstrativo',
      'como-comprar': 'Como comprar',
    };
    document.title = `${titulos[nome] || 'Página não encontrada'} · Lua Kids`;
    selecionarTodos('[data-nav]').forEach((link) => {
      const ativo =
        link.dataset.nav === nome ||
        (nome === 'produto' && link.dataset.nav === 'catalogo') ||
        (nome === 'pedido' && link.dataset.nav === 'pedidos');
      link.classList.toggle('active', ativo);
      if (ativo) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    atualizarResultadosCatalogo();
    atualizarTabelaPedidos();
    LuaKids.maisVendidos.atualizarControles();
    if (nome === 'finalizar' && rolar) LuaKids.fechamento.iniciarAvisosEntrega();
    else atualizarAvisoEntrega();
    if (rolar) {
      window.scrollTo(0, 0);
      conteudo.focus({ preventScroll: true });
    }
    LuaKids.catalogo.aplicarRolagemSolicitada();
  }
  registrarRenderizador(renderizarPagina);
  carregarEstado();
  renderizarCabecalho();
  renderizarRodape();
  LuaKids.eventos.registrarEventos();
  renderizarPagina(false);
  if (lerRota().parts[0] === 'finalizar') LuaKids.fechamento.iniciarAvisosEntrega();
})();
