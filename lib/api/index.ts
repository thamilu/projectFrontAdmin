/**
 * API Utilities
 * 
 * Centralized exports for all API utility functions
 * Promotes code reusability and DRY principles
 * 
 * @module lib/api
 */

export * from './backend-fetch';
export { buildBackendUrl, proxyToBackend } from './backend-fetch';
export * from './request-validation';
export { requireAuth } from './session-utils';
