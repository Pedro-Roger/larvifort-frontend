import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

export async function POST(request: Request) {
  try {
    const { email, nome, usuario, senhaProvisoria } = await request.json();

    // Verificação simples dos dados recebidos
    if (!email || !nome || !usuario || !senhaProvisoria) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY não configurada');
      return NextResponse.json({ error: 'Serviço de e-mail não configurado' }, { status: 503 });
    }

    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: 'Larvifort CRM <nao-responda@larvifort.online>', // Usando seu domínio verificado
      to: [email],
      subject: 'Seja bem-vindo(a) ao Larvifort CRM!',
      react: WelcomeEmail({ nome, usuario, senhaProvisoria }),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json({ error: 'Erro interno ao enviar e-mail' }, { status: 500 });
  }
}
