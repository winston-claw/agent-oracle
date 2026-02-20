import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { createOracleRequest, getOracleResult, getOracleStats } from './oracle/http';

const http = httpRouter();

http.route({
  path: '/api/oracle/create',
  method: 'POST',
  handler: createOracleRequest,
});

http.route({
  path: '/api/oracle/result',
  method: 'GET',
  handler: getOracleResult,
});

http.route({
  path: '/api/oracle/stats',
  method: 'GET',
  handler: getOracleStats,
});

export default http;
