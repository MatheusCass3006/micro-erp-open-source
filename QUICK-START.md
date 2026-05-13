# MicroERP - Guia Rápido (Vercel → AWS → Supabase)

Este guia prático ajudará você a colocar a nova arquitetura no ar em 30-60 minutos.

## Passo a Passo

### 1. Atualizar Credenciais do Supabase (URGENTE)
⚠️ **Ação Imediata:** Se você expôs sua chave do Supabase anteriormente, vá em [Settings -> API Keys no Supabase](https://app.supabase.com) e **revogue** a chave antiga. Gere uma nova.

### 2. Configurar Variáveis Localmente
- **Backend:** Copie `.env.example` para `.env` no diretório `backend/` e adicione sua `DATABASE_URL` do Supabase.
- **Frontend:** Copie `.env.example.frontend` para `.env.local` no diretório `financeiro-react/`.

### 3. Fazer Deploy do Backend na AWS
Escolha seu método preferido e veja o guia detalhado em [AWS-LAMBDA-DEPLOYMENT.md](./AWS-LAMBDA-DEPLOYMENT.md).
Após o deploy, você receberá uma URL (ex: `https://a1b2c3d4e5.execute-api.sa-east-1.amazonaws.com/prod`).

### 4. Atualizar CORS na AWS
Certifique-se de que a variável de ambiente `CORS_ORIGIN` na sua AWS Lambda contenha a URL do seu frontend no Vercel (ex: `https://seu-app.vercel.app`).

### 5. Configurar Frontend no Vercel
Veja o guia [VERCEL-ENV-SETUP.md](./VERCEL-ENV-SETUP.md). Adicione a URL do backend gerada no passo 3 à variável `NEXT_PUBLIC_API_URL` no Vercel. 
Faça um redeploy do frontend.

### 6. Testar Integração
Veja o guia [INTEGRATION-TESTING-GUIDE.md](./INTEGRATION-TESTING-GUIDE.md) para garantir que tudo está funcionando perfeitamente.

---
## Checklist Final
- [ ] Chave do Supabase exposta foi revogada?
- [ ] Backend rodando na AWS?
- [ ] Backend consegue se conectar ao Supabase?
- [ ] CORS configurado no Backend aceitando a URL do Vercel?
- [ ] Vercel possui a variável `NEXT_PUBLIC_API_URL` com a URL da AWS?
- [ ] Health Check retorna 200 OK no navegador?
