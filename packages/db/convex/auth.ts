import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { api } from './_generated/api';

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (existingUser) {
      throw new Error('User already exists');
    }

    const userId = await ctx.auth.createUser(args);
    await ctx.db.insert('users', {
      name: args.name,
      email: args.email,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.auth.signIn(args);
    return session;
  },
});

export const signOut = mutation({
  args: {},
  handler: async (ctx) => {
    const session = await ctx.auth.getSession();
    if (session) {
      await ctx.auth.signOut();
    }
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const session = await ctx.auth.getSession();
    if (!session) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', session.user.email))
      .first();

    return user;
  },
});

export const getUserPosts = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('posts')
      .withIndex('by_author', (q) => q.eq('authorId', args.userId))
      .collect();
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const userId = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', session.user.email))
      .first();

    if (!userId) {
      throw new Error('User not found');
    }

    await ctx.db.insert('posts', {
      title: args.title,
      content: args.content,
      authorId: userId._id,
      published: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('posts')
      .withIndex('by_published', (q) => q.eq('published', true))
      .order('desc')
      .take(args.limit || 10);

    return posts;
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const userId = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', session.user.email))
      .first();

    if (!userId) {
      throw new Error('User not found');
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId._id !== userId._id) {
      throw new Error('Not authorized');
    }

    await ctx.db.delete(args.postId);
  },
});
