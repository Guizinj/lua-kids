/**
 * No celular, move os mesmos campos do catálogo para um diálogo. Não duplica IDs
 * nem perde os filtros; as alterações só são aplicadas ao confirmar o painel.
 */
(() => {
  'use strict';
  let origem;
  let aoFechar;

  function abrirFiltros() {
    window.LuaKids.dialogos.fecharTodos();
    const campos = document.querySelector('#campos-filtros');
    if (!campos) return;
    origem = campos.parentElement;
    const dialogo = document.querySelector('#painel-filtros');
    dialogo.querySelector('.conteudo-filtros').append(campos);
    // Descartar/fechar restaura as escolhas efetivamente aplicadas na URL.
    aoFechar = () => {
      if (origem?.isConnected) origem.append(campos);
      else campos.remove();
      const { params } = window.LuaKids.navegacao.lerRota();
      campos.querySelectorAll('[data-filter]').forEach((campo) => {
        if (campo.type === 'checkbox') campo.checked = params.get(campo.dataset.filter) === '1';
        else campo.value = params.get(campo.dataset.filter) || '';
      });
      document.querySelector('[data-action="filtros-abrir"]')?.focus({ preventScroll: true });
    };
    dialogo.addEventListener('close', aoFechar, { once: true });
    dialogo.showModal();
    // Cada abertura começa no primeiro campo; cabeçalho e ações não participam da rolagem.
    dialogo.querySelector('.conteudo-filtros').scrollTop = 0;
  }

  /** Coleta somente o formulário móvel, publica os filtros e focaliza os resultados. */
  function aplicarFiltros(limpar = false) {
    const { params } = window.LuaKids.navegacao.lerRota();
    document.querySelectorAll('#painel-filtros [data-filter]').forEach((campo) => {
      const valor = limpar
        ? ''
        : campo.type === 'checkbox'
          ? campo.checked
            ? '1'
            : ''
          : campo.value.trim();
      if (valor) params.set(campo.dataset.filter, valor);
      else params.delete(campo.dataset.filter);
    });
    if (limpar) for (const chave of [...params.keys()]) params.delete(chave);
    history.replaceState(null, '', '#/catalogo' + (params.size ? '?' + params.toString() : ''));
    // Restaura os campos já com a URL nova, antes de atualizar o contador e a lista.
    document.querySelector('#painel-filtros').close();
    window.LuaKids.catalogo.atualizarResultadosCatalogo();
    window.LuaKids.catalogo.rolarParaResultados();
  }

  window.LuaKids.painelFiltros = { abrirFiltros, aplicarFiltros };
})();
