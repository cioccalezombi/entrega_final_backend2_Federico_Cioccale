import passport from "passport";
import local from "passport-local";
import jwt from "passport-jwt";
import { User } from "../models/user.model.js";
import { isValidPassword } from "../utils/bcrypt.js";
import { config } from "./env.js";

const LocalStrategy = local.Strategy;
const JwtStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;

const cookieExtractor = (req) => null;

export function initializePassport() {
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password", session: false },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) return done(null, false, { message: "User not found" });

          const ok = isValidPassword(password, user.password);
          if (!ok) return done(null, false, { message: "Invalid credentials" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    "current",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.JWT_SECRET,
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.id).select("-password");
          if (!user) return done(null, false, { message: "User not found" });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}
