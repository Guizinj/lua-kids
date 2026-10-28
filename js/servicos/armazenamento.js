/**
 * Estado local da demonstração; não é banco, autenticação ou transação de produção.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { CHAVE_ARMAZENAMENTO } = LuaKids.configuracao;
  const { criarEstadoInicial } = LuaKids.demonstracao;
  const { encontrarProduto } = LuaKids.utilitarios;

  let estado;
  let armazenamentoDisponivel = true;
  /**
   * Restaura o mesmo formato antigo; se o navegador bloquear o armazenamento, usa memória e
   * avisa.
   */
  function carregarEstado() {
    const inicial = criarEstadoInicial();
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO) || 'null');
      if (
        salvo &&
        salvo.version === 1 &&
        Array.isArray(salvo.orders) &&
        salvo.cart &&
        salvo.stock &&
        salvo.profile &&
        Array.isArray(salvo.favorites)
      ) {
        estado = { ...inicial, ...salvo };
        for (const id of Object.keys(estado.cart))
          if (!encontrarProduto(id) || !Number.isInteger(estado.cart[id]) || estado.cart[id] < 1)
            delete estado.cart[id];
      } else estado = inicial;
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(estado));
    } catch {
      estado = inicial;
      armazenamentoDisponivel = false;
      if (!document.querySelector('.storage-warning')) {
        const aviso = document.createElement('div');
        aviso.className = 'storage-warning';
        aviso.textContent =
          'O salvamento local está indisponível. Esta demonstração será mantida somente enquanto a página estiver aberta.';
        document.body.append(aviso);
      }
    }
  }
  /**
   * Lê o estado atual. As alterações devem passar por alterarEstado, não por mutação direta.
   */
  function obterEstado() {
    return estado;
  }
  /**
   * Altera uma cópia e salva antes de substituir o estado em memória. Se a função ou gravação
   * falhar,
   * descarta a cópia. Isso evita movimentos parciais nesta sessão; não resolve concorrência
   * real.
   * @param {Function} alterar Função que recebe e modifica somente a cópia do estado.
   */
  function alterarEstado(alterar) {
    const copia = JSON.parse(JSON.stringify(estado));
    alterar(copia);
    if (armazenamentoDisponivel) {
      try {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(copia));
      } catch {
        throw new Error(
          'Não foi possível salvar. O armazenamento pode estar cheio. Tente um anexo menor ou reinicie os dados de demonstração.',
        );
      }
    }
    estado = copia;
  }
  /**
   * Restaura os exemplos só na chave da loja. O checklist da reunião usa outra chave e é
   * preservado.
   */
  function reiniciarDemonstracao() {
    alterarEstado((copia) => Object.assign(copia, criarEstadoInicial()));
  }

  LuaKids.armazenamento = { carregarEstado, obterEstado, alterarEstado, reiniciarDemonstracao };
})();
