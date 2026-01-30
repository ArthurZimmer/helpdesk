import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPasswordAgente = await bcrypt.hash("johndoe123", 10);
  const hashedPasswordCliente = await bcrypt.hash("cliente123", 10);

  // Agente principal (hidden test account)
  await prisma.agente.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      nome: "Administrador",
      senha: hashedPasswordAgente
    }
  });

  // Cliente teste
  await prisma.cliente.upsert({
    where: { emailCliente: "test@cliente.com" },
    update: {},
    create: {
      emailCliente: "test@cliente.com",
      nomeCliente: "Cliente Teste",
      senhaCliente: hashedPasswordCliente,
      tipoCliente: "PF",
      statusCliente: "ATIVO",
      planoCliente: "Básico"
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
