'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EmailPage() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = () => {
const regex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!regex.test(email)) {
  return res.status(400).json({
    error: "Correo no permitido"
  })
}

    // Guardar en el navegador
    localStorage.setItem('escapp_email', email)

    // Ir a la página principal
    router.push('/')
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2>Ingrese su correo</h2>

        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8 }}
        />

        <button onClick={handleSubmit} style={{ padding: 10 }}>
          Continuar
        </button>
      </div>
    </div>
  )
}