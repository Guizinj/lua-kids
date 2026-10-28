/**
 * Controladores da interface.
 * O HTML declara intenções com data-action e data-filter. Um conjunto de ouvintes
 * no document atende também os elementos que são reconstruídos ao trocar de tela.
 * Cada ação delega os cálculos e a gravação aos serviços, depois atualiza a interface.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;

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
    const posicaoCarrossel = selecionar('#lista-mais-vendidos')?.scrollLeft;
    renderizarPagina(false);
    const carrossel = selecionar('#lista-mais-vendidos');
    if (carrossel && posicaoCarrossel !== undefined) {
      carrossel.scrollLeft = posicaoCarrossel;
      LuaKids.maisVendidos.atualizarControles();
    }
    window.scrollTo(0, posicao);
    mostrarAviso(
      selecionado ? 'Modelo guardado nos favoritos.' : 'Modelo removido dos favoritos.',
    );
  }

  /**
   * Cancela apenas após a confirmação da pessoa; o serviço protege a reserva local.
   */
  function atualizarStatus(botao) {
    const novoStatus = botao.dataset.status;
    const aplicar = () => {
      pedidos.alterarStatusPedido(botao.dataset.id, novoStatus);
      renderizarPagina(false);
      mostrarAviso(
        novoStatus === 'confirmado'
          ? 'Pedido confirmado e estoque reservado nesta demonstração.'
          : novoStatus === 'cancelado'
            ? 'Pedido cancelado. A reserva existente foi devolvida.'
            : 'Status atualizado no pedido do cliente.',
      );
    };
    if (novoStatus === 'cancelado') {
      LuaKids.dialogos.abrir({
        titulo: 'Cancelar este pedido?',
        texto:
          'Esta ação cancela o pedido demonstrativo. Se houver grades reservadas, elas serão devolvidas ao estoque uma única vez.',
        confirmar: 'Cancelar pedido',
        perigo: true,
        acao: aplicar,
      });
      return;
    }
    aplicar();
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
    LuaKids.dialogos.abrir({
      titulo: 'Reiniciar a demonstração?',
      texto:
        'Isso apaga os pedidos de teste, anexos, favoritos, endereços e sacola, restaurando os exemplos iniciais. O checklist da reunião será preservado.',
      confirmar: 'Reiniciar',
      perigo: true,
      acao: () => {
        armazenamento.reiniciarDemonstracao();
        estrutura.renderizarCabecalho();
        navegar('');
        mostrarAviso('Demonstração reiniciada.');
      },
    });
  }

  /**
   * Mapa entre as intenções do HTML e os serviços/telas responsáveis por executá-las.
   */
  const acoesDeClique = {
    'mais-vendidos-rolar': (botao) =>
      LuaKids.maisVendidos.rolarMaisVendidos(Number(botao.dataset.step)),
    'menu-abrir': () => LuaKids.menu.abrirMenu(),
    'menu-fechar': () => LuaKids.menu.fecharMenu(),
    'dialogo-voltar': () => LuaKids.dialogos.voltar(),
    'dialogo-confirmar': () => LuaKids.dialogos.confirmar(),
    'filtros-abrir': () => LuaKids.painelFiltros.abrirFiltros(),
    'filtros-fechar': () => selecionar('#painel-filtros').close(),
    'filtros-aplicar': () => LuaKids.painelFiltros.aplicarFiltros(),
    'filtros-limpar': () => LuaKids.painelFiltros.aplicarFiltros(true),
    'aviso-entrega': () => fechamento.mostrarAvisoEntrega(true),
    'depoimentos-rolar': (botao) =>
      LuaKids.depoimentos.rolarDepoimentos(Number(botao.dataset.step)),
    'cart-open': () => {
      LuaKids.dialogos.fecharTodos();
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
    'clear-filters': () =>
      selecionar('#painel-filtros').open
        ? LuaKids.painelFiltros.aplicarFiltros(true)
        : navegar('catalogo'),
    customer: (botao) => {
      botao.focus({ preventScroll: true });
      painel.filtrarPorCliente(botao.dataset.id);
    },
    status: atualizarStatus,
    message: (botao) => whatsapp.mostrarMensagemWhatsApp(botao.dataset.id, botao.dataset.kind),
    'message-close': () => selecionar('#message-dialog').close(),
    'remove-attachment': (botao) => {
      LuaKids.dialogos.abrir({
        titulo: 'Remover comprovante?',
        texto: 'O comprovante de despacho deixará de aparecer neste pedido demonstrativo.',
        confirmar: 'Remover anexo',
        perigo: true,
        acao: () => {
          anexos.removerComprovante(botao.dataset.id);
          renderizarPagina(false);
          mostrarAviso('Anexo removido.');
        },
      });
    },
    reset: reiniciarDemonstracao,
  };

  /**
   * Localiza o botão mesmo ao clicar num ícone interno; mantém a navegação normal dos links.
   */
  function tratarClique(evento) {
    const botao = evento.target.closest('[data-action]');
    if (!botao) {
      const linkMenu = evento.target.closest('#menu-lateral a');
      if (linkMenu) LuaKids.menu.fecharMenu();
      // Repetir um destino não dispara hashchange, por isso o menu fecha pelo clique.
      const mesmoDestino = evento.target.closest('a[href^="#/"]');
      if (mesmoDestino && mesmoDestino.hash === location.hash && !linkMenu) {
        evento.preventDefault();
        renderizarPagina();
      }
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
    if (formulario.id === 'header-search' || formulario.id === 'menu-search') {
      evento.preventDefault();
      const busca = String(new FormData(formulario).get('q') || '').trim();
      LuaKids.dialogos.fecharTodos();
      catalogo.solicitarRolagem();
      navegar('catalogo' + (busca ? '?q=' + encodeURIComponent(busca) : ''));
    }
    if (formulario.id === 'formulario-endereco') {
      evento.preventDefault();
      if (!formulario.reportValidity()) return;
      try {
        LuaKids.contas.salvarEndereco(Object.fromEntries(new FormData(formulario)));
        mostrarAviso('Endereço salvo para este perfil demonstrativo.');
      } catch (erro) {
        mostrarAviso(erro.message, true);
      }
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
        estrutura.renderizarCabecalho();
        renderizarPagina(false);
      }
      if (campo.id === 'dispatch-file') receberComprovante(campo);
      const formulario = campo.closest('#checkout-form');
      if (formulario) {
        fechamento.atualizarAvisoEntrega();
        fechamento.salvarRascunho(formulario);
        if (campo.name === 'uf') fechamento.mostrarAvisoEntrega();
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
    // invalid não propaga: a captura abre os campos recolhidos antes de o navegador
    // mostrar a mensagem e focalizar o primeiro erro. Não desativa a validação nativa.
    document.addEventListener(
      'invalid',
      (evento) => {
        const etapa = evento.target.closest('#checkout-form .etapa-fechamento');
        if (etapa) etapa.open = true;
      },
      true,
    );
    document.addEventListener('input', tratarDigitacao);
    document.addEventListener('change', tratarMudanca);
    document.addEventListener(
      'scroll',
      (evento) => {
        if (evento.target.id === 'lista-mais-vendidos')
          LuaKids.maisVendidos.atualizarControles();
      },
      true,
    );
    window.addEventListener('resize', () => LuaKids.maisVendidos.atualizarControles(), {
      passive: true,
    });
    document.addEventListener('focusout', (evento) => {
      if (evento.target.matches('#checkout-form [name="city"]'))
        fechamento.mostrarAvisoEntrega();
    });
    document.addEventListener('keydown', (evento) => {
      if (
        evento.key === 'Enter' &&
        evento.target.id === 'catalog-search' &&
        !evento.target.closest('#painel-filtros')
      ) {
        evento.preventDefault();
        catalogo.atualizarFiltro(evento.target);
        catalogo.rolarParaResultados();
      }
    });
    // Mantém o fundo imóvel e o botão flutuante oculto durante qualquer diálogo.
    const atualizarModais = () => {
      const aberto = Boolean(document.querySelector('dialog[open]'));
      document.documentElement.classList.toggle('modal-aberto', aberto);
      selecionar('[data-action="menu-abrir"]')?.setAttribute(
        'aria-expanded',
        String(selecionar('#menu-lateral').open),
      );
    };
    document.querySelectorAll('dialog').forEach((dialogo) => {
      new MutationObserver(atualizarModais).observe(dialogo, {
        attributes: true,
        attributeFilter: ['open'],
      });
      dialogo.addEventListener('close', atualizarModais);
      dialogo.addEventListener('click', (evento) => {
        if (evento.target !== dialogo) return;
        const retangulo = dialogo.getBoundingClientRect();
        if (
          evento.clientX < retangulo.left ||
          evento.clientX > retangulo.right ||
          evento.clientY < retangulo.top ||
          evento.clientY > retangulo.bottom
        )
          dialogo.close();
      });
    });
    matchMedia('(min-width: 761px)').addEventListener('change', (evento) => {
      if (evento.matches) selecionar('#painel-filtros').close();
    });
    window.addEventListener('hashchange', () => {
      const formularioAnterior = selecionar('#checkout-form');
      if (formularioAnterior && formularioAnterior.dataset.enviado !== 'true') {
        try {
          fechamento.salvarRascunho(formularioAnterior);
        } catch (erro) {
          mostrarAviso(erro.message, true);
        }
      }
      LuaKids.dialogos.fecharTodos();
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
