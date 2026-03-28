import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const toPublicUser = (user) => ({
  id: user._id?.toString?.() || user.id?.toString?.() || "",
  name: user.name,
  email: user.email,
  role: user.role || "user",
  createdAt: user.createdAt || null,
  updatedAt: user.updatedAt || null,
});

export const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role || "user",
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );

export const buildAuthResponse = (user) => ({
  token: signToken(user),
  user: toPublicUser(user),
});
