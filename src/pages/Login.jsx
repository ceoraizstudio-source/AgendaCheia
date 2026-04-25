import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const navigate = useNavigate()
  const signIn = useAuthStore((s) => s.signIn)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/pipeline')
    } catch (err) {
      setError('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,166,35,0.18), transparent 60%)',
      }}
    >
      <div className="w-full max-w-[380px] flex flex-col items-center">
        <img
          src="/logotipo.svg"
          alt="Agenda Cheia"
          className="h-14 w-auto mb-8"
        />

        <div
          className="w-full rounded-[20px] p-8"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h1 className="text-[24px] mb-2">Bem-vindo</h1>
          <p
            className="text-[13px] mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Insira suas credenciais para acessar seu funil.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                E-mail
              </label>
              <Input
                type="email"
                placeholder="voce@agendacheia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Senha
                </label>
                <a
                  href="#"
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-label="Alternar visibilidade da senha"
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.5} />
                  ) : (
                    <Eye size={16} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[12px] font-medium" style={{ color: 'var(--color-danger)' }}>
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Acessar'}
              {!loading && <ArrowRight size={16} strokeWidth={2} />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
