# Guia de Teste de Integração (Vercel + AWS + Supabase)

Depois de subir todos os componentes, siga esta bateria de testes para garantir que tudo funciona em harmonia.

## Teste 1: Health Check Básico do Backend
Usando `curl` ou seu navegador, acesse o endpoint de saúde:
```bash
curl https://sua-api-aws.com/api/health
```
**Esperado:** Resposta `200 OK` com `{ "status": "ok" }`. Isso confirma que sua API AWS está no ar.

## Teste 2: Teste de CORS
Isso simula o navegador do seu usuário fazendo uma requisição a partir do Vercel para a AWS.
```bash
curl -i -X OPTIONS -H "Origin: https://seu-app.vercel.app" -H "Access-Control-Request-Method: GET" https://sua-api-aws.com/api/health
```
**Esperado:** O header de resposta deve incluir `Access-Control-Allow-Origin: https://seu-app.vercel.app` ou `*`.

## Teste 3: Teste de Banco de Dados (Supabase) via API
Tente acessar uma rota pública ou tentar realizar um login mal formatado para ver como o banco responde:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"teste@teste.com", "senha":"123"}' https://sua-api-aws.com/api/auth/login
```
**Esperado:** Uma resposta do banco, seja de erro de autenticação ou "Usuário não encontrado" (confirmando que a Query chegou no Supabase e retornou).

## Teste 4: Teste de Variáveis Frontend (Console do Navegador)
Abra a sua aplicação Vercel no Chrome/Edge. Aperte `F12` e vá em **Console**. Digite:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL);
```
**Esperado:** Deve imprimir a URL da sua API AWS. Se der `undefined`, você esqueceu de rodar o Redeploy no Vercel após definir a variável.

## Teste 5: Requisição Real do Frontend
No mesmo Console do navegador do Vercel, cole o código:
```javascript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
  .then(res => res.json())
  .then(data => console.log('Sucesso:', data))
  .catch(err => console.error('Erro de CORS ou Rede:', err));
```
**Esperado:** `Sucesso: { status: 'ok' }`. Se aparecer um erro vermelho no console sobre `CORS policy`, revise o passo 2.

## Monitoramento Contínuo
Na AWS, você pode ver os logs em tempo real do seu backend para diagnosticar erros:
```bash
aws logs tail /aws/lambda/sua-funcao --follow
```
No Vercel, vá em **Logs** no painel da sua aplicação para ver os erros de frontend.
