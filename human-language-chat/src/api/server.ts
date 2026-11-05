import { handleApiRequest } from './routes';

/**
 * HTTP-agnostic server entry. The Vite demo runs locally in the browser.
 * To expose HTTP endpoints, mount this handler in a Node/Bun/edge adapter.
 */
export const handleRequest = handleApiRequest;
