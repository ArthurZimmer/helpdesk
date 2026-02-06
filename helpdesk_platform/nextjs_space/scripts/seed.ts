import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPasswordAgente = await bcrypt.hash("ize123adm", 10);
  const hashedPasswordCliente = await bcrypt.hash("123cliente", 10);

  // adm (hidden test account)
  await prisma.agente.upsert({
    where: { email: "admin@ize.com" },
    update: {},
    create: {
      email: 'admin@ize.com',
      nome: 'Administrador',
      senha: hashedPasswordAgente, // Nunca salve senha em texto puro!
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Cliente teste
  await prisma.cliente.upsert({
    where: { emailCliente: "cliente@teste.com" },
    update: {},
    create: {
      nomeCliente: 'Teste',
    tipoCliente: 'PF',
    emailCliente: 'cliente@teste.com',
    senhaCliente: hashedPasswordCliente,
    numeroCelularCliente: '999999999',
    statusCliente: 'ATIVO',
    planoCliente: 'Básico',
    createdAt: new Date(),
    updatedAt: new Date()
    }
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
