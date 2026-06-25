import React, { useState } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Sparkles, Shield, Heart, User, Lock, Mail, 
  Eye, EyeOff, UserPlus, LogIn, ArrowLeft, Check, Compass as CompassIcon
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

// ==========================================
// INTERACTIVE GOLDEN LOTUS ANATOMY
// ==========================================
interface GoldenLotusProps {
  isOpen: boolean;
}

export function GoldenLotus({ isOpen }: GoldenLotusProps) {
  // A beautiful vertical vector petal drawn upwards from baseline origin (0, 30)
  const petalPath = "M 0 30 C -22 10, -18 -40, 0 -85 C 18 -40, 22 10, 0 30 Z";

  return (
    <motion.svg
      width="150"
      height="150"
      viewBox="0 0 300 300"
      className="drop-shadow-[0_0_15px_rgba(212,175,55,0.35)] cursor-pointer select-none"
      animate={{
        scale: [1, 1.03, 1],
      }}
      transition={{
        repeat: Infinity,
        duration: 4,
        ease: "easeInOut",
      }}
    >
      <defs>
        {/* Luminous linear gradient for golden petals */}
        <linearGradient id="goldPetalGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A6623" />
          <stop offset="25%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#FFF2B2" />
          <stop offset="75%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#A37E36" />
        </linearGradient>

        {/* Soft magical gold radial glow for background aura */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE066" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Radiant aura background loop */}
      <motion.circle
        cx="150"
        cy="150"
        r="75"
        fill="url(#centerGlow)"
        animate={{
          scale: isOpen ? [1.1, 1.4, 1.1] : [0.85, 0.95, 0.85],
          opacity: isOpen ? 0.9 : 0.45,
        }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />

      {/* Lotus local coordinates grouped at (150, 150) */}
      <g transform="translate(150, 150)">
        
        {/* ================= LAYER 4: OUTERMOST SPREADING PETALS ================= */}
        {/* Outer Left */}
        <motion.path
          d={petalPath}
          fill="url(#goldPetalGrad)"
          stroke="#5C4314"
          strokeWidth="0.7"
          opacity="0.85"
          style={{ originY: "30px" }}
          animate={{
            rotate: isOpen ? -95 : -35,
            scaleY: isOpen ? 0.92 : 0.5,
            scaleX: isOpen ? 1.05 : 0.55,
          }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
        {/* Outer Right */}
        <motion.path
          d={petalPath}
          fill="url(#goldPetalGrad)"
          stroke="#5C4314"
          strokeWidth="0.7"
          opacity="0.85"
          style={{ originY: "30px" }}
          animate={{
            rotate: isOpen ? 95 : 35,
            scaleY: isOpen ? 0.92 : 0.5,
            scaleX: isOpen ? 1.05 : 0.55,
          }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />

        {/* ================= LAYER 3: DEEP BACKGROUND PETALS ================= */}
        {/* Mid-Outer Left */}
        <motion.path
          d={petalPath}
          fill="url(#goldPetalGrad)"
          stroke="#6E5018"
          strokeWidth="0.7"
          opacity="0.9"
          style={{ originY: "30px" }}
          animate={{
            rotate: isOpen ? -68 : -22,
            scaleY: isOpen ? 1.02 : 0.65,
            scaleX: isOpen ? 1.08 : 0.62,
          }}
          transition={{ type: "spring", stiffness: 70, damping: 16 }}
        />
        {/* Mid-Outer Right */}
        <motion.path
          d={petalPath}
          fill="url(#goldPetalGrad)"
          stroke="#6E5018"
          strokeWidth="0.7"
          opacity="0.9"
          style={{ originY: "30px" }}
          animate={{
            rotate: isOpen ? 68 : 22,
            scaleY: isOpen ? 1.02 : 0.65,
            scaleX: isOpen ? 1.08 : 0.62,
          }}
          transition={{ type: "spring", stiffness: 70, damping: 16 }}
        />

        {/* ================= LAYER 2: INTERMEDIATE FLOWER BODY ================= */}
        {/* Main Side Left */}
        <motion.path
          d={petalPath}
          fill="url(#goldPetalGrad)"
          stroke="#805D1C"
          strokeWidth="0.8"
          opacity="0.95"
          style={{ originY: "30px" }}
          animate={{
            rotate: isOpen ? -40 : -12,
            scaleY: isOpen ? 1.12 : 0.8,
            scaleX: isOpen ? 1.12 : 0.68,
          }}
          transition={{ type: "spring", stiffness: 85, damping: 18 }}
        />
        {/* Main Side Right */}
        <motion.path
          d={petalPath}
          fill="url(#goldPetalGrad)"
          stroke="#805D1C"
          strokeWidth="0.8"
          opacity="0.95"
          style={{ originY: "30px" }}
          animate={{
            rotate: isOpen ? 40 : 12,
            scaleY: isOpen ? 1.12 : 0.8,
            scaleX: isOpen ? 1.12 : 0.68,
          }}
          transition={{ type: "spring", stiffness: 85, damping: 18 }}
        />

        {/* ================= LAYER 1: INNER INTENSE PETALS ================= */}
        {/* Inner Left */}
        <motion.path
          d={petalPath}
          fill="url(#goldPetalGrad)"
          stroke="#9C7326"
          strokeWidth="0.9"
          style={{ originY: "30px" }}
          animate={{
            rotate: isOpen ? -18 : -4,
            scaleY: isOpen ? 1.16 : 0.9,
            scaleX: isOpen ? 1.14 : 0.76,
          }}
          transition={{ type: "spring", stiffness: 95, damping: 19 }}
        />
        {/* Inner Right */}
        <motion.path
          d={petalPath}
          fill="url(#goldPetalGrad)"
          stroke="#9C7326"
          strokeWidth="0.9"
          style={{ originY: "30px" }}
          animate={{
            rotate: isOpen ? 18 : 4,
            scaleY: isOpen ? 1.16 : 0.9,
            scaleX: isOpen ? 1.14 : 0.76,
          }}
          transition={{ type: "spring", stiffness: 95, damping: 19 }}
        />

        {/* ================= LAYER 0: CENTRAL CORE SHIELD (BUD) ================= */}
        <motion.path
          d={petalPath}
          fill="url(#goldPetalGrad)"
          stroke="#B38728"
          strokeWidth="1.1"
          style={{ originY: "30px" }}
          animate={{
            rotate: 0,
            scaleY: isOpen ? 1.22 : 0.94,
            scaleX: isOpen ? 1.18 : 0.82,
          }}
          transition={{ type: "spring", stiffness: 105, damping: 20 }}
        />

        {/* ================= CENTER BRIGHT FILAMENTS & ANTHERS ================= */}
        <motion.g
          animate={{
            scale: isOpen ? 1.2 : 0.25,
            opacity: isOpen ? 1 : 0,
            y: isOpen ? -10 : 20,
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {/* Stem filament lines */}
          <line x1="0" y1="15" x2="-22" y2="-12" stroke="#FFE066" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="15" x2="22" y2="-12" stroke="#FFE066" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="15" x2="-12" y2="-24" stroke="#FFE066" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="15" x2="12" y2="-24" stroke="#FFE066" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="15" x2="0" y2="-28" stroke="#FFE066" strokeWidth="2.0" strokeLinecap="round" />

          {/* Glowing tip dots */}
          <circle cx="-22" cy="-12" r="3" fill="#FFF" />
          <circle cx="22" cy="-12" r="3" fill="#FFF" />
          <circle cx="-12" cy="-24" r="3" fill="#FFF" />
          <circle cx="12" cy="-24" r="3" fill="#FFF" />
          <circle cx="0" cy="-28" r="4.5" fill="#FFF" />
        </motion.g>

        {/* Centered luminous seed socket */}
        <motion.circle
          cx="0"
          cy="15"
          r="8"
          fill="#FFF"
          animate={{
            scale: isOpen ? [1, 1.25, 1] : 0.65,
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </g>
    </motion.svg>
  );
}

// ==========================================
// MAIN AUTH COMPONENT
// ==========================================
export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form entries
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'therapist' | 'receptionist'>('admin');

  // Interactive focuses for expanding the golden lotus
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // The lotus is in expanded state if focused, hovered, currently logging in or creating account
  const isLotusOpen = isFocused || isHovered || loading || mode === 'signup' || email.length > 0;

  // Google Sign In Popup (Preserving pre-existing code helper)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      onLoginSuccess({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        token,
        role: 'admin', // default google logins to admin
      });
    } catch (err: any) {
      console.error('Error logging in with Firebase Popup:', err);
      setError('Ocorreu um erro no login via Google. Verifique sua conexão ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler for Email/Password Sign-In & Sign-Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('A senha de acesso precisa conter no mínimo 6 caracteres.');
        }
        if (!name.trim()) {
          throw new Error('Por favor, informe seu Nome Completo para cadastro.');
        }

        // Register in Firebase Auth
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        // Set name in user credentials profile
        await updateProfile(user, { displayName: name });

        // Retrieve Bearer Token
        const token = await user.getIdToken();

        // Sync and configure level of permission into PostgreSQL backend via API
        try {
          await fetch('/api/users/profile', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role, name }),
          });
        } catch (dbErr) {
          console.error("PostgreSQL user-role synchronization postponed:", dbErr);
        }

        onLoginSuccess({
          uid: user.uid,
          email: user.email,
          displayName: name,
          photoURL: null,
          token,
          role,
        });
      } else {
        // LogIn Action
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const user = credential.user;
        const token = await user.getIdToken();

        // Retrieve actual role from database
        let userRole = 'admin'; 
        try {
          const checkRes = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (checkRes.ok) {
            const data = await checkRes.json();
            userRole = data.dbUser?.role || 'admin';
          }
        } catch (meError) {
          console.error("Database response failed, fallback role: admin", meError);
        }

        onLoginSuccess({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Membro Clínico',
          photoURL: user.photoURL,
          token,
          role: userRole,
        });
      }
    } catch (err: any) {
      console.error('Authentication process failed:', err);
      let localized = err.message || 'Houve um impasse na autenticação. Verifique os dados.';
      const code = err.code || '';
      const msg = err.message || '';
      
      if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        localized = 'E-mail ou senha incorretos. Por favor, revise.';
      } else if (code === 'auth/invalid-credential' || msg.includes('invalid-credential')) {
        localized = 'As credenciais informadas não são válidas para acesso.';
      } else if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use') || msg.includes('auth/email-already-in-use')) {
        localized = 'Este endereço de e-mail já possui um cadastro ativo.';
      } else if (code === 'auth/weak-password' || msg.includes('weak-password')) {
        localized = 'Escolha uma senha mais forte, com pelo menos 6 caracteres.';
      } else if (code === 'auth/invalid-email' || msg.includes('invalid-email')) {
        localized = 'Formato de e-mail considerado inválido pelo sistema.';
      } else if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        localized = 'O provedor de e-mail e senha está inativo no console de autenticação.';
      }
      setError(localized);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="auth-screen" 
      className="min-h-screen w-full flex items-center justify-center bg-[#0C0E12] px-4 py-12 relative overflow-hidden font-sans"
    >
      {/* Background ambient gold highlights */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#D4AF37]/3 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="max-w-md w-full bg-[#1A1D23] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col items-center relative z-10 transition-all duration-300 hover:border-[#D4AF37]/25"
      >
        {/* Animated Golden Lotus at target header */}
        <div className="mb-2 relative flex flex-col items-center">
          <GoldenLotus isOpen={isLotusOpen} />
          
          <div className="text-center -mt-2">
            <h1 className="text-xl font-bold tracking-tight font-serif text-[#D4AF37] italic flex items-center justify-center gap-1.5">
              Terapia Viva
            </h1>
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#94A3B8] font-sans mt-0.5">
              Integração de Saúde & Sabedoria
            </p>
          </div>
        </div>

        {/* State Toggle Title */}
        <div className="w-full text-center mb-6 pt-2 border-t border-white/5">
          <h2 className="text-sm font-semibold text-white">
            {mode === 'login' ? 'Conecte-se ao Consultório' : 'Abra sua Nova Conta'}
          </h2>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            {mode === 'login' 
              ? 'Insira suas credenciais cadastradas abaixo para acessar.' 
              : 'Preencha os campos para registrar seu usuário e permissão.'
            }
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full mb-4 p-3.5 bg-red-950/30 text-rose-300 border border-red-900/40 rounded-xl text-xs flex flex-col gap-2"
          >
            <div className="flex gap-2">
              <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed whitespace-pre-line">{error}</span>
            </div>
            {(error.includes('cadastro ativo') || error.includes('already-in-use') || error.includes('email-already-in-use')) && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="mt-1.5 text-left text-[#D4AF37] hover:text-white font-bold underline cursor-pointer text-[11px] self-start"
              >
                Clique aqui para ir para a tela de Login e entrar direto.
              </button>
            )}
          </motion.div>
        )}

        {/* Credential Inputs Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          <AnimatePresence mode="popLayout">
            {mode === 'signup' && (
              <motion.div
                key="name-role-blocks"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Full name input */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 font-sans">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-[#94A3B8]">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none transition-all placeholder-slate-500 font-sans"
                      placeholder="Ex: Dr. Lucas Medeiros"
                      required={mode === 'signup'}
                    />
                  </div>
                </div>

                {/* Level of Permission Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 font-sans">
                    Nível de Permissão (Cargo) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-[#94A3B8]">
                      <Shield className="w-4 h-4" />
                    </span>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none transition-all font-sans cursor-pointer appearance-none"
                    >
                      <option value="admin">Administrador (Total + Finanças) </option>
                      <option value="therapist">Terapeuta Integrativo (Clínica + Prontuários)</option>
                      <option value="receptionist">Recepcionista / Equipe Secretária</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email input field */}
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 font-sans">
              Endereço de E-mail *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-[#94A3B8]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none transition-all placeholder-slate-700 font-sans"
                placeholder="exemplo@clinic.com"
                required
              />
            </div>
          </div>

          {/* Password input field */}
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 font-sans">
              Senha de Acesso *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-[#94A3B8]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 pl-10 pr-10 text-xs text-white focus:outline-none transition-all placeholder-slate-700"
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#94A3B8] hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#C5A030] text-[#0c0e12] font-bold py-3 px-4 rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-50 text-xs cursor-pointer mt-6"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-[#0c0e12]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : mode === 'login' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {loading 
              ? 'Comunicando com Firebase...' 
              : mode === 'login' ? 'Acessar Sistema de Terapias' : 'Confirmar e Abrir Cadastro'
            }
          </button>
        </form>

        {/* Quick alternative toggle switch shortcut */}
        <div className="w-full mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-xs font-semibold text-[#D4AF37] hover:text-white transition decoration-[#D4AF37]/50 hover:underline cursor-pointer"
          >
            {mode === 'login' ? (
              <span className="flex items-center justify-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                Não possui conta? Cadastre-se com permissões
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Já possui uma conta? Realize o login direto
              </span>
            )}
          </button>
        </div>

        {/* Divider and Google Sign In */}
        <div className="w-full flex items-center justify-between my-5 select-none opacity-40">
          <span className="h-px bg-white/20 w-5/12" />
          <span className="text-[10px] text-slate-400 font-mono">OU</span>
          <span className="h-px bg-white/20 w-5/12" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-[#131519] hover:bg-white/5 text-white border border-white/10 py-2.5 px-4 rounded-xl transition active:scale-[0.98] disabled:opacity-50 text-[11px] font-semibold cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Seguir via Conta Google
        </button>

        {/* Footer info lock block */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] text-[#94A3B8]/60 uppercase tracking-wider select-none font-sans border-t border-white/5 pt-4 w-full">
          <Shield className="w-3.5 h-3.5 text-[#D4AF37]/50" />
          Acesso Criptografado & Certificado
        </div>
      </motion.div>
    </div>
  );
}
