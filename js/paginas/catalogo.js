/**
 * Tela de catálogo e controle dos seus filtros; não grava pedidos ou altera estoque.
 * Módulo encapsulado: só os métodos listados no final ficam disponíveis em LuaKids.
 * Os scripts tradicionais preservam a abertura direta pelo index.html, sem instalação.
 */
(() => {
  'use strict';
  const LuaKids = window.LuaKids;
  const { selecionar, escaparHTML, normalizarTexto } = LuaKids.utilitarios;
  const { produtos } = LuaKids.demonstracao;
  const { lerRota } = LuaKids.navegacao;
  const { montarCaminho, montarEstadoVazio } = LuaKids.componentes;
  const { montarCartaoProduto } = LuaKids.cartaoProduto;

  /**
   * Monta um seletor rotulado com a opção atual selecionada. O atributo data-filter permite
   * ao controlador reconhecer qual filtro mudou.
   */
  function montarFiltro(name, label, options, current) {
    return /* HTML */ `<label class="filter-field"
      ><span>${escaparHTML(label)}</span
      ><select name="${name}" data-filter="${name}"
        >${options
          .map(
            ([value, text]) =>
              `<option value="${escaparHTML(value)}" ${current === value ? 'selected' : ''}>${escaparHTML(text)}</option>`,
          )
          .join('')}</select
      ></label
    >`;
  }

  /**
   * Monta a estrutura do catálogo e os filtros a partir da rota. Os resultados são inseridos
   * depois por atualizarResultadosCatalogo, preservando o foco no campo de busca.
   */
  function montarCatalogo() {
    const { params } = lerRota();
    return /* HTML */ `<div class="container"
      ><div class="page-heading"
        >${montarCaminho([['Catálogo']])}<p class="eyebrow">Feito para a sua seleção</p
        ><h1>Nosso catálogo</h1
        ><p
          >Escolha seus modelos em grades completas. O valor apresentado é sempre por grade; as
          cores são sortidas.</p
        ></div
      ><div class="catalog-layout"
        ><aside class="filters" aria-label="Filtros do catálogo"
          ><h2>Encontre o seu próximo favorito</h2
          ><label class="filter-field"
            ><span>Buscar modelo</span
            ><input
              type="search"
              id="catalog-search"
              data-filter="q"
              value="${escaparHTML(params.get('q') || '')}"
              placeholder="Nome ou tecido"
          /></label>
          ${montarFiltro(
            'categoria',
            'Categoria',
            [['', 'Todas'], ...['Vestidos', 'Conjuntos', 'Bebê'].map((x) => [x, x])],
            params.get('categoria') || '',
          )}
          ${montarFiltro(
            'tecido',
            'Tipo de tecido',
            [['', 'Todos'], ...['Tricoline', 'Algodão', 'Musseline'].map((x) => [x, x])],
            params.get('tecido') || '',
          )}
          ${montarFiltro(
            'preco',
            'Valor da grade',
            [
              ['', 'Todos os valores'],
              ['ate150', 'Até R$ 150'],
              ['150a200', 'R$ 150 a R$ 200'],
              ['mais200', 'Acima de R$ 200'],
            ],
            params.get('preco') || '',
          )}
          ${montarFiltro(
            'pecas',
            'Peças por grade',
            [
              ['', 'Todas'],
              ['3', '3 peças'],
              ['4', '4 peças'],
              ['5', '5 peças'],
            ],
            params.get('pecas') || '',
          )}
          <label class="check-inline"
            ><input
              type="checkbox"
              data-filter="premium"
              ${params.get('premium') === '1' ? 'checked' : ''}
            />
            Somente linha premium</label
          ><button class="text-link" data-action="clear-filters">Limpar filtros</button
          ><p class="filter-note"
            >As cores são enviadas de forma sortida. Não há escolha de cor individual.</p
          ></aside
        ><section aria-label="Produtos encontrados"
          ><div class="catalog-top"
            ><span id="catalog-count"></span
            ><label
              ><span class="visually-hidden">Ordenar produtos</span
              ><select data-filter="ordem"
                ><option value="">Nossa seleção</option
                ><option value="menor">Menor preço</option
                ><option value="maior">Maior preço</option
                ><option value="nome">Nome A–Z</option></select
              ></label
            ></div
          ><div class="product-grid" id="catalog-grid"></div></section></div
    ></div>`;
  }

  /**
   * Combina busca, categoria, tecido, quantidade por grade, premium e faixa de preço; aplica
   * a ordenação e atualiza somente a lista e o contador de modelos.
   */
  function atualizarResultadosCatalogo() {
    const grid = selecionar('#catalog-grid');
    if (!grid) return;
    const { params } = lerRota();
    const q = normalizarTexto(params.get('q'));
    let filtered = produtos.filter(
      (p) =>
        (!q || normalizarTexto(`${p.name} ${p.category} ${p.fabric}`).includes(q)) &&
        (!params.get('categoria') || p.category === params.get('categoria')) &&
        (!params.get('tecido') || p.fabric === params.get('tecido')) &&
        (!params.get('pecas') || p.sizes.length === Number(params.get('pecas'))) &&
        (params.get('premium') !== '1' || p.premium),
    );
    if (params.get('preco') === 'ate150') filtered = filtered.filter((p) => p.price <= 15000);
    if (params.get('preco') === '150a200')
      filtered = filtered.filter((p) => p.price > 15000 && p.price <= 20000);
    if (params.get('preco') === 'mais200') filtered = filtered.filter((p) => p.price > 20000);
    if (params.get('ordem') === 'menor') filtered.sort((a, b) => a.price - b.price);
    if (params.get('ordem') === 'maior') filtered.sort((a, b) => b.price - a.price);
    if (params.get('ordem') === 'nome')
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    const orderSelect = selecionar('[data-filter="ordem"]');
    if (orderSelect) orderSelect.value = params.get('ordem') || '';
    selecionar('#catalog-count').textContent =
      `${filtered.length} ${filtered.length === 1 ? 'modelo encontrado' : 'modelos encontrados'}`;
    grid.innerHTML = filtered.length
      ? filtered.map(montarCartaoProduto).join('')
      : montarEstadoVazio(
          'search',
          'Nenhum modelo por aqui.',
          'Experimente outro termo ou limpe os filtros para ver a seleção completa.',
          '<button class="button secondary" data-action="clear-filters">Limpar filtros</button>',
        );
  }

  /**
   * Grava um filtro nos parâmetros da rota sem recarregar a página. Atualiza os resultados
   * sem substituir o formulário em que o usuário está digitando.
   */
  function atualizarFiltro(field) {
    const { params } = lerRota();
    const value = field.type === 'checkbox' ? (field.checked ? '1' : '') : field.value;
    if (value) params.set(field.dataset.filter, value);
    else params.delete(field.dataset.filter);
    history.replaceState(null, '', '#/catalogo' + (params.size ? '?' + params.toString() : ''));
    atualizarResultadosCatalogo();
  }
  LuaKids.catalogo = { montarCatalogo, atualizarResultadosCatalogo, atualizarFiltro };
})();
