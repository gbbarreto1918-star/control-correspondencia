import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Loader2 } from 'lucide-react'
import { useAuth } from './AuthContext'

const PIN_LENGTH = 6

export default function PinLogin() {
  const [pin, setPin] = useState(Array(PIN_LENGTH).fill(''))
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [validating, setValidating] = useState(false)
  const [shake, setShake] = useState(false)

  const inputRefs = useRef([])
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (currentPin) => {
    const pinString = currentPin.join('')
    if (pinString.length !== PIN_LENGTH) return

    setValidating(true)
    setError(false)
    setErrorMessage('')

    const success = await login(pinString)

    if (success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(true)
      setErrorMessage('PIN incorrecto')
      triggerShake()
      setPin(Array(PIN_LENGTH).fill(''))
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus()
        }
      }, 100)
    }

    setValidating(false)
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const digit = value.slice(-1)
    const newPin = [...pin]
    newPin[index] = digit

    setPin(newPin)
    setError(false)
    setErrorMessage('')

    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (digit && index === PIN_LENGTH - 1) {
      const allFilled = newPin.every((d) => d !== '')
      if (allFilled) {
        handleSubmit(newPin)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (pin[index] === '' && index > 0) {
        const newPin = [...pin]
        newPin[index - 1] = ''
        setPin(newPin)
        inputRefs.current[index - 1]?.focus()
      } else {
        const newPin = [...pin]
        newPin[index] = ''
        setPin(newPin)
      }
      e.preventDefault()
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === 'ArrowRight' && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH)
    if (pasted.length === 0) return

    const newPin = [...pin]
    for (let i = 0; i < pasted.length; i++) {
      newPin[i] = pasted[i]
    }
    setPin(newPin)

    const nextIndex = Math.min(pasted.length, PIN_LENGTH - 1)
    inputRefs.current[nextIndex]?.focus()

    if (pasted.length === PIN_LENGTH) {
      handleSubmit(newPin)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Glass card */}
        <div className="glass-card-static p-10">
          {/* Logo / Icon */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-gradient text-center">
              Control de Correspondencia
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Ingrese su PIN de acceso
            </p>
          </div>

          {/* PIN Input */}
          <div
            className={`flex justify-center gap-3 mb-8 ${shake ? 'animate-shake' : ''}`}
          >
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={validating}
                autoComplete="off"
                className={`
                  w-14 h-14 text-center text-2xl font-bold
                  bg-white/5 backdrop-blur-sm rounded-xl
                  border outline-none
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    error
                      ? 'border-red-500 text-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                      : 'border-white/10 text-slate-50 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                  }
                `}
              />
            ))}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center justify-center gap-2 mb-6 animate-fadeIn">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Loading State */}
          {validating && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <p className="text-slate-400 text-sm">Verificando PIN...</p>
            </div>
          )}

          {/* Footer hint */}
          <div className="text-center">
            <p className="text-slate-500 text-xs">
              Ingrese los 6 dígitos de su PIN para acceder al sistema
            </p>
          </div>
        </div>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-10px); }
          30%, 70% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  )
}
