# Restaurar a primeira versão

Antes desta revisão, a versão navegável foi preservada na tag Git **`primeira-versao-aprovada`**, apontando para o commit `c9e326a30775ff6e421fe97dd875e65222e6131f`.

Para conferir a referência:

```powershell
git show --no-patch primeira-versao-aprovada
```

Para gerar uma cópia independente, sem substituir o trabalho atual, execute na pasta do projeto:

```powershell
git archive --format=zip --output=primeira-versao-aprovada.zip primeira-versao-aprovada
```

Extraia o ZIP em outra pasta e abra seu `index.html`. Ele inclui o código, as imagens, a documentação e os testes daquela versão. A tag é local; para conservá-la em um repositório remoto, seu envio deverá ser feito separadamente quando solicitado.

Este ponto de restauração cobre os arquivos versionados, não os dados do navegador. Pedidos e anexos demonstrativos continuam no armazenamento de cada navegador/origem. A revisão mantém a mesma chave local e adiciona mapas por cliente; a versão anterior não utiliza esses mapas. Evite alternar as duas versões no mesmo endereço de servidor para não misturar gravações.

Nenhum dado de cliente real ou recurso do Supabase foi criado nesta revisão.
