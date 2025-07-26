import React, { useEffect, useRef, useState } from 'react';

const synth = window.speechSynthesis;

function AsistenteWidget() {
  const [abierto, setAbierto] = useState(false);
  const [cedula, setCedula] = useState('');
  const [cedulaConfirmada, setCedulaConfirmada] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [respuestas, setRespuestas] = useState([
    { remitente: 'asistente', texto: '¡Hola! Soy tu asistente virtual. Por favor, dime tu cédula para empezar.' }
  ]);
  const [escuchando, setEscuchando] = useState(false);
  const [reconocimientoSoportado, setReconocimientoSoportado] = useState(false);
  const chatRef = useRef(null);
  const recognitionRef = useRef(null);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';
      setReconocimientoSoportado(true);

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (!cedulaConfirmada) {
          setCedula(transcript);
        } else {
          setMensaje(transcript);
        }
        setEscuchando(false);
      };

      recognitionRef.current.onerror = () => {
        setEscuchando(false);
      };

      recognitionRef.current.onend = () => {
        setEscuchando(false);
      };
    }
  }, [cedulaConfirmada]);

  const speak = (text) => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  const iniciarEscucha = () => {
    if (recognitionRef.current && !escuchando) {
      setEscuchando(true);
      recognitionRef.current.start();
    }
  };

  const detenerEscucha = () => {
    if (recognitionRef.current && escuchando) {
      recognitionRef.current.stop();
      setEscuchando(false);
    }
  };

  const enviarPregunta = async () => {
    if (!mensaje.trim()) return;

    setRespuestas(prev => [...prev, { remitente: 'usuario', texto: mensaje }]);

    try {
      // Simulación de API - reemplaza con tu endpoint real
      const response = await fetch('http://localhost:3001/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: mensaje, cedula })
      });

      const data = await response.json();
      const textoRespuesta = typeof data.respuesta === 'string' ? data.respuesta : 'Lo siento, no entendí tu consulta.';

      setRespuestas(prev => [...prev, { remitente: 'asistente', texto: textoRespuesta }]);
      speak(textoRespuesta);
    } catch (error) {
      const errorMsg = 'No se pudo obtener respuesta. Intenta más tarde.';
      setRespuestas(prev => [...prev, { remitente: 'asistente', texto: errorMsg }]);
      speak(errorMsg);
    }

    setMensaje('');
  };

  const confirmarCedula = () => {
    if (cedula.trim().length >= 6) {
      setCedulaConfirmada(true);
      const saludo = '¡Perfecto! Ya puedes preguntarme sobre tus facturas o notificaciones.';
      setRespuestas(prev => [...prev, { remitente: 'asistente', texto: saludo }]);
      speak(saludo);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [respuestas]);

  const styles = {
    container: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif'
    },
    abrirBtn: {
      backgroundColor: '#0077cc',
      color: 'white',
      border: 'none',
      padding: '15px',
      borderRadius: '50%',
      fontSize: '24px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    widget: {
      width: '350px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      display: abierto ? 'flex' : 'none',
      flexDirection: 'column',
      marginBottom: '10px',
      animation: abierto ? 'slideUp 0.3s ease' : 'none'
    },
    header: {
      backgroundColor: '#0077cc',
      color: 'white',
      padding: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    cerrarBtn: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '0',
      width: '24px',
      height: '24px'
    },
    body: {
      padding: '15px',
      height: '320px',
      overflowY: 'auto',
      backgroundColor: '#f8f9fa'
    },
    mensaje: {
      margin: '8px 0',
      padding: '10px 12px',
      borderRadius: '12px',
      maxWidth: '85%',
      wordWrap: 'break-word',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    mensajeUser: {
      backgroundColor: '#0077cc',
      color: 'white',
      alignSelf: 'flex-end',
      marginLeft: 'auto',
      borderBottomRightRadius: '4px'
    },
    mensajeBot: {
      backgroundColor: 'white',
      color: '#333',
      alignSelf: 'flex-start',
      border: '1px solid #e0e0e0',
      borderBottomLeftRadius: '4px'
    },
    inputContainer: {
      padding: '15px',
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderTop: '1px solid #e0e0e0'
    },
    input: {
      flex: 1,
      padding: '10px 12px',
      borderRadius: '20px',
      border: '1px solid #ddd',
      fontSize: '14px',
      outline: 'none'
    },
    btn: {
      backgroundColor: '#0077cc',
      color: 'white',
      border: 'none',
      padding: '10px',
      borderRadius: '50%',
      cursor: 'pointer',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px'
    },
    micBtn: {
      backgroundColor: escuchando ? '#ff4444' : '#28a745',
      color: 'white',
      border: 'none',
      padding: '10px',
      borderRadius: '50%',
      cursor: 'pointer',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      animation: escuchando ? 'pulse 1s infinite' : 'none'
    },
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
      
      <div style={styles.widget}>
        <div style={styles.header}>
          <span>🤖 Asistente Virtual</span>
          <button 
            style={styles.cerrarBtn}
            onClick={() => setAbierto(false)}
          >
            ✕
          </button>
        </div>
        
        <div style={styles.body} ref={chatRef}>
          <div style={styles.chatContainer}>
            {respuestas.map((r, index) => (
              <div 
                key={index} 
                style={{
                  ...styles.mensaje,
                  ...(r.remitente === 'usuario' ? styles.mensajeUser : styles.mensajeBot)
                }}
              >
                {r.texto}
              </div>
            ))}
          </div>
        </div>
        
        <div style={styles.inputContainer}>
          {!cedulaConfirmada ? (
            <>
              <input
                style={styles.input}
                type="text"
                placeholder="Escribe tu cédula..."
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmarCedula();
                }}
              />
              {reconocimientoSoportado && (
                <button
                  style={styles.micBtn}
                  onClick={escuchando ? detenerEscucha : iniciarEscucha}
                  title={escuchando ? "Detener escucha" : "Iniciar escucha"}
                >
                  🎤
                </button>
              )}
              <button
                style={styles.btn}
                onClick={confirmarCedula}
                title="Confirmar cédula"
              >
                ✓
              </button>
            </>
          ) : (
            <>
              <input
                style={styles.input}
                type="text"
                placeholder="Escribe o habla tu pregunta..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') enviarPregunta();
                }}
              />
              {reconocimientoSoportado && (
                <button
                  style={styles.micBtn}
                  onClick={escuchando ? detenerEscucha : iniciarEscucha}
                  title={escuchando ? "Detener escucha" : "Iniciar escucha"}
                >
                  🎤
                </button>
              )}
              <button
                style={styles.btn}
                onClick={enviarPregunta}
                title="Enviar mensaje"
              >
                📤
              </button>
            </>
          )}
        </div>
      </div>
      
      <button
        style={styles.abrirBtn}
        onClick={() => setAbierto(!abierto)}
        title="Abrir asistente virtual"
      >
        💬
      </button>
    </div>
  );
}

export default AsistenteWidget;