/**
 * Dados de demonstração isolados da interface. Futuramente o catálogo virá do Supabase.
 */
window.LuaKids.demonstracao = (() => {
  /**
   * Catálogo fictício: price usa centavos, sizes define uma unidade por tamanho e stock usa
   * grades.
   * As propriedades em inglês são o contrato de dados já gravado; não renomeá-las sem
   * migração.
   */
  const produtos = [
    {
      id: 'vestido-flor-de-lua',
      name: 'Vestido Flor de Lua',
      category: 'Vestidos',
      fabric: 'Tricoline',
      premium: true,
      price: 15960,
      sizes: ['2', '4', '6', '8'],
      stock: 8,
      sold: 32,
      image: 'dress',
      tag: 'Queridinho',
      description:
        'Delicado nos detalhes e leve para o dia a dia. Vestido com mangas fofinhas, cintura franzida e um toque de bordado que encanta.',
      details: [
        'Modelagem infantil confortável',
        'Mangas curtas com volume suave',
        'Grade fechada: uma unidade de cada tamanho',
      ],
    },
    {
      id: 'conjunto-brisa',
      name: 'Conjunto Brisa',
      category: 'Conjuntos',
      fabric: 'Algodão',
      premium: false,
      price: 13960,
      sizes: ['2', '4', '6', '8'],
      stock: 12,
      sold: 46,
      image: 'set',
      tag: 'Essencial',
      description:
        'Um conjunto fresquinho para acompanhar as pequenas descobertas. Camisa e short com textura suave e modelagem soltinha.',
      details: [
        'Conjunto com camisa e short',
        'Uma unidade do modelo por tamanho',
        'Cores enviadas de forma sortida',
      ],
    },
    {
      id: 'macacao-aconchego',
      name: 'Macacão Aconchego',
      category: 'Bebê',
      fabric: 'Musseline',
      premium: false,
      price: 11960,
      sizes: ['P', 'M', 'G', 'GG'],
      stock: 7,
      sold: 24,
      image: 'romper',
      tag: 'Para os pequenos',
      description:
        'Textura macia, tons delicados e liberdade para brincar. Um macacão com o aconchego que os primeiros momentos merecem.',
      details: [
        'Tecido leve e macio',
        'Botões com acabamento delicado',
        'Uma unidade de cada tamanho da grade',
      ],
    },
    {
      id: 'vestido-jardim',
      name: 'Vestido Jardim',
      category: 'Vestidos',
      fabric: 'Tricoline',
      premium: false,
      price: 14960,
      sizes: ['4', '6', '8', '10'],
      stock: 5,
      sold: 18,
      image: 'dress',
      tag: '',
      description:
        'Uma proposta delicada para compor a seleção da sua loja. A imagem é ilustrativa; fotos e informações reais serão cadastradas depois.',
      details: [
        'Grade infantil com quatro tamanhos',
        'Acabamento delicado',
        'Cores sortidas, sem escolha individual',
      ],
    },
    {
      id: 'conjunto-essencia',
      name: 'Conjunto Essência',
      category: 'Conjuntos',
      fabric: 'Algodão',
      premium: true,
      price: 21950,
      sizes: ['4', '6', '8', '10', '12'],
      stock: 6,
      sold: 27,
      image: 'set',
      tag: 'Linha premium',
      description:
        'Uma seleção de conjuntos para completar a vitrine. Conforto, detalhes suaves e uma grade com cinco tamanhos.',
      details: [
        'Conjunto com camisa e short',
        'Uma unidade do modelo por tamanho',
        'Cinco tamanhos em cada grade',
      ],
    },
    {
      id: 'macacao-primeiros-passos',
      name: 'Macacão Primeiros Passos',
      category: 'Bebê',
      fabric: 'Musseline',
      premium: true,
      price: 10470,
      sizes: ['P', 'M', 'G'],
      stock: 9,
      sold: 16,
      image: 'romper',
      tag: '',
      description:
        'Uma grade compacta para os primeiros looks. Peças delicadas e confortáveis para uma seleção cheia de carinho.',
      details: [
        'Grade com três tamanhos',
        'Modelagem para bebê',
        'Tons e fotos apenas ilustrativos nesta prévia',
      ],
    },
  ];
  /**
   * Cria uma cópia nova dos exemplos a cada inicialização/reinício. Os pedidos confirmados e
   * enviados já consideram o estoque disponível indicado; nenhum exemplo representa uma venda
   * real.
   */
  function criarEstadoInicial() {
    const customerA = {
      id: 'demo-ana',
      name: 'Ana Oliveira',
      phone: '(81) 90000-0001',
      cep: '55000-000',
      street: 'Rua Exemplo',
      number: '120',
      neighborhood: 'Centro',
      city: 'Caruaru',
      uf: 'PE',
      complement: '',
    };
    const customerB = {
      id: 'demo-beatriz',
      name: 'Beatriz Santos',
      phone: '(81) 90000-0002',
      cep: '55190-000',
      street: 'Avenida Demonstração',
      number: '45',
      neighborhood: 'Centro',
      city: 'Santa Cruz do Capibaribe',
      uf: 'PE',
      complement: '',
    };
    // Copia preço e composição para preservar o histórico do pedido.
    const item = (id, quantity) => {
      const p = produtos.find((p) => p.id === id);
      return {
        productId: id,
        name: p.name,
        price: p.price,
        sizes: [...p.sizes],
        image: p.image,
        quantity,
      };
    };
    // Monta os exemplos com datas relativas, subtotal e entrega local ou a combinar.
    const order = (id, customer, items, status, days, reserved) => {
      const createdAt = new Date(Date.now() - days * 86400000).toISOString();
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const pieces = items.reduce((sum, i) => sum + i.sizes.length * i.quantity, 0);
      const local = customer.city === 'Caruaru' && customer.uf === 'PE';
      return {
        id,
        customer: { ...customer },
        items,
        total,
        pieces,
        status,
        reserved,
        createdAt,
        delivery: {
          type: local ? 'local' : 'third-party',
          fee: local ? 0 : null,
          preference: local ? '' : 'Loteiro a combinar',
          notes: '',
        },
        timeline: [
          { status: 'aguardando', at: createdAt },
          ...(status !== 'aguardando'
            ? [{ status, at: new Date(Date.now() - (days - 1) * 86400000).toISOString() }]
            : []),
        ],
        attachment: null,
      };
    };
    return {
      version: 1,
      cart: {},
      favorites: [],
      checkoutDraft: {},
      profile: { ...customerA },
      stock: Object.fromEntries(produtos.map((p) => [p.id, p.stock])),
      sold: Object.fromEntries(produtos.map((p) => [p.id, p.sold])),
      orders: [
        order(
          'LK-DEMO-1003',
          customerA,
          [item('vestido-flor-de-lua', 2), item('macacao-primeiros-passos', 1)],
          'aguardando',
          1,
          false,
        ),
        order(
          'LK-DEMO-1002',
          customerB,
          [item('conjunto-brisa', 2), item('vestido-jardim', 1)],
          'confirmado',
          3,
          true,
        ),
        order('LK-DEMO-1001', customerA, [item('conjunto-essencia', 2)], 'enviado', 6, true),
      ],
    };
  }
  return { produtos, criarEstadoInicial };
})();
