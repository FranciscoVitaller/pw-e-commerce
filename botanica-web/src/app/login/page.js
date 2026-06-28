"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // Función para Registrarse (Crear cuenta nueva)
  const manejarRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setMensaje('❌ Error: ' + error.message);
    } else {
      setMensaje('✅ ¡Registro exitoso! Revisa tu correo (si es necesario) o inicia sesión.');
    }
    setCargando(false);
  };

  // Función para Iniciar Sesión (Entrar con cuenta existente)
  const manejarLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setMensaje('❌ Error: ' + error.message);
    } else {
      setMensaje('✅ ¡Sesión iniciada con éxito! Bienvenido a Plantas Vita.');
      router.push('/');
    }
    setCargando(false);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        <h2 style={{ textAlign: 'center', color: 'var(--verde-oscuro)', marginBottom: '20px' }}>
          Ingresar a Plantas Vita
        </h2>

        {/* Mensaje de alerta */}
        {mensaje && (
          <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontSize: '0.9rem' }}>
            {mensaje}
          </div>
        )}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo Electrónico:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={manejarLogin} 
              disabled={cargando}
              className="btn-primario" 
              style={{ flex: 1, cursor: cargando ? 'not-allowed' : 'pointer' }}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={manejarRegistro} 
              disabled={cargando}
              className="btn-primario" 
              style={{ flex: 1, backgroundColor: 'white', color: 'var(--verde-oscuro)', border: '2px solid var(--verde-oscuro)', cursor: cargando ? 'not-allowed' : 'pointer' }}
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}