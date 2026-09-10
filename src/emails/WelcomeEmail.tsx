import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  nome: string;
  usuario: string;
  senhaProvisoria: string;
}

// Fallback para a URL do site onde a imagem está hospedada
const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : 'https://larvifort.online';

export default function WelcomeEmail({
  nome,
  usuario,
  senhaProvisoria,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo(a) à equipe Larvifort CRM</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/larvifort.png`}
              width="180"
              alt="Larvifort"
              style={logo}
            />
          </Section>

          <Heading style={heading}>Olá, {nome}</Heading>

          <Text style={text}>
            Seu acesso ao <strong>Larvifort CRM</strong> foi criado com sucesso. 
            Abaixo estão os detalhes da sua conta para você fazer o primeiro login:
          </Text>

          <Section style={credentialsBox}>
            <Text style={credentialItem}>
              <span style={credentialLabel}>E-mail:</span> {usuario}
            </Text>
            <Text style={credentialItem}>
              <span style={credentialLabel}>Senha provisória:</span> {senhaProvisoria}
            </Text>
          </Section>

          <Text style={text}>
            Por motivos de segurança, recomendamos que você altere esta senha provisória 
            assim que acessar a plataforma pela primeira vez.
          </Text>

          <Section style={buttonContainer}>
            <a href={baseUrl} style={button}>
              Acessar o Larvifort
            </a>
          </Section>

          <Text style={footer}>
            © {new Date().getFullYear()} Larvifort CRM. Este é um e-mail automático, por favor não responda.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '60px 20px',
  maxWidth: '560px',
};

const logoContainer = {
  marginBottom: '40px',
};

const logo = {
  display: 'block',
  outline: 'none',
  border: 'none',
  textDecoration: 'none',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#111111',
  padding: '0',
  margin: '0 0 24px',
};

const text = {
  color: '#444444',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const credentialsBox = {
  padding: '24px',
  backgroundColor: '#fafafa',
  borderRadius: '8px',
  border: '1px solid #eaeaea',
  marginBottom: '24px',
};

const credentialItem = {
  margin: '0 0 12px',
  color: '#111111',
  fontSize: '15px',
  lineHeight: '24px',
};

const credentialLabel = {
  color: '#666666',
  marginRight: '8px',
};

const buttonContainer = {
  marginTop: '32px',
  marginBottom: '48px',
};

const button = {
  backgroundColor: '#111111',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#888888',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
  borderTop: '1px solid #eaeaea',
  paddingTop: '24px',
};
