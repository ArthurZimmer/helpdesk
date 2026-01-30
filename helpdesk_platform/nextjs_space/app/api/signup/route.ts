export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST() {
  // Cadastro desabilitado - apenas clientes cadastrados no sistema podem acessar
  return NextResponse.json(
    { message: "O cadastro de novos usuários está desabilitado. Apenas clientes cadastrados podem acessar o sistema." },
    { status: 403 }
  );
}
