/**
 * Controladores da interface.
 * O HTML declara intenções com data-action e data-filter. Um conjunto de ouvintes
 * no document atende também os elementos que são reconstruídos ao trocar de tela.
 * Cada ação delega os cálculos e a gravação aos serviços, depois atualiza a interface.
 */
(() => {
  'use strict';

  const {
    utilitarios,
    configuracao,
    armazenamento,
    navegacao,
    estrutura,
    avisos,
    sacola,
    telaSacola,
    favoritos,
    fechamento,
    pedidos,
    painel,
    catalogo,
    anexos,
    whatsapp,
  } = window.LuaKids;
  const { selecionar } = utilitarios;
  const { mostrarAviso } = avisos;
  const { navegar, lerRota, renderizarPagina } = navegacao;

  /**
   * Atualiza contadores e diálogo após editar a quantidade ou remover um modelo.
   */
  function atualizarSacola() {
    estrutura.renderizarCabecalho();
    telaSacola.renderizarSacola();
    // O resumo do fechamento também precisa refletir a sacola atualizada.
    if (lerRota().parts[0] === 'finalizar') renderizarPagina(false);
  }

  /**
   * Delega a adição ao serviço e só anuncia sucesso depois de salvar os dados.
   */
  function adicionarNaSacola(id, quantidade = 1) {
    sacola.adicionarGrade(id, quantidade);
    estrutura.renderizarCabecalho();
    mostrarAviso(
      `${quantidade} ${quantidade === 1 ? 'grade adicionada' : 'grades adicionadas'} à sacola.`,
    );
  }

  /**
   * Altera a seleção de grades no detalhe sem gravar nada antes de clicar em adicionar.
   */
  function ajustarQuantidadeDoProduto(botao) {
    const saida = selecionar('#detail-quantity');
    const disponivel = armazenamento.obterEstado().stock[lerRota().parts[1]] || 1;
    const atual = Number(saida.value || saida.textContent);
    saida.value = String(Math.max(1, Math.min(disponivel, atual + Number(botao.dataset.step))));
  }

  /**
   * Salva o favorito, atualiza os corações e conserva a posição de leitura da página.
   */
  function alternarFavorito(id) {
    const selecionado = favoritos.alternarFavorito(id);
    estrutura.renderizarCabecalho();
    const posicao = window.scrollY;
    renderizarPagina(false);
    window.scrollTo(0, posicao);
    mostrarAviso(selecionado ? 'Modelo guardado nos favoritos.' : 'Modelo removido dos favoritos.');
  }

  /**
   * Cancela apenas após a confirmação da pessoa; o serviço protege a reserva local.
   */
  function atualizarStatus(botao) {
    const novoStatus = botao.dataset.status;
    if (
      novoStatus === 'cancelado' &&
      !window.confirm(
        'Cancelar este pedido de demonstração? As grades reservadas serão devolvidas ao estoque.',
      )
    ) {
      return;
    }
    pedidos.alterarStatusPedido(botao.dataset.id, novoStatus);
    renderizarPagina(false);
    mostrarAviso(
      novoStatus === 'confirmado'
        ? 'Pedido confirmado e estoque reservado nesta demonstração.'
        : 'Status atualizado no pedido do cliente.',
    );
  }

  /**
   * Impede envios repetidos pelo seletor enquanto o arquivo é lido e armazenado.
   */
  async function receberComprovante(campo) {
    const arquivo = campo.files?.[0];
    if (!arquivo) return;
    campo.disabled = true;
    try {
      await anexos.anexarComprovante(campo.dataset.order, arquivo);
      renderizarPagina(false);
      mostrarAviso('Comprovante anexado. Ele já aparece na demonstração da área do cliente.');
    } catch (erro) {
      campo.value = '';
      mostrarAviso(erro.message, true);
    } finally {
      campo.disabled = false;
    }
  }

  /**
   * Apaga apenas a demonstração da loja, mantendo o checklist da reunião separado.
   */
  function reiniciarDemonstracao() {
    if (
      !window.confirm(
        'Reiniciar a demonstração? Isso apaga os pedidos de teste, anexos, favoritos e sacola deste protótipo, restaurando os exemplos iniciais. O checklist da reunião será preservado.',
      )
    ) {
      return;
    }
    armazenamento.reiniciarDemonstracao();
    estrutura.renderizarCabecalho();
    navegar('');
    mostrarAviso('Demonstração reiniciada.');
  }

  /**
   * Mapa entre as intenções do HTML e os serviços/telas responsáveis por executá-las.
   */
  const acoesDeClique = {
    'cart-open': () => {
      telaSacola.renderizarSacola();
      selecionar('#cart-dialog').showModal();
    },
    'cart-close': () => selecionar('#cart-dialog').close(),
    'close-on-navigate': () => selecionar('#cart-dialog').close(),
    browse: () => {
      selecionar('#cart-dialog').close();
      navegar('catalogo');
    },
    checkout: () => {
      selecionar('#cart-dialog').close();
      navegar('finalizar');
    },
    add: (botao) => adicionarNaSacola(botao.dataset.id),
    'add-detail': (botao) => {
      const saida = selecionar('#detail-quantity');
      adicionarNaSacola(botao.dataset.id, Number(saida.value || saida.textContent));
    },
    'detail-quantity': ajustarQuantidadeDoProduto,
    favorite: (botao) => alternarFavorito(botao.dataset.id),
    'cart-quantity': (botao) => {
      const quantidadeAtual = armazenamento.obterEstado().cart[botao.dataset.id] || 0;
      sacola.definirQuantidade(botao.dataset.id, quantidadeAtual + Number(botao.dataset.step));
      atualizarSacola();
    },
    'cart-remove': (botao) => {
      sacola.definirQuantidade(botao.dataset.id, 0);
      atualizarSacola();
    },
    'clear-filters': () => navegar('catalogo'),
    customer: (botao) => {
      const id = botao.dataset.id;
      navegar('painel' + (id ? '?cliente=' + encodeURIComponent(id) : ''));
    },
    status: atualizarStatus,
    message: (botao) => whatsapp.mostrarMensagemWhatsApp(botao.dataset.id, botao.dataset.kind),
    'message-close': () => selecionar('#message-dialog').close(),
    'remove-attachment': (botao) => {
      if (!window.confirm('Remover o comprovante de despacho deste pedido?')) return;
      anexos.removerComprovante(botao.dataset.id);
      renderizarPagina(false);
      mostrarAviso('Anexo removido.');
    },
    reset: reiniciarDemonstracao,
  };

  /**
   * Localiza o botão mesmo ao clicar num ícone interno; mantém a navegação normal dos links.
   */
  function tratarClique(evento) {
    const botao = evento.target.closest('[data-action]');
    if (!botao) {
      if (evento.target.closest('.skip-link')) {
        evento.preventDefault();
        selecionar('#conteudo').focus();
      }
      return;
    }
    if (botao.dataset.action !== 'close-on-navigate') evento.preventDefault();
    try {
      acoesDeClique[botao.dataset.action]?.(botao);
    } catch (erro) {
      mostrarAviso(erro.message, true);
    }
  }

  /**
   * Busca no cabeçalho muda a rota; fechamento valida o formulário antes de criar um pedido.
   */
  function tratarEnvio(evento) {
    const formulario = evento.target;
    if (formulario.id === 'header-search') {
      evento.preventDefault();
      const busca = String(new FormData(formulario).get('q') || '').trim();
      navegar('catalogo' + (busca ? '?q=' + encodeURIComponent(busca) : ''));
    }
    if (formulario.id === 'checkout-form') {
      evento.preventDefault();
      try {
        fechamento.enviarFormulario(formulario);
      } catch (erro) {
        mostrarAviso(erro.message, true);
      }
    }
  }

  /**
   * Digitação atualiza listas específicas e agenda o rascunho, evitando redesenhar a tela
   * inteira.
   */
  function tratarDigitacao(evento) {
    const campo = evento.target;
    if (campo.matches('input[data-filter]')) catalogo.atualizarFiltro(campo);
    if (campo.id === 'admin-search') painel.atualizarTabelaPedidos();
    const formulario = campo.closest('#checkout-form');
    if (formulario) {
      fechamento.atualizarAvisoEntrega();
      fechamento.agendarRascunho(formulario);
    }
  }

  /**
   * Atende seletores, checkbox, troca de cliente fictício e escolha de comprovante.
   */
  function tratarMudanca(evento) {
    const campo = evento.target;
    try {
      if (campo.matches('select[data-filter], input[type=checkbox][data-filter]')) {
        catalogo.atualizarFiltro(campo);
      }
      if (campo.id === 'admin-status') painel.atualizarTabelaPedidos();
      if (campo.id === 'demo-profile') {
        pedidos.selecionarCliente(campo.value);
        renderizarPagina(false);
      }
      if (campo.id === 'dispatch-file') receberComprovante(campo);
      const formulario = campo.closest('#checkout-form');
      if (formulario) {
        fechamento.atualizarAvisoEntrega();
        fechamento.salvarRascunho(formulario);
      }
    } catch (erro) {
      mostrarAviso(erro.message, true);
    }
  }

  /**
   * Registra os ouvintes uma única vez na inicialização. Trocar de página não os duplica.
   * O evento storage atualiza a outra aba da mesma origem; não sincroniza outros aparelhos.
   */
  function registrarEventos() {
    document.addEventListener('click', tratarClique);
    document.addEventListener('submit', tratarEnvio);
    document.addEventListener('input', tratarDigitacao);
    document.addEventListener('change', tratarMudanca);
    window.addEventListener('hashchange', () => {
      selecionar('#cart-dialog').close();
      selecionar('#message-dialog').close();
      renderizarPagina();
    });
    window.addEventListener('storage', (evento) => {
      if (evento.key === configuracao.CHAVE_ARMAZENAMENTO && evento.newValue) {
        armazenamento.carregarEstado();
        estrutura.renderizarCabecalho();
        renderizarPagina(false);
      }
    });
    // Tenta guardar o último preenchimento antes de a página ser descartada.
    window.addEventListener('pagehide', () => {
      const formulario = selecionar('#checkout-form');
      if (formulario) {
        try {
          fechamento.salvarRascunho(formulario);
        } catch {
          // A página pode estar sendo fechada; a falha não deve interromper o encerramento.
        }
      }
    });
  }

  window.LuaKids.eventos = { registrarEventos };
})();
