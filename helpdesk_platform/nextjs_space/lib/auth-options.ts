import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Primeiro tenta encontrar como Cliente
        const cliente = await prisma.cliente.findUnique({
          where: { emailCliente: credentials.email }
        });

        if (cliente) {
          // Verifica se o cliente está ativo
          if (cliente.statusCliente !== "ATIVO") {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            cliente.senhaCliente
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: cliente.idCliente,
            email: cliente.emailCliente,
            name: cliente.nomeCliente,
            role: "CLIENTE"
          };
        }

        // Se não for cliente, tenta encontrar como Agente
        const agente = await prisma.agente.findUnique({
          where: { email: credentials.email }
        });

        if (agente) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            agente.senha
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: agente.id,
            email: agente.email,
            name: agente.nome,
            role: "AGENTE"
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
};
