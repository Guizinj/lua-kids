/**
 * Regras locais da sacola: grades completas, total de peças e disponibilidade.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { obterEstado, alterarEstado } = LuaKids.armazenamento;
  const { encontrarProduto } = LuaKids.utilitarios;

  /**
   * Lê a sacola atual e combina cada identificador com os dados do catálogo. Retorna uma
   * lista com produto e quantidade de grades, sem alterar o armazenamento.
   */
  function listarItensSacola() {
    return Object.entries(obterEstado().cart)
      .map(([id, quantidade]) => ({ ...encontrarProduto(id), quantity: quantidade }))
      .filter((produto) => produto.id);
  }

  /**
   * Calcula subtotal em centavos, quantidade de grades e número de unidades. Cada tamanho da
   * composição representa uma unidade comercial; não há arredondamento de preços em reais.
   */
  function calcularTotaisSacola() {
    return listarItensSacola().reduce(
      (totais, item) => ({
        total: totais.total + item.price * item.quantity,
        pieces: totais.pieces + item.sizes.length * item.quantity,
        grades: totais.grades + item.quantity,
      }),
      { total: 0, pieces: 0, grades: 0 },
    );
  }

  /**
   * Acrescenta grades inteiras à sacola após verificar a disponibilidade local. A confirmação
   * do pedido continua sendo o momento de reservar estoque; adicionar não reserva.
   */
  function adicionarGrade(id, quantidade = 1) {
    const produto = encontrarProduto(id);
    if (!produto) return;
    const atual = obterEstado().cart[id] || 0;
    if (atual + quantidade > obterEstado().stock[id])
      throw new Error(
        'A quantidade ultrapassa o estoque demonstrativo disponível para este modelo.',
      );
    alterarEstado((copia) => {
      copia.cart[id] = atual + quantidade;
    });
  }
  /**
   * Define a quantidade total de grades de um modelo; zero remove o item sem reservar
   * estoque.
   */
  function definirQuantidade(id, quantidade) {
    if (quantidade > obterEstado().stock[id])
      throw new Error('Você atingiu o estoque disponível deste modelo na demonstração.');
    alterarEstado((copia) => {
      if (quantidade <= 0) delete copia.cart[id];
      else copia.cart[id] = quantidade;
    });
  }
  LuaKids.sacola = { listarItensSacola, calcularTotaisSacola, adicionarGrade, definirQuantidade };
})();
