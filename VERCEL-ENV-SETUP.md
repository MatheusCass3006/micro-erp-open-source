# Guia de Configuração de Variáveis de Ambiente no Vercel

Após fazer o deploy do backend na AWS e obter sua URL da API, você precisa configurar o seu frontend no Vercel para se comunicar com essa API.

## Método 1: Pelo Dashboard do Vercel (Recomendado)

1. Faça login em [vercel.com](https://vercel.com/) e selecione o projeto do seu frontend.
2. Navegue até a aba **Settings**.
3. No menu lateral esquerdo, clique em **Environment Variables**.
4. Configure as seguintes chaves e valores:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://sua-api-aws.execute-api.sa-east-1.amazonaws.com/prod` (substitua pela URL real gerada pela AWS).
5. Certifique-se de marcar os ambientes onde deseja aplicar essa variável (Production, Preview, Development).
6. Clique em **Save**.
7. **Redeploy Obrigatório:** Variáveis de ambiente Next.js cujo prefixo é `NEXT_PUBLIC_` são "bocadas" em tempo de build. Portanto, vá até a aba **Deployments**, encontre o seu último deploy, clique nos três pontos e selecione **Redeploy**.

## Método 2: Pelo Vercel CLI

Se você utiliza o Vercel CLI no terminal:

1. Rode o comando:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```
2. O prompt perguntará o valor (insira a URL da AWS).
3. Selecione o ambiente (`production`, `preview`, `development`).
4. Rode `vercel deploy --prod` para aplicar as mudanças.

## Troubleshooting de CORS

Se ao tentar fazer requisições o navegador exibir erro de CORS:
- **Verifique a URL no Vercel:** Certifique-se que o valor não possui uma barra no final (use `https://sua-api.com` em vez de `https://sua-api.com/`).
- **Verifique a AWS:** A variável `CORS_ORIGIN` no seu Backend precisa conter EXATAMENTE o endereço do seu frontend (ex: `https://meu-app.vercel.app`), incluindo o `https://`.
