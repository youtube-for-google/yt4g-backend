import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/userModel";

const GOOGLE_CLIENT_ID = process.env.OAUTH_GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.OAUTH_GOOGLE_CLIENT_SECRET!;
const CALLBACK_URL = process.env.OAUTH_REDIRECT_URI!;

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await User.findById(id);
  done(null, user || null);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const { id, displayName, emails, photos } = profile;

      const name = displayName || emails?.[0]?.value.split("@")[0] || "User";
      const email = emails?.[0]?.value || `${id}@google-oauth`;
      const avatar = photos?.[0]?.value || "";

      try {
        let user = await User.findOne({ providerId: id, provider: "google" });

        console.log("++++++", { name, email, avatar, id });
        if (!user) {
          user = await User.create({
            name: displayName,
            email: emails?.[0]?.value,
            provider: "google",
            providerId: id,
          });
        } else {
          // Optional: keep name/avatar updated if changed
          user.name = name;
          user.email = email;
          user.avatar = avatar;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
