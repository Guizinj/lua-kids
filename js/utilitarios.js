/**
 * Utilitários de DOM, texto, valores, datas e caminhos de imagens.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;

  /**
   * Seleciona o primeiro elemento dentro de document ou de um elemento informado.
   */
  const selecionar = (selector, root = document) => root.querySelector(selector);
  /**
   * Retorna uma lista comum, permitindo usar map/filter nos elementos encontrados.
   */
  const selecionarTodos = (selector, root = document) => [...root.querySelectorAll(selector)];
  /**
   * Escapa texto para os contextos de HTML usados nos templates. Não autoriza dados no banco.
   */
  const escaparHTML = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  /**
   * Recebe centavos inteiros e formata o valor em reais somente na apresentação.
   */
  const formatarDinheiro = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
  /**
   * Formata o instante ISO do pedido no idioma brasileiro, sem alterar o dado armazenado.
   */
  const formatarData = (value) =>
    new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  /**
   * Remove máscara do telefone para comparação de perfis e montagem do link de atendimento.
   */
  const somenteDigitos = (value) => String(value || '').replace(/\D/g, '');
  /**
   * Ignora acentos, caixa e espaços nas buscas e na comparação da cidade de entrega.
   */
  const normalizarTexto = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  /**
   * Procura um modelo sem copiar seus dados. O catálogo é inicializado antes do primeiro uso.
   */
  const encontrarProduto = (id) => LuaKids.demonstracao.produtos.find((item) => item.id === id);
  /**
   * Converte os identificadores de imagem já salvos em pedidos nos novos caminhos em
   * português.
   * Manter as chaves antigas evita quebrar o histórico e a sacola existentes no navegador.
   */
  const caminhoImagem = (name) => {
    const arquivos = {
      hero: 'colecao-infantil',
      dress: 'vestido',
      set: 'conjunto',
      romper: 'macacao',
    };
    return 'recursos/imagens/' + (arquivos[name] || 'colecao-infantil') + '.png';
  };

  LuaKids.utilitarios = {
    selecionar,
    selecionarTodos,
    escaparHTML,
    formatarDinheiro,
    formatarData,
    somenteDigitos,
    normalizarTexto,
    encontrarProduto,
    caminhoImagem,
  };
})();
