# Lua Kids · guia de segurança

Atualizado em 28/10/2026. Regras comerciais e pendências: [contexto](CONTEXTO-PROJETO.md).

**Hoje:** protótipo local, sem autenticação ou Supabase. Os [testes existentes](LEIA-ME.md#verificação-realizada) validam seu funcionamento, não a segurança de produção. O login dos clientes continua pendente.

Refatoração funcional conferida em 28/10/2026: [estrutura e comandos dos testes](ORGANIZACAO-DO-CODIGO.md#verificação-da-refatoração). Separar módulos não concede autorização de acesso nem muda a situação dos controles de produção abaixo.

## 1. Permissões

| Perfil | Acesso previsto |
| --- | --- |
| Visitante | Consultar catálogo publicado e informações públicas; montar a sacola. Sem acesso a dados pessoais ou ações administrativas. |
| Cliente autenticado | Consultar seus dados, pedidos e comprovantes; manter perfil, endereços e favoritos; criar pedidos pelas operações permitidas. |
| Administradores: desenvolvedor e dono | Consultar históricos, confirmar/cancelar pedidos, atualizar andamento e gerenciar comprovantes. Cadastro de produtos e edição manual de estoque pelo painel ficam fora da V1. |

Aplicar permissões no banco/API e nos arquivos, mesmo quando alguém ignora a interface. Cliente não concede privilégios a si próprio. Planejar MFA administrativo.

## 2. Proteções necessárias

- **Dados oficiais:** validar preços, grades inteiras, mínimo de peças e entrega no banco/servidor. Não confiar em totais, proprietário ou privilégios enviados pelo navegador.
- **Pedidos:** reservar estoque em transação; impedir repetição de movimentos e transições inválidas. Preservar o endereço histórico, com correções autorizadas e registradas. Definir quem pode corrigi-lo em cada status antes de implementar.
- **Privacidade:** permissões por registro (RLS), concessões mínimas e comprovantes privados. Validar conteúdo, formato e tamanho dos uploads no ambiente confiável.
- **Scripts e credenciais:** renderizar dados com segurança, revisar HTML/URLs e configurar CSP. Credenciais privilegiadas ficam fora do frontend, repositório e documentos; a chave pública depende das permissões.
- **Operação:** proteger login/recuperação, limitar abuso, usar HTTPS e registrar alterações sem expor segredos. Revisar dependências e configurações quando mudarem.

## 3. Registro de verificação

**Pendente:** falta concluir ou avaliar. **Implementado:** existe, mas falta evidência. **Verificado:** passou em teste identificado. Revalidar os controles afetados por mudanças.

Usar dados fictícios, visitante, clientes A/B e administrador em desenvolvimento/homologação. Testar ações permitidas e negadas pela interface **e diretamente na API/banco**, mantendo testes reproduzíveis conforme forem implementados.

| Controle | Situação | Como verificar | Evidência: data e resultado |
| --- | --- | --- | --- |
| Acesso e privilégios | Pendente | Visitante, sessão expirada e cliente não acessam dados/ações administrativas; autopromoção falha. Conferir recuperação e MFA. | — |
| Isolamento de clientes | Pendente | Acessos próprios funcionam; trocar identificadores não permite a A consultar ou alterar dados/pedidos de B. | — |
| Preços, grades e entrega | Pendente | Manipular preço, composição, mínimo, quantidade negativa/fracionária e frete grátis; operação rejeita ou recalcula corretamente. | — |
| Endereços e status | Pendente | Perfil não altera endereço histórico; mudanças não autorizadas/transições inválidas falham; alterações legítimas ficam registradas. | — |
| Reserva concorrente | Pendente | Dois pedidos disputam a última grade: somente um reserva; repetir confirmação não duplica reserva nem deixa movimento parcial. | — |
| Cancelamento | Pendente | Pedido sem reserva não aumenta estoque; reserva válida retorna uma vez; repetição ou status indevido não duplica devolução. | — |
| Comprovantes privados | Pendente | A e administrador têm acesso previsto; visitante/B não acessam por URL, listagem, identificador ou geração de link temporário. | — |
| Uploads | Pendente | Rejeitar excesso de tamanho, formato proibido ou conteúdo incompatível; somente administrador autorizado gerencia comprovantes. | — |
| Scripts maliciosos | Pendente | Testar campos, URLs, catálogo e nomes de anexos: nenhuma execução indevida; renderização segura e CSP preservam uso legítimo. | — |
| Credenciais e publicação | Pendente | Inspecionar arquivos publicados, respostas e logs: sem segredos/dados privados; configuração pública respeita as permissões. | — |
| Abuso | Pendente | Repetir login/recuperação, pedidos e uploads; comprovar limites no serviço responsável, sem impedir uso legítimo. | — |
| HTTPS e auditoria | Pendente | Conferir HTTPS/cabeçalhos e trilha protegida com autor, ação e data; cliente não forja nem apaga registros. | — |
| Backup e recuperação | Pendente | Restaurar em ambiente separado; conferir banco, pedidos e recuperação dos anexos, registrando alcance e limitações. | — |

Evidência: **data, ambiente, versão/migração, teste/comando e resultado esperado/observado**. Referenciar teste ou relatório, sem segredos ou dados reais. Nenhum controle de produção está verificado na criação deste guia.

## 4. Publicação e condução do trabalho

- Receber clientes reais após aprovar as verificações essenciais, resolver falhas conhecidas de acesso/alteração indevidos e conferir pendências comerciais, HTTPS, credenciais, limites, registros e recuperação. Remover acessos demonstrativos.
- Antes de cada etapa, explicar objetivo, abordagem e ações/decisões do usuário. Depois, registrar resultado, evidência, pendências e próximo passo.
- Versionar migrações, explicar efeitos e testar antes de produção. Quando houver dados existentes, definir recuperação e conferir o resultado. Dados fictícios permanecem separados.
- Conferir apenas o necessário para a mudança: revisão visual para aparência; testes correspondentes para acessos, banco, pedidos e anexos. Atualizar este guia ao implementar/verificar controles.

Consultar documentação vigente ao implementar: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage](https://supabase.com/docs/guides/storage/security/access-control) e [OWASP XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html). A proteção depende do código, das configurações e das verificações efetivas.
