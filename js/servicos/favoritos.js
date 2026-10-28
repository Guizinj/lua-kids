/**
 * Favoritos da demonstração, guardados no navegador.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { obterEstado, alterarEstado } = LuaKids.armazenamento;

  /**
   * Alterna a presença do identificador sem duplicar o modelo. Retorna a situação após
   * salvar.
   */
  function alternarFavorito(id) {
    alterarEstado((copia) => {
      copia.favorites = copia.favorites.includes(id)
        ? copia.favorites.filter((item) => item !== id)
        : [...copia.favorites, id];
    });
    return obterEstado().favorites.includes(id);
  }

  LuaKids.favoritos = { alternarFavorito };
})();
