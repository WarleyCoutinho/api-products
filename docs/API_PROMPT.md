# Template de Prompt para Criar uma Rota de API

Crie a rota `[MÉTODO] /products/{productId}[/ação-ou-sub-recurso]`

## Descrição

[Descreva o que a rota faz, em uma frase.]

## Requisitos Técnicos

- [Descreva o efeito colateral no banco, se houver — ex: cria/atualiza um registro.]
- Use case deve se chamar "[VerboRecurso]".

## Autenticação

- Rota protegida.
- Apenas o dono do produto (`product.userId === session.user.id`) pode executar esta ação.

## Request

```ts
interface Body {}
```

```ts
interface Params {
  productId: string;
}
```

```ts
interface Query {}
```

## Response

[Descreva o retorno esperado e o status code, por exemplo:]

```ts
interface StatusCode200 {}
```

## Regras de Negócio

[Descreva as regras que o use case deve implementar, por exemplo:]

- Caso o produto não pertença ao usuário (ou não exista), lance `NotFoundError` (404) — nunca 403.
- [Outras regras específicas da ação.]
