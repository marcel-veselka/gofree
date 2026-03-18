import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from './auth';

const handler = toNextJsHandler(auth);

export const authHandler = handler;
