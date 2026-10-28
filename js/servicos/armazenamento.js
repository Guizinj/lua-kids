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
   * Migração aditiva: os dados globais antigos pertencem só ao perfil então ativo.
   * Não altera pedidos/anexos; accountRevision independe da versão legada do estado.
   */
  function prepararContas(salvo) {
    const chave = salvo.profile.id || 'visitante';
    if (salvo.accountRevision !== 2) {
      salvo.favoritesByCustomer = { [chave]: [...salvo.favorites] };
      salvo.draftsByCustomer = { [chave]: { ...salvo.checkoutDraft } };
      salvo.addressesByCustomer = {};
      if (salvo.profile.street && salvo.profile.city && salvo.profile.uf) {
        const campos = ['cep', 'city', 'uf', 'street', 'number', 'neighborhood', 'complement'];
        salvo.addressesByCustomer[chave] = Object.fromEntries(
          campos.map((campo) => [campo, salvo.profile[campo] || '']),
        );
      }
      salvo.customersById = Object.fromEntries(
        salvo.orders.map(({ customer }) => [
          customer.id,
          { id: customer.id, name: customer.name, phone: customer.phone },
        ]),
      );
      if (salvo.profile.id)
        salvo.customersById[chave] = {
          id: salvo.profile.id,
          name: salvo.profile.name,
          phone: salvo.profile.phone,
        };
      salvo.accountRevision = 2;
    }
    salvo.favorites = [...(salvo.favoritesByCustomer[chave] || [])];
    salvo.checkoutDraft = { ...(salvo.draftsByCustomer[chave] || {}) };
    return salvo;
  }
  /**
   * Restaura o mesmo formato antigo; se o navegador bloquear o armazenamento, usa memória e
   * avisa.
   */
  function carregarEstado() {
    const inicial = criarEstadoInicial();
    estado = null;
    armazenamentoDisponivel = true;
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
          if (
            !encontrarProduto(id) ||
            !Number.isInteger(estado.cart[id]) ||
            estado.cart[id] < 1
          )
            delete estado.cart[id];
      } else estado = inicial;
      prepararContas(estado);
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(estado));
    } catch {
      // Se apenas a gravação falhou (por exemplo, limite ao migrar), conserva os
      // registros já recuperados em memória em vez de substituí-los por exemplos.
      estado = estado || prepararContas(inicial);
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
    alterarEstado((copia) => {
      for (const chave of Object.keys(copia)) delete copia[chave];
      Object.assign(copia, prepararContas(criarEstadoInicial()));
    });
  }

  LuaKids.armazenamento = { carregarEstado, obterEstado, alterarEstado, reiniciarDemonstracao };
})();
