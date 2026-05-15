import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

/**
 * Seed completo do sistema
 * Execute com: npx prisma db seed
 */

async function seedUsers() {
  console.log('\n👤 Criando usuários...');

  const defaultUsers = [
    {
      username: 'admin',
      password: 'admin123',
      nome: 'Administrador',
      setor: 'ADMIN',
    },
    {
      username: 'gestao',
      password: 'gestao123',
      nome: 'Equipe de Gestão',
      setor: 'GESTAO',
    }
  ];

  for (const user of defaultUsers) {
    const existente = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (existente) {
      console.log(`⚠️  Usuário "${user.username}" já existe.`);
    } else {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await prisma.user.create({
        data: {
          username: user.username,
          password: hashedPassword,
          nome: user.nome,
          setor: user.setor as any,
        },
      });

      console.log(`✅ Usuário criado: ${user.username}`);
    }
  }
}

async function seedCategories() {
  console.log('\n📂 Criando categorias...');

const categories = [
  // Hardware
  { descricao: 'Computador não liga' },
  { descricao: 'Computador lento' },
  { descricao: 'Problema com monitor' },
  { descricao: 'Teclado ou mouse com defeito' },
  { descricao: 'Impressora não funciona' },
  { descricao: 'Problema com scanner' },
  { descricao: 'Equipamento não reconhecido' },

  // Software
  { descricao: 'Erro no sistema laboratorial (LIS)' },
  { descricao: 'Sistema não abre' },
  { descricao: 'Sistema travando' },
  { descricao: 'Erro ao emitir laudo' },
  { descricao: 'Erro ao cadastrar paciente' },
  { descricao: 'Falha em atualização de sistema' },
  { descricao: 'Instalação de software' },
  { descricao: 'Permissão de acesso ao sistema' },

  // Rede
  { descricao: 'Sem acesso à internet' },
  { descricao: 'Rede lenta' },
  { descricao: 'Problema no Wi-Fi' },
  { descricao: 'Sem acesso ao servidor' },
  { descricao: 'Erro de conexão com sistema' },

  // Impressão / exames
  { descricao: 'Impressão de exames com erro' },
  { descricao: 'Impressora de etiquetas não funciona' },
  { descricao: 'Erro na impressão de laudos' },

  // Integrações e equipamentos laboratoriais
  { descricao: 'Equipamento não envia resultados' },
  { descricao: 'Falha de integração com equipamento' },
  { descricao: 'Erro de comunicação com analisador' },

  // Usuários / acesso
  { descricao: 'Criação de usuário' },
  { descricao: 'Reset de senha' },
  { descricao: 'Usuário bloqueado' },
  { descricao: 'Alteração de permissões' },

  // Infraestrutura
  { descricao: 'Queda de energia afetando sistemas' },
  { descricao: 'Problema no nobreak' },
  { descricao: 'Servidor fora do ar' },

  // Outros
  { descricao: 'Solicitação de suporte geral' },
  { descricao: 'Dúvida operacional' },
  { descricao: 'Treinamento de sistema' },
];

  for (const cat of categories) {
    const exists = await prisma.category.findFirst({
      where: { descricao: cat.descricao },
    });

    if (exists) {
      console.log(`⚠️ Categoria "${cat.descricao}" já existe.`);
    } else {
      await prisma.category.create({ data: cat });
      console.log(`✅ Categoria criada: ${cat.descricao}`);
    }
  }
}

async function seedEquipments() {
  console.log('\n🖥️ Criando equipamentos...');

  const equipamentos = [
    {
      nome: 'Computador',
      marcaModelo: 'Dell Optiplex',
      unidade: 'TI',
      setor: 'ADMIN',
    },
    {
      nome: 'Impressora',
      marcaModelo: 'HP LaserJet',
      unidade: 'Financeiro',
      setor: 'GESTAO',
    },
  ];

  for (const eq of equipamentos) {
    const exists = await prisma.equipment.findFirst({
      where: { nome: eq.nome },
    });

    if (exists) {
      console.log(`⚠️ Equipamento "${eq.nome}" já existe.`);
    } else {
      await prisma.equipment.create({ data: eq });
      console.log(`✅ Equipamento criado: ${eq.nome}`);
    }
  }
}

async function seedRequesters() {
  console.log('\n🙋 Criando solicitantes...');

  const requesters = [
  {
    nome: 'Adla Graziella Oliveira Santos',
    cargo: 'Responsável Técnica',
    unidade: 'Murici',
    setor: 'Área Técnica',
  },
  {
    nome: 'Aline Silva Rosendo',
    cargo: 'Almoxarife',
    unidade: 'Centro',
    setor: 'Almoxarifado',
  },
  {
    nome: 'Anna Luiza Gaia Pinto',
    cargo: 'Diretora',
    unidade: 'Centro',
    setor: 'Diretoria/Gestão',
  },
  {
    nome: 'Bruna Rafaela Silva Dos Santos',
    cargo: 'Tec. Laboratório',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Cinthia Da Silva Cavalcante Araujo',
    cargo: 'Coletadora',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Denise Silva Inacio Dos Santos',
    cargo: 'Recepcionista',
    unidade: 'Pajuçara',
    setor: 'Recepção',
  },
  {
    nome: 'Lays Renatha Gomes Barbosa',
    cargo: 'Recepcionista',
    unidade: 'NTO',
    setor: 'Recepção',
  },
  {
    nome: 'Leticia Hellen Laurindo De Barros',
    cargo: 'Tec. Laboratório',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Lyslanne Nascimento Silva',
    cargo: 'Coletadora',
    unidade: 'Centro',
    setor: 'Área Técnica',
  },
  {
    nome: 'Marcela Maria Da Silva Guimaraes',
    cargo: 'Coletadora',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Maria Gorete Barbosa Da Silva',
    cargo: 'Responsável Técnica',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Marcio Alexandre Da Silva Leite',
    cargo: 'Faturista',
    unidade: 'Centro',
    setor: 'Faturamento/Financeiro',
  },
  {
    nome: 'Norma Eladja Da Silva Goncalves',
    cargo: 'Recepcionista',
    unidade: 'Jatiúca',
    setor: 'Recepção',
  },
  {
    nome: 'Rosangela Francisca Farias',
    cargo: 'Coletadora',
    unidade: 'Jatiúca',
    setor: 'Área Técnica',
  },
  {
    nome: 'Simone Beserra Da Silva',
    cargo: 'Biomédica',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Tamires Santos Gomes Da Silva',
    cargo: 'Financeiro',
    unidade: 'Centro',
    setor: 'Faturamento/Financeiro',
  },
  {
    nome: 'Marine Cibeli De Carvalho Barbosa',
    cargo: 'Coletadora',
    unidade: 'Medradius',
    setor: 'Área Técnica',
  },
  {
    nome: 'Maria Betania Da Silva Santos',
    cargo: 'Coletadora',
    unidade: 'Medradius',
    setor: 'Área Técnica',
  },
  {
    nome: 'Camilla Christine Do Nascimento Bomfim',
    cargo: 'Recepcionista',
    unidade: 'Jatiúca',
    setor: 'Recepção',
  },
  {
    nome: 'Eloisa Rafaelle Silva Alecio Malta',
    cargo: 'Biomédica',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Fatima Mayara Da Rocha Santos',
    cargo: 'Biomédica',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Davi Costa Coimbra',
    cargo: 'TI',
    unidade: 'NTO',
    setor: 'TI',
  },
  {
    nome: 'Thaina De Paula Soares Mendonca',
    cargo: 'Biomédica',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Izabel Cristina Balthar Barros De Lima',
    cargo: 'Faturista',
    unidade: 'Centro',
    setor: 'Faturamento/Financeiro',
  },
  {
    nome: 'Amanda Thayna Melo Coelho',
    cargo: 'Recepcionista',
    unidade: 'Centro',
    setor: 'Recepção',
  },
  {
    nome: 'Maria Vania Pereira Araujo De Castro',
    cargo: 'Gestora',
    unidade: 'NTO',
    setor: 'Diretoria/Gestão',
  },
  {
    nome: 'Julia Gabriela Dos Santos Albuquerque',
    cargo: 'Recepcionista',
    unidade: 'Centro',
    setor: 'Recepção',
  },
  {
    nome: 'Maria Klara Da Silva Rego',
    cargo: 'Recepcionista',
    unidade: 'Centro',
    setor: 'Recepção',
  },
  {
    nome: 'Alice Oliveira Alves Da Silva',
    cargo: 'Recepcionista',
    unidade: 'Medradius',
    setor: 'Recepção',
  },
  {
    nome: 'Daniela Calumby De Souza Gomes',
    cargo: 'Biomédica',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Renata Santos Silva',
    cargo: 'Recepcionista',
    unidade: 'Medradius',
    setor: 'Recepção',
  },
  {
    nome: 'Ezequiel Santos De Oliveira',
    cargo: 'Tec. Laboratório',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Sara Lima Oliveira',
    cargo: 'Recepcionista',
    unidade: 'Medradius',
    setor: 'Recepção',
  },
  {
    nome: 'Erica Cristina Silva Dos Santos',
    cargo: 'Tec. Laboratório',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Kassio Bezerra Da Cunha',
    cargo: 'TI',
    unidade: 'NTO',
    setor: 'TI',
  },
  {
    nome: 'Janaina Ferreira Da Silva',
    cargo: 'Tec. Laboratório',
    unidade: 'NTO',
    setor: 'Área Técnica',
  },
  {
    nome: 'Sheirlla Dos Santos Firme Fideles',
    cargo: 'Recepcionista',
    unidade: 'Medradius',
    setor: 'Recepção',
  },
  {
    nome: 'Nadieje Dos Santos Silva',
    cargo: 'Coletadora',
    unidade: 'Medradius',
    setor: 'Área Técnica',
  }
];

  for (const r of requesters) {
    const exists = await prisma.requester.findFirst({
      where: { nome: r.nome },
    });

    if (exists) {
      console.log(`⚠️ Requester "${r.nome}" já existe.`);
    } else {
      await prisma.requester.create({ data: r });
      console.log(`✅ Requester criado: ${r.nome}`);
    }
  }
}

async function seedTickets() {
  console.log('\n🎫 Criando tickets...');

  const categorias = await prisma.category.findMany();
  const equipamentos = await prisma.equipment.findMany();
  const requesters = await prisma.requester.findMany();

  if (categorias.length === 0 || equipamentos.length === 0 || requesters.length === 0) {
    console.log('⚠️ Dependências não encontradas. Pulando tickets.');
    return;
  }

  const tickets = [
    {
      protocolo: 'TICKET-001',
      titulo: 'Computador não liga',
      descricao: 'Máquina não inicia ao pressionar o botão',
      prioridade: 'Alta',
    },
    {
      protocolo: 'TICKET-002',
      titulo: 'Sistema travando',
      descricao: 'Sistema laboratorial trava ao abrir exames',
      prioridade: 'Alta',
    },
    {
      protocolo: 'TICKET-003',
      titulo: 'Sem internet',
      descricao: 'Não consigo acessar sites externos',
      prioridade: 'Média',
    },
    {
      protocolo: 'TICKET-004',
      titulo: 'Erro ao imprimir laudo',
      descricao: 'Impressora retorna erro ao imprimir exames',
      prioridade: 'Alta',
    },
    {
      protocolo: 'TICKET-005',
      titulo: 'Usuário bloqueado',
      descricao: 'Não consigo acessar o sistema com meu login',
      prioridade: 'Baixa',
    },
    {
      protocolo: 'TICKET-006',
      titulo: 'Equipamento não envia resultados',
      descricao: 'Analisador não está integrando com o sistema',
      prioridade: 'Alta',
    },
    {
      protocolo: 'TICKET-007',
      titulo: 'Rede lenta',
      descricao: 'Sistema está demorando muito para carregar',
      prioridade: 'Média',
    },
    {
      protocolo: 'TICKET-008',
      titulo: 'Instalação de software',
      descricao: 'Solicito instalação de novo sistema de apoio',
      prioridade: 'Baixa',
    },
    {
      protocolo: 'TICKET-009',
      titulo: 'Erro ao cadastrar paciente',
      descricao: 'Sistema apresenta erro ao salvar cadastro',
      prioridade: 'Alta',
    },
    {
      protocolo: 'TICKET-010',
      titulo: 'Problema no scanner',
      descricao: 'Scanner não digitaliza documentos',
      prioridade: 'Média',
    },
  ];

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];

    const exists = await prisma.ticket.findUnique({
      where: { protocolo: ticket.protocolo },
    });

    if (exists) {
      console.log(`⚠️ ${ticket.protocolo} já existe.`);
      continue;
    }

    const categoria = categorias[i % categorias.length];
    const equipamento = equipamentos[i % equipamentos.length];
    const requester = requesters[i % requesters.length];

    await prisma.ticket.create({
      data: {
        protocolo: ticket.protocolo,
        solicitante: requester.nome,
        requesterId: requester.id,
        departamento: 'TI',
        categoryId: categoria.id,
        equipmentId: equipamento.id,
        titulo: ticket.titulo,
        descricao: ticket.descricao,
        prioridade: ticket.prioridade,
      },
    });

    console.log(`✅ Ticket criado: ${ticket.protocolo}`);
  }
}

async function main() {
  console.log('🌱 Iniciando seed do banco...\n');

  await seedUsers();
  await seedCategories();
  await seedEquipments();
  await seedRequesters();
  await seedTickets();

  console.log('\n🌱 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
