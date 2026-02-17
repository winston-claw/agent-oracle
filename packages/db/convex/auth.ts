import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get current user by email
export const me = query({
  args: {},
  handler: async (ctx) => {
    // For now, we'll pass the email as a header or just return a demo user
    // In production, you'd use proper session auth
    return null;
  },
});

// Sign up with email/password
export const signup = mutation({
  args: { 
    email: v.string(), 
    password: v.string(),
    name: v.string() 
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
    
    if (existing) {
      throw new Error('User already exists');
    }
    
    // Create user (in production, hash the password!)
    const userId = await ctx.db.insert('users', {
      name: args.name,
      email: args.email,
      password: args.password, // In production: await hash(args.password)
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return { id: userId, email: args.email, name: args.name };
  },
});

// Sign in with email/password
export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // In production: if (await verify(args.password, user.password)) ...
    if (user.password !== args.password) {
      throw new Error('Invalid email or password');
    }
    
    return { id: user._id, email: user.email, name: user.name };
  },
});
