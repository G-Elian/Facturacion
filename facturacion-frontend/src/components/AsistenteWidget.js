// src/components/AsistenteWidget.js
import React, { useState, useEffect, useRef } from 'react';
import './AsistenteWidget.css';

function AsistenteWidget() {
  const [visible, setVisible] = useState(false);
  const [cedula, setCedula] = useState('');
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [esperandoCedula, setEsperandoCedula] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (respuesta) {
      const synth = window.speechSynthesis;
      const utter = new SpeechSynthesisUtterance(respuesta);
      synth.speak(utter);
    }
  }, [respuesta]);

  const enviarPregunta = async () => {
    if (esperandoCedula && cedula.trim() === '') {
      setRespuesta('Por favor, indícame tu número de cédula.');
      return;
    }

    if (!pregunta.trim()) return;

    try {
      const res = await fetch('http://localhost:3001/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta, cedula })
      });

      const data = await res.json();
      setRespuesta(data.respuesta || 'No entendí tu pregunta.');
    } catch (err) {
      setRespuesta('Ocurrió un error. Intenta más tarde.');
    }
  };

  const toggleChat = () => {
    setVisible(!visible);
    setRespuesta('');
    setPregunta('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') enviarPregunta();
  };

  return (
    <div className="asistente-widget">
      {!visible ? (
        <button className="abrir-asistente" onClick={toggleChat}>💬 Asistente</button>
      ) : (
        <div className="asistente-box">
          <div className="asistente-header">
            <strong>Hola 👋 ¿En qué puedo ayudarte?</strong>
            <button onClick={toggleChat}>✖</button>
          </div>

          {esperandoCedula ? (
            <div className="asistente-body">
              <label>Cédula:</label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ej: 9-123-456"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && cedula.trim() !== '') {
                    setEsperandoCedula(false);
                  }
                }}
              />
              <button disabled={!cedula.trim()} onClick={() => setEsperandoCedula(false)}>Continuar</button>
            </div>
          ) : (
            <div className="asistente-body">
              <div className="chat">
                <p><strong>🤖:</strong> {respuesta}</p>
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Haz una pregunta..."
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button onClick={enviarPregunta}>Enviar</button>
              <button className="btn-volver" onClick={() => {
                setEsperandoCedula(true);
                setCedula('');
                setPregunta('');
                setRespuesta('');
              }}>Cambiar cédula</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AsistenteWidget;
