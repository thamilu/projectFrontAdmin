/**
 * Centralized Client-Safe Core Auth Package Entrypoint
 * 
 * Exposes all client-safe configuration, schemas, components, types, and errors.
 */

// Config (Client-Safe parts)
export * from './config/auth.config';

// Schemas
export * from './schemas/token.schema';
export * from './schemas/validation.schema';

// Types and Errors
export * from './types/errors';
export * from './types/auth.types';

// Components
export * from './components/admin-guard';

