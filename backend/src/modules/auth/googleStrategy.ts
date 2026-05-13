import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { AppDataSource } from "../../database";
import { Usuario } from "../../database/entities/Usuario";
import { Empresa } from "../../database/entities/Empresa";

export function setupGoogleOAuth() {
  const googleClientID = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/auth/google/callback";

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

          const vinculoRepo = AppDataSource.getRepository("UsuarioEmpresa") as any;

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

              // ✅ CORREÇÃO: criar o vínculo UsuarioEmpresa
              await vinculoRepo.save(vinculoRepo.create({
                usuarioId: usuario.id,
                empresaId: novaEmpresa.id,
                role: "admin",
                ativa: true,
              }));
            }
          }

          const vinculo = await vinculoRepo.findOne({
            where: { usuarioId: usuario.id, ativa: true },
          });

          if (!vinculo) {
            // Usuário existe mas não tem empresa — cria uma automaticamente
            const nomeEmpresa = usuario.nome?.split(" ")[0] || "Minha Empresa";
            const slug = nomeEmpresa.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
            const novaEmpresa = empresaRepo.create({ nome: nomeEmpresa, slug });
            await empresaRepo.save(novaEmpresa);
            await vinculoRepo.save(vinculoRepo.create({
              usuarioId: usuario.id,
              empresaId: novaEmpresa.id,
              role: "admin",
              ativa: true,
            }));
            const empresa = novaEmpresa;
            return done(null, {
              id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              empresaId: empresa.id,
              empresaNome: empresa.nome,
              empresaSlug: empresa.slug,
              role: "admin",
            });
          }

          const empresa = await empresaRepo.findOne({ where: { id: vinculo.empresaId } });
          if (!empresa) return done(new Error("Empresa não encontrada"));

          return done(null, {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            empresaId: empresa.id,
            empresaNome: empresa.nome,
            empresaSlug: empresa.slug,
            role: vinculo.role,
          });
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