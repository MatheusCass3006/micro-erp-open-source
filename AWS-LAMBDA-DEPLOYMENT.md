# Guia de Deploy - AWS Lambda (Node.js/Express)

Neste guia, você verá 3 métodos para fazer o deploy do seu backend Express na AWS.

Como seu projeto é Node.js + Express, a ferramenta recomendada é o **Serverless Framework** aliado ao pacote `serverless-http`.

## Pré-requisitos
1. [Node.js](https://nodejs.org/en/) instalado.
2. Conta na [AWS](https://aws.amazon.com/).
3. AWS CLI configurado (`aws configure`).

## Método 1: Serverless Framework (Recomendado)

### 1. Instalar Dependências
No diretório `backend`, instale o framework e o adaptador:
```bash
npm install -g serverless
npm install serverless-http
```

### 2. Atualizar Código
Envolva a sua aplicação Express com o adaptador. Em seu arquivo principal (ex: `app.ts` ou crie um `lambda.ts`), adicione:
```typescript
import serverless from "serverless-http";
import app from "./app"; // seu app express

export const handler = serverless(app);
```

### 3. Criar arquivo `serverless.yml`
No diretório `backend`, crie este arquivo:
```yaml
service: microerp-api

provider:
  name: aws
  runtime: nodejs20.x
  region: sa-east-1 # São Paulo
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    JWT_SECRET: ${env:JWT_SECRET}
    CORS_ORIGIN: "https://seu-app.vercel.app"

functions:
  api:
    handler: dist/lambda.handler # caminho para seu arquivo transpilado
    events:
      - httpApi: '*'
```

### 4. Deploy
Transpile o código (`npm run build` / `tsc`) e rode:
```bash
serverless deploy
```
O console mostrará a URL da sua API gerada (Endpoint).

## Método 2: AWS SAM (Serverless Application Model)
Ideal se você prefere ferramentas oficiais da AWS. Requer instalação do AWS SAM CLI. Use o template `AWS::Serverless::Function` em um arquivo `template.yaml` para mapear seu código.

## Método 3: AWS Console (Manual)
1. Transpile seu código (`tsc`) e crie um `.zip` com a pasta `dist` e `node_modules`.
2. Acesse o AWS Lambda Console, crie uma função (Node.js 20.x).
3. Faça upload do `.zip`.
4. Vá para "Configuration" -> "Environment Variables" e adicione suas chaves (Supabase, JWT, CORS).
5. Adicione um trigger "API Gateway" para obter sua URL pública.

## Conclusão
Guarde a URL obtida. Ela será a sua `NEXT_PUBLIC_API_URL` configurada no Vercel.
