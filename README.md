# Cadastro de Produtos — MVC

Aplicação web em Node.js + Express (padrão MVC) para cadastro de produtos organizados por
categorias, com persistência em SQLite via Sequelize e páginas renderizadas em EJS.

(**Todos os desafios propostos, segundo o PDF de guia de estudo, foram realizados com êxito**)

## Integrante

Breno Valentim — RM: 20240207

## Como executar

Pré-requisitos: Node.js (testado na v26.7.0) e npm.

```bash
npm install
npm start
```

Acesse: http://localhost:3000

O banco `database.sqlite` é criado automaticamente na primeira execução
(`sequelize.sync()` em `app.js`).

> Se aparecer o erro `Could not locate the bindings file` do `sqlite3`
> (módulo nativo que precisa ser compilado para a sua versão do Node), rode:
>
> ```bash
> npm rebuild sqlite3 --build-from-source
> npm start
> ```

## Funcionalidades

- Cadastro de produtos (nome, preço, quantidade e categoria obrigatória —
  sem categoria cadastrada o formulário bloqueia e orienta criar em `/categorias/novo`)
- Listagem de produtos com categoria, paginação (5 por página) e total
- Edição de produtos
- Exclusão de produtos
- Cadastro de categorias
- Edição e exclusão de categorias (excluir apaga seus produtos junto — `CASCADE`)
- Produtos por categoria (`/produtos/categoria/:id`, com seletor na listagem)
- Pesquisa de produtos por nome (`?q=`, via `LIKE`)
- Navegação cruzada: "Nova categoria" no cadastro de produtos,
  "Ver produtos" na lista de categorias

Rotas principais:

| Método | URL                          | Descrição                        |
| ------ | ---------------------------- | -------------------------------- |
| GET    | `/produtos`                  | Lista (aceita `?q=` e `?page=`)  |
| GET    | `/produtos/novo`             | Formulário de novo produto       |
| POST   | `/produtos`                  | Cria produto                     |
| GET    | `/produtos/categoria/:id`    | Produtos de uma categoria        |
| GET    | `/produtos/:id/editar`       | Formulário de edição             |
| POST   | `/produtos/:id`              | Atualiza produto                 |
| DELETE | `/produtos/:id`              | Exclui produto                   |
| GET    | `/categorias`                | Lista categorias                 |
| GET    | `/categorias/novo`           | Formulário de nova categoria     |
| POST   | `/categorias`                | Cria categoria                   |
| GET    | `/categorias/:id/editar`     | Formulário de edição             |
| POST   | `/categorias/:id`            | Atualiza categoria               |
| DELETE | `/categorias/:id`            | Exclui categoria (+ seus produtos)|

> Os botões "Excluir" usam `DELETE` através do pacote `method-override`
> (o formulário envia `POST` para `/:id?_method=DELETE`), pois HTML
> puro só suporta GET/POST.

## Desafios

### Desafio 1 — Categorias e relacionamento com produtos

Criado o Model `Categoria` (só `nome`) em `models/index.js` e associada a
`Produto` com:

```js
Categoria.hasMany(Produto, { foreignKey: 'categoriaId', onDelete: 'CASCADE' });
Produto.belongsTo(Categoria, { foreignKey: 'categoriaId' });
```

Isso cria a chave estrangeira `categoriaId` na tabela `Produtos`. Criado o CRUD
de categorias (`routes/categorias.js` + `views/categorias/`) e os formulários de
produto passaram a exigir a categoria (`<select name="categoriaId" required>`),
enquanto a listagem usa `findAndCountAll({ include: Categoria })` para exibir o
nome da categoria de cada produto. Tudo persiste no SQLite.

> Se nenhuma categoria existir, `GET /produtos/novo` e `GET /produtos/:id/editar`
> exibem o aviso "Nenhuma categoria cadastrada" com link para `/categorias/novo`
> e botão desabilitado; `POST /produtos` e `POST /produtos/:id` sem `categoriaId`
> válido retornam 400.

### Desafio 2 — Consulta de produtos por categoria

Nova rota `GET /produtos/categoria/:categoriaId` em `routes/produtos.js`, que
busca a categoria e filtra com condição de busca:

```js
Produto.findAndCountAll({
  where: { categoriaId: req.params.categoriaId },
  include: Categoria, limit, offset
});
```

A rota fica declarada antes das rotas `/:id/...` para o Express não confundir
`categoria` com id. A listagem (`views/produtos/index.ejs`) tem um seletor de
categoria que redireciona para essa URL, e a mesma view é reaproveitada exibindo
o título `Produtos — <nome da categoria>`. Categoria inexistente retorna 404.

### Desafio extra — Pesquisa de produtos

A listagem `GET /produtos` aceita `?q=` e filtra com `LIKE`:

```js
if (req.query.q) {
  where.nome = { [Op.like]: '%' + req.query.q + '%' };
}
```

Um formulário de busca no topo da página envia o termo, com opção "Limpar".
A busca combina com a paginação (`findAndCountAll` + `?page=`).

## Estrutura do projeto

```
cadastro-produtos/
├── app.js
├── package.json
├── database.sqlite        # gerado automaticamente (gitignore recomendado)
├── models/
│   └── index.js           # sequelize, Produto, Categoria + associações
├── routes/
│   ├── index.js
│   ├── users.js
│   ├── produtos.js        # CRUD + busca + paginação + filtro por categoria
│   └── categorias.js      # CRUD de categorias
├── views/
│   ├── produtos/          # index.ejs, novo.ejs, editar.ejs
│   └── categorias/        # index.ejs, novo.ejs, editar.ejs
└── public/
```
