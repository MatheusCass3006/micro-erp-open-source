import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { AppDataSource } from "../../database";
import { Usuario } from "../../database/entities/Usuario";
import { Empresa } from "../../database/entities/Empresa";

export function setupGoogleOAuth() {
  const googleClientID = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/api/auth/google/callback";

  if (!googleClientID || !googleClientSecret) {
    console.log("⚠️ Google OAuth não configurado");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const usuarioRepo = AppDataSource.getRepository(Usuario);
          const empresaRepo = AppDataSource.getRepository(Empresa);

          let usuario = await usuarioRepo.findOne({
            where: { googleId: profile.id },
          });

if (!usuario) {
            const userEmail = profile.emails?.[0]?.value;
            if (!userEmail) {
              return done(new Error("Email não fornecido pelo Google"));
            }
            usuario = await usuarioRepo.findOne({
              where: { email: userEmail },
            });

            if (usuario) {
              usuario.googleId = profile.id;
              usuario.avatarUrl = profile.photos?.[0]?.value || null;
              await usuarioRepo.save(usuario);
            } else {
              const nomeEmpresa = profile.displayName?.split(" ")[0] || "Minha Empresa";
              const slug = nomeEmpresa.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

              const novaEmpresa = empresaRepo.create({
                nome: nomeEmpresa,
                slug,
              });
              await empresaRepo.save(novaEmpresa);

              usuario = usuarioRepo.create({
                nome: profile.displayName || "Usuario Google",
                email: profile.emails?.[0]?.value || "sem-email@google.com",
                googleId: profile.id,
                emailVerificado: true,
                avatarUrl: profile.photos?.[0]?.value || null,
                senhaHash: null,
              });
              await usuarioRepo.save(usuario);
            }
          }

          return done(null, { id: usuario!.id, nome: usuario!.nome, email: usuario!.email });
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ where: { id } });
      done(null, usuario);
    } catch (error) {
      done(error, null);
    }
  });
}

export default passport;