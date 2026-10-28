# Lua Kids · contexto e continuidade

Atualizado em 28/10/2026. Este documento registra o contexto necessário para continuar o projeto nesta conversa ou com outra IA. As decisões mais recentes do usuário prevalecem sobre respostas amplas ou ambíguas do checklist.

Proteções, testes e critérios para publicação: [guia de segurança](SEGURANCA.md). Consulte-o ao alterar acessos, banco, pedidos ou anexos e registre as evidências pertinentes; as decisões comerciais e pendências permanecem neste contexto.

## Objetivo e tecnologias

Criar uma loja de moda infantil no atacado para a Lua Kids, de Caruaru/PE, com HTML, CSS e JavaScript puro e futura integração com Supabase. A primeira entrega é uma versão navegável para o usuário analisar antes de avançar.

O usuário é o desenvolvedor. O dono fornecerá os materiais e arcará com os custos recorrentes. A previsão informada é dezembro de 2026, sem dia definido. Orçamento, prazo de suporte e condições finais de entrega não foram fechados.

## Fontes e referências

- Miguxas e Miguxos Kids: https://miguxasemiguxoskids.com.br/c/principal
- July Baby Atacado: https://julybabyatacado.vendizap.com/
- Checklist preparado no projeto: `checklist-reuniao.html`.
- Respostas da reunião de 27/10/2026: PDF fornecido pelo usuário, chamado “Lua Kids · Checklist de reunião.pdf”, originalmente na pasta Downloads. Não depende desse caminho para executar o protótipo.
- A estrutura textual da primeira referência foi acessada. O conteúdo dinâmico da July Baby não ficou disponível na ferramenta de consulta; suas regras não foram verificadas diretamente. Não presumir que as regras de outra loja sejam as da Lua Kids.

O dono destacou grades, cores sortidas, conta para incentivar retorno, filtros, informação sobre quantidades vendidas, histórico de pedidos e comprovante do despacho. O desenvolvedor refinou as regras de frete e reduziu o painel administrativo depois da reunião.

## Decisões de negócio confirmadas

### Catálogo, preços e compra

- Venda somente em grades fechadas na primeira versão. Venda avulsa ficou fora.
- Cada grade inclui uma unidade do modelo por tamanho da composição cadastrada.
- Os preços são por grade, e isso precisa ficar evidente no catálogo, produto, sacola e pedido.
- Pedido mínimo de **10 peças no total**, somando as grades inteiras. Não foi definido mínimo em reais.
- Cores sortidas, sem escolha individual. Composição e aviso devem ser explícitos.
- Fotos, descrições, tamanhos e estoques reais ainda serão fornecidos. O desenvolvedor fará o cadastro inicial e os ajustes pelo Supabase.
- Filtros desejados: categoria, tecido, linha premium, valor e quantidade por grade. O filtro de cor foi omitido no protótipo para não sugerir escolha de uma cor em grades sortidas; confirmar esse detalhe na avaliação.
- Contagem de vendidos foi solicitada. No protótipo é explicitamente ilustrativa e expressa em **grades**; aumenta quando um pedido é confirmado e diminui se essa reserva é cancelada. Confirmar critério real antes da produção.
- Pagamento será tratado pelo WhatsApp. Não há gateway de pagamento contratado para a V1. As formas, parcelas e condições exatas devem ser fornecidas pela loja.
- Sem cupons ou descontos no lançamento. Essas funções ficam para depois.
- WhatsApp provisório da loja: **(81) 98116-4812**; formato internacional `5581981164812`. Ainda confirmar se será o contato definitivo.

### Entrega e frete

- Base: Caruaru, Pernambuco.
- Entrega **gratuita para o cliente em Caruaru/PE**, custeada pelo dono.
- Não haverá retirada na loja nesta versão.
- Nas cidades próximas, o cliente paga o transporte de um loteiro. Cerca de R$ 30 foi um exemplo aproximado, e não uma tabela aprovada.
- Para outras cidades/estados, o transporte costuma ser escolhido/pago pelo cliente. O dono despacha no loteiro ou na transportadora e anexa o comprovante.
- Na V1, qualquer destino fora de Caruaru/PE fica com **“Frete a combinar, por conta do cliente”**. O valor não é inventado, não é somado como frete zero e não existe cálculo por distância.
- Pode ser informado o loteiro ou transportadora de preferência, para combinar no atendimento.
- O anexo é o comprovante/foto de **despacho**, não uma confirmação automática de que o cliente recebeu a mercadoria.
- Prazo de preparação, modalidades específicas e condições de entrega serão combinados com a loja.

### Clientes, pedidos e estoque

- Desejados: conta do cliente, histórico, favoritos e acompanhamento do pedido, incluindo anexo de despacho.
- Login continua **pendente**. O dono preferiu telefone e senha; o desenvolvedor verificará a conveniência, integração e custo de mensagens antes de decidir. E-mail e senha foi considerado, mas **não foi aprovado como escolha final**.
- Com login real, o fechamento deve recuperar nome e contato da conta, sem exigir novo preenchimento da etapa “Quem está comprando?”. Mostrar apenas um resumo (“Comprando como…”) com opção de editar e solicitar somente dados necessários que estiverem faltando. O formulário atual dessa etapa atende à demonstração sem login.
- Não criar login fictício como se fosse seguro nem colocar o protótipo aberto em produção com dados de clientes.
- Pedido nasce aguardando confirmação, sem reserva do estoque.
- O dono confirma manualmente no painel, verifica disponibilidade e combina pagamento; a confirmação reserva as grades.
- Cancelamento de pedido confirmado ou em preparação devolve a reserva. Após despacho, não existe cancelamento simples no protótipo; mudanças nesse fluxo dependerão da operação real.
- Vendas de outros canais terão atualização manual. Nenhuma integração com ERP, emissão fiscal ou transportadoras foi contratada.
- A atualização no site acontece pelo status do pedido. O aviso de WhatsApp usa **botão com mensagem pronta**, aberto e enviado manualmente pelo dono. Não há disparo automático por API.

## Painel: limite explícito da primeira versão

O usuário corrigiu e confirmou este escopo. A V1 do painel serve para:

1. Consultar clientes e históricos individuais.
2. Abrir detalhes e endereços dos pedidos.
3. Confirmar ou cancelar pedidos.
4. Atualizar o andamento.
5. Anexar e consultar comprovantes de despacho.
6. Abrir mensagem pronta no WhatsApp.

Dois administradores previstos: desenvolvedor e dono. **Cadastro de produtos, edição manual de estoque, categorias, banners e cupons pelo painel ficam para uma etapa futura.** Não reintroduzir essas funções como obrigação da V1. A confirmação/cancelamento continua movimentando a reserva de estoque pelo sistema, sem uma tela de edição manual.

## Identidade visual

- O usuário escolheu uma direção leve e delicada.
- Após avaliar a prévia, aprovou títulos e chamadas com Nunito 700/800 para um toque mais kids. Fonte WOFF2 local e licença em `recursos/fontes/`; textos, preços, formulários e botões mantêm Segoe UI/Arial. A imagem da marca e sua assinatura tipográfica foram preservadas.
- Depois enviou uma logo JPG: “Lua kids” em rosé, lua crescente e laço rosa, sobre círculo claro com fundo escuro.
- Paleta derivada da marca: creme/branco, rosé, rosa nos destaques e grafite nos textos. A paleta provisória lilás/menta foi substituída pela referência real da logo.
- Logo original preservada em `recursos/imagens/logo-original.jpg`. A apresentação circular é feita em CSS, sem recriar a marca.
- As imagens do banner e dos produtos são ilustrativas, geradas por IA e salvas localmente. Não são fotos de estoque real nem imagens copiadas das referências.
- A mesma foto é reutilizada em alguns modelos fictícios. Os nomes, tecidos, preços e tamanhos são exemplos para avaliar a interface.

## Implementação desta entrega

- Aplicação estática sem framework, instalação ou build. `index.html` carrega os módulos em `js/` e os estilos em `estilos/`, na ordem declarada no documento.
- Navegação por hash: início, catálogo, produto, fechamento, favoritos, pedidos, detalhe do pedido, como comprar e painel demonstrativo.
- Catálogo com seis produtos fictícios; busca, categoria, tecido, premium, faixa de preço, peças por grade e ordenação.
- Favoritos e sacola persistem no navegador. Grades são incrementadas inteiras e o mínimo é calculado a partir da composição de cada modelo.
- Fechamento coleta dados fictícios e endereço, identifica Caruaru/PE e registra pedido demonstrativo sem pagamento.
- Painel e área do cliente usam os mesmos registros locais. A troca de perfil existe exclusivamente para avaliar a navegação, sem autenticação.
- Status usados: `aguardando`, `confirmado`, `preparando`, `enviado`, `entregue`, `cancelado`. A reserva é controlada por pedido para evitar devolução duplicada.
- Produtos usam preço em centavos e estoque em grades, com fotos, composição e valores copiados para o registro do pedido (snapshot).
- Comprovantes: JPG/PNG/WebP de até 1 MB, em Data URL no armazenamento local, com tratamento de erro por limite de armazenamento. Isto é provisório; produção deve usar arquivos privados no Supabase Storage.
- Prévia da mensagem de WhatsApp antes de abrir o aplicativo. Mensagens contêm identificação de demonstração, evitando confundir exemplos com compras reais.
- Chave de armazenamento: `lua-kids:prototype:v1`. Reiniciar restaura os exemplos e não apaga o checklist da reunião.
- Se o armazenamento estiver bloqueado, o protótipo avisa e usa memória durante a sessão. Não há sincronização entre origens, navegadores ou aparelhos.
- O acompanhamento por link ainda é local e não funciona como pedido compartilhado em outro dispositivo.
- `servidor.mjs` é um servidor estático opcional, em `127.0.0.1:5173`; não é backend de pedidos.
- Código refatorado por responsabilidade, com arquivos, funções públicas e comentários em português. O mapa e a ordem de leitura estão em [organização do código](ORGANIZACAO-DO-CODIGO.md).
- `js/dados/demonstracao.js` contém os exemplos; `js/servicos/` concentra as operações locais; `js/paginas/` monta as telas. O estado mantém chave e formato anteriores, inclusive as propriedades em inglês já salvas.
- Testes reproduzíveis: `node testes/verificar-modulos.cjs` e `node testes/verificar-navegacao.cjs`. A refatoração preservou os fluxos locais verificados e a abertura direta do `index.html`; nenhuma proteção de produção foi aprovada por essa reorganização.

### Convenções provisórias que precisam de validação

- No catálogo de demonstração, cada tamanho conta como uma unidade comercial do modelo. Um conjunto é contado como uma unidade por tamanho, ainda que tenha duas peças físicas. **Confirmar como a loja conta conjuntos no mínimo de 10 peças** antes de cadastrar o catálogo real.
- A quantidade real de tamanhos e a composição serão definidas por modelo, e não por uma grade universal.
- Pedidos confirmados e enviados de exemplo já usam um estoque disponível inicial. Não constituem vendas reais.
- Um comprovante não é obrigatório para avançar ao status enviado na prévia. Confirmar se o dono deseja torná-lo obrigatório.

## Pendências para produção

1. Avaliação visual e funcional do desenvolvedor e do dono.
2. Escolher login, recuperação de conta e confirmação de contato; avaliar serviço de SMS ou e-mail e custos.
3. Receber catálogo real com preço por grade, composição, quantidade disponível, fotos e descrições; esclarecer contagem de conjuntos e métrica de vendidos.
4. Confirmar dados públicos da empresa, telefone definitivo e textos de atendimento, privacidade, trocas, cancelamentos e entrega. “Resolver no particular” não fornece os textos finais da loja.
5. Criar/configurar projeto Supabase e titularidade das contas do cliente; usar convites, sem registrar senhas em documentos.
6. Implementar persistência real, permissões por cliente e administrador, comprovantes privados e validação das regras no servidor/banco.
7. A confirmação/reserva deve ser transacional e revalidar estoque no banco, inclusive em acessos simultâneos. Preço e mínimo também precisam de validação confiável fora do navegador.
8. Definir domínio e hospedagem. O Supabase não substitui automaticamente a hospedagem do frontend estático.
9. Testar o fluxo real, publicar, orientar o dono presencialmente e combinar manutenção e suporte.

## Revisão após avaliação no celular — 28/10/2026

- A primeira versão anterior aos ajustes está preservada na tag `primeira-versao-aprovada`. Consulte [restauração](RESTAURACAO.md).
- Mantidas a identidade visual rosé/creme e a tipografia Nunito nos títulos e chamadas.
- Decisão final sobre a abertura: o usuário pediu a remoção completa da seção hero, inclusive imagem, título e chamada. A página inicial começa diretamente pelo bloco `perks`, seguido dos produtos e demais seções. Não recolocar banner de abertura sem nova solicitação.
- Logo após `perks`, incluir carrossel “Mais vendidos” com quatro produtos e parte do próximo cartão visível, navegação manual por arraste/setas e vendas explicitamente demonstrativas. Nesta prévia, ordena por grades vendidas fictícias, com nome como desempate. Futuramente, a classificação deve vir do banco com critério/período aprovado; não implementar rankings reais nem criar tabelas Supabase nesta etapa.
- Diagnóstico da prévia pública: em 28/10/2026, `https://guizinj.github.io/lua-kids/` ainda servia o primeiro `index.html`, sem referência a `ajustes-previa.css`; o arquivo público `base.css` não continha Nunito nem as correções de rolagem e `ajustes-previa.css` retornava 404. O HEAD local continuava em `c9e326a`, com as revisões na árvore de trabalho. Não confundir testes locais com o conteúdo efetivamente publicado; conferir commit/publicação antes de investigar uma regressão que só ocorre no Pages.
- Menu lateral com acessos rápidos, categorias derivadas do catálogo, endereço e atendimento. Painel demo agora acessível pelo rodapé, sem link na navegação principal. Isso não representa proteção de acesso.
- Refinamento móvel: “Filtrar e ordenar” usa uma janela central com margens, até 70% da altura da tela e limite de 560px, campos com rolagem interna e cabeçalho/ações sempre visíveis. O atalho “Meu endereço” ocupa as duas colunas da área do perfil, sem ficar comprimido na coluna do avatar.
- Painel mantém a tabela no celular com rolagem horizontal somente dentro da seção de pedidos. O usuário esclareceu que a rolagem indesejada era da página inteira; a apresentação em cartões foi retirada. Filtros do catálogo abrem em um painel móvel com aplicar/limpar; buscas enviadas levam aos resultados.
- Após novo relato de deslocamento do documento no celular, foram reforçados os limites de largura do painel e da área rolável, a coluna móvel usa `minmax(0, 1fr)` e o documento restringe transbordamento horizontal. Em 28/10/2026, `node testes/verificar-navegacao.cjs` passou com movimentos de toque dentro da tabela, nas duas bordas e fora dela: a tabela rola e o documento permanece na posição horizontal zero. Chromium emulado não comprova comportamento em Safari físico.
- Correção da causa da rolagem em 28/10/2026: o rótulo `.visually-hidden` da última coluna tinha posicionamento absoluto referido ao documento e escapava da área rolável. `.table-wrap` agora usa `position: relative`, contendo esse rótulo sem remover sua acessibilidade. No Chrome móvel, o erro ampliava também `innerWidth`, mascarando os testes anteriores; as verificações passam a comparar `scrollWidth` com `clientWidth` e conferir o diálogo nas larguras 320, 364, 390, 768 e 1440px.
- Confirmações de cancelamento, remoção de anexo e reinício usam diálogo HTML; não dependem mais de `window.confirm`. Cancelamento mantém as regras de status e devolução única da reserva.
- Favoritos, rascunhos e um endereço salvo são separados por perfil demonstrativo. Existe tela `#/endereco`; o fechamento recupera o endereço salvo, permite outro destino e só atualiza o endereço da conta com seleção explícita. Pedidos anteriores não são reescritos.
- Sacola compacta: cada item mostra miniatura, nome, grade, tamanhos em uma linha logo abaixo da grade, quantidade, preço e remoção. Retirado “Cores sortidas” da linha principal. Tecido, cores e aviso completo ficam em “Detalhes da grade”, fechado inicialmente, sem repetir tamanhos. Alterar quantidades preserva os detalhes abertos e a posição da lista.
- Detalhe do pedido e resumo do fechamento também usam itens compactos, com foto, quantidade, tamanhos e valor visíveis; tecido/cores/aviso ficam em “Detalhes da grade”. O histórico usa somente as características registradas na compra, sem completar dados de pedidos antigos com o catálogo atual.
- Fechamento: as três etapas (comprador, endereço, transporte/observações) começam recolhidas, com resumo visível atualizado ao preencher. Abrir/fechar preserva os campos e o rascunho; etapas com dados inválidos abrem ao enviar para permitir foco e mensagem no campo. O telefone recebe validação no formulário, além da validação já existente no serviço local. Isto continua sendo validação funcional do protótipo, sem substituir validações futuras no banco/API.
- Migração local aditiva: mesma chave e `version: 1`, com `accountRevision: 2`. `favoritesByCustomer`, `draftsByCustomer` e `addressesByCustomer` guardam os dados por cliente; `customersById` guarda identidades demonstrativas. `favorites` e `checkoutDraft` representam apenas o perfil ativo, por compatibilidade. Favoritos/rascunho antigos são atribuídos somente ao perfil então ativo. Endereços não são inferidos a partir de pedidos antigos de outros clientes.
- Cada modelo tem `colors` (lista de `name`/`hex`), tecido e tamanhos. O usuário confirmou **uma unidade por tamanho**, sem quantidades diferentes na mesma grade. As cores são informativas, sem seleção individual nem estoque por cor. Aviso: cores sortidas e substituição conforme disponibilidade.
- Novos pedidos copiam cores e tecido além de preço/tamanhos. Aparecem em detalhes, sacola, fechamento, pedidos e mensagem de compra. Pedidos antigos sem essas informações continuam sem cores inventadas. O futuro banco deve suportar esses atributos.
- Aviso de entrega agora tem diálogo visível ao recuperar um destino ou concluir cidade/estado; não abre a cada tecla. Resumo continua na tela. Referência a R$ 30 foi retirada da interface.
- Botão flutuante de WhatsApp abre atendimento manual e fica oculto durante diálogos. Telefone provisório mantido.
- Carrossel após o banner de grades usa espaços demonstrativos explicitamente identificados. **Receber depoimentos reais e autorização para publicação** antes de substituir os exemplos; não há envio de avaliações pelo site nesta etapa.
- Atualizações entre abas da mesma origem continuam locais. **Requisito da integração Supabase:** status confirmado, preparando, enviado, entregue e comprovantes atualizam a área do cliente sem recarregamento e entre aparelhos, sob as permissões corretas. Após reconexão, recuperar o estado oficial. Ainda não implementado como recurso de produção.
- Login, Supabase, regras confiáveis no banco/API e verificações de produção continuam pendentes.

## Como orientar a próxima IA ou agente

> Leia este contexto, o README e o código atual antes de propor alterações. O objetivo imediato é avaliar e evoluir o protótipo da Lua Kids sem aumentar o escopo da V1. Preserve grades fechadas, preço por grade, mínimo de 10 peças, cores sortidas, Caruaru com entrega grátis, demais destinos com frete a combinar e pagamento pelo WhatsApp. O painel da V1 acompanha pedidos e anexos; cadastro de produtos e edição manual de estoque no painel ficam para depois. Não escolha uma forma de login sem consultar a pendência registrada. Separe demonstração local de funcionalidade real, confirme os pontos de negócio ainda abertos e proponha etapas pequenas e verificáveis para a integração com Supabase. Nunca trate os dados fictícios como catálogo ou clientes reais.

Não é necessário reconstruir o projeto ou passar por outra IA. Este documento permite continuar em qualquer uma das duas situações.
