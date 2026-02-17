import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple hash function
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Sign up mutation
export const signup = mutation({
  args: { name: v.string(), email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash,
      createdAt: Date.now(),
    });

    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
    });

    return { userId, token, name: args.name };
  },
});

// Login mutation
export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordHash = await hashPassword(args.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
    });

    return { userId: user._id, token, name: user.name };
  },
});

// Me query
export const me = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    return { userId: user._id, name: user.name, email: user.email };
  },
});

// Logout mutation
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    return true;
  },
});
