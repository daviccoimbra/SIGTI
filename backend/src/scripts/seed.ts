import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

/**
 * Seed script — Cria os usuários padrão do sistema (ADMIN e GESTAO).
 * Execute com: npx prisma db seed
 */
async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Lista de usuários padrão que sempre devem existir no sistema
  const defaultUsers = [
    {
      username: 'admin',
      password: 'admin123', // Senha padrão (trocar em produção)
      nome: 'Administrador',
      setor: 'ADMIN',
    },
    {
      username: 'gestao',
      password: 'gestao123', // Senha padrão (trocar em produção)
      nome: 'Equipe de Gestão',
      setor: 'GESTAO',
    }
  ];

  for (const user of defaultUsers) {
    const existente = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (existente) {
      console.log(`⚠️  Usuário "${user.username}" já existe. Ignorando.`);
    } else {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const novoUsuario = await prisma.user.create({
        data: {
          username: user.username,
          password: hashedPassword,
          nome: user.nome,
          setor: user.setor as any, // Cast do Enum Setor
        },
      });

      console.log(`✅ Usuário criado com sucesso:`);
      console.log(`   → Username: ${novoUsuario.username} | Setor: ${novoUsuario.setor} | Senha Padrão: ${user.password}`);
    }
  }

  await prisma.$disconnect();
  console.log('\n🌱 Seed finalizado.');
}

seed().catch((e) => {
  console.error('❌ Erro no seed:', e);
  prisma.$disconnect();
  process.exit(1);
});
