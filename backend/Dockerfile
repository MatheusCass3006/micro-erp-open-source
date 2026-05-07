# Estágio de Compilação
FROM node:20-slim AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências (incluindo devDependencies para o build)
RUN npm install

# Copia o restante do código
COPY . .

# Compila o projeto TypeScript
RUN npm run build

# Estágio de Produção
FROM node:20-slim

WORKDIR /app

# Copia apenas os arquivos necessários para execução
COPY package*.json ./
RUN npm install --omit=dev

# Copia os arquivos compilados do estágio anterior
COPY --from=builder /app/dist ./dist

# Expõe a porta que o backend utiliza
EXPOSE 3001

# Variável de ambiente padrão
ENV NODE_ENV=production

# Comando para iniciar o servidor
CMD ["node", "dist/app.js"]
