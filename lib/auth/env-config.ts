export interface KeycloakConfig {
  clientId: string;
  clientSecret?: string;
  issuer: string;
}

export function getKeycloakConfig(): KeycloakConfig {
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const issuer = process.env.KEYCLOAK_ISSUER;

  if (!clientId || !issuer) {
    throw new Error('Missing required Keycloak environment variables: KEYCLOAK_CLIENT_ID, KEYCLOAK_ISSUER');
  }

  return {
    clientId,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    issuer,
  };
}
