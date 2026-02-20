import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  sessions: defineTable({
    userId: v.id('users'),
    token: v.string(),
    expiresAt: v.number(),
  }).index('by_token', ['token']),

  // Oracle requests
  requests: defineTable({
    userId: v.optional(v.id('users')),
    query: v.string(),
    dataType: v.string(), // crypto_price, weather, stock, etc.
    params: v.any(), // { pair: 'bitcoin', location: 'Melbourne', etc. }
    status: v.string(), // pending, processing, completed, failed
    consensusValue: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index('by_status', ['status'])
    .index('by_created', ['createdAt']),

  // Agent submissions
  submissions: defineTable({
    requestId: v.id('requests'),
    agentId: v.string(),
    agentName: v.string(),
    value: v.number(),
    source: v.string(),
    timestamp: v.number(),
    responseTime: v.number(), // ms
    isConsensus: v.optional(v.boolean()),
  }).index('by_request', ['requestId'])
    .index('by_agent', ['agentId']),

  // Agent registry
  agents: defineTable({
    agentId: v.string(),
    name: v.string(),
    url: v.optional(v.string()),
    stake: v.number(),
    totalSubmissions: v.number(),
    successfulSubmissions: v.number(),
    totalEarnings: v.number(),
    lastActive: v.number(),
    isActive: v.boolean(),
  }).index('by_agent_id', ['agentId']),
});
