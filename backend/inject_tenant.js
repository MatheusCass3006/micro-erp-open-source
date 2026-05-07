const fs = require('fs');
const path = require('path');

const entitiesDir = path.join(__dirname, 'src', 'database', 'entities');
const files = fs.readdirSync(entitiesDir);

const skipFiles = ['Configuracao.ts', 'Feedback.ts', 'Sessao.ts', 'Usuario.ts', 'UsuarioEmpresa.ts', 'Empresa.ts'];

for (const file of files) {
  if (skipFiles.includes(file)) continue;

  const filePath = path.join(entitiesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Verifica se já tem tenantId
  if (!content.includes('tenantId')) {
    // Insere a propriedade antes da última chave fechada
    const insertString = `\n  @Column({ name: "tenant_id", type: "varchar", length: 100, nullable: true })\n  tenantId!: string;\n`;
    
    // Procura o último "}" e insere antes
    const lastBraceIndex = content.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      content = content.slice(0, lastBraceIndex) + insertString + content.slice(lastBraceIndex);
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
}
