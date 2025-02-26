import React, { useState, useEffect } from 'react';
import ScheduleView from './ScheduleView';
import ScheduleUpload from './ScheduleUpload';

function App() {
  // Estados para el login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [message, setMessage] = useState('');

  // Estado para las reservas
  const [reservations, setReservations] = useState([]);

  // Estados para crear y editar reservas (se mantienen igual)
  const [entorno, setEntorno] = useState('');
  const [materia, setMateria] = useState('');
  const [curso, setCurso] = useState('');
  const [editingReservation, setEditingReservation] = useState(null);
  const [editEntorno, setEditEntorno] = useState('');
  const [editMateria, setEditMateria] = useState('');
  const [editCurso, setEditCurso] = useState('');

  // Estado para refrescar el horario
  const [scheduleVersion, setScheduleVersion] = useState(0);

  // Función para manejar el login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setMessage('Login exitoso!');
      } else {
        setMessage('Error en las credenciales');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      setMessage('Ocurrió un error');
    }
  };

  // Fetch de reservas una vez autenticado
  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/reservations', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(response => response.json())
        .then(data => setReservations(data))
        .catch(error => console.error('Error al obtener reservas:', error));
    }
  }, [token]);

  // Función para crear reserva
  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ entorno, materia, curso })
      });
      if (response.ok) {
        const data = await response.json();
        setReservations([...reservations, data.reservation]);
        setEntorno('');
        setMateria('');
        setCurso('');
        setMessage('Reserva creada exitosamente');
      } else {
        setMessage('Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      setMessage('Ocurrió un error');
    }
  };

  // Funciones para editar y eliminar reservas (se mantienen igual)
  const startEditing = (reservation) => {
    setEditingReservation(reservation.id);
    setEditEntorno(reservation.entorno);
    setEditMateria(reservation.materia);
    setEditCurso(reservation.curso);
  };

  const handleUpdateReservation = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ entorno: editEntorno, materia: editMateria, curso: editCurso })
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(reservations.map(r => r.id === id ? data.reservation : r));
        setEditingReservation(null);
        setMessage('Reserva actualizada exitosamente');
      } else {
        setMessage('Error al actualizar la reserva');
      }
    } catch (error) {
      console.error('Error al actualizar la reserva:', error);
      setMessage('Ocurrió un error');
    }
  };

  const handleDeleteReservation = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        setReservations(reservations.filter(r => r.id !== id));
        setMessage('Reserva eliminada');
      } else {
        setMessage('Error al eliminar la reserva');
      }
    } catch (error) {
      console.error('Error al eliminar la reserva:', error);
      setMessage('Ocurrió un error');
    }
  };

  const handleSlotClick = (slotData) => {
    alert(`Reservar para ${slotData.dia} ${slotData.hora} - ${slotData.materia}`);
  };

  // Función para actualizar el estado de refresco cuando se sube el horario exitosamente
  const handleUploadSuccess = (data) => {
    console.log('Horario importado:', data);
    setScheduleVersion(prev => prev + 1);
  };

  // Si el usuario no está autenticado, mostramos el formulario de login
  if (!token) {
    return (
      <div style={{ margin: '20px' }}>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label><br />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Contraseña:</label><br />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit">Ingresar</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    );
  }

  const handleCreateReservationSlot = async ({ day, time, course, entorno }) => {
    if (!token) {
      setMessage('Necesitas iniciar sesión para reservar un entorno');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ day, time, course, entorno })
      });
  
      if (response.ok) {
        const data = await response.json();
        setReservations(prev => [...prev, data.reservation]);
        setMessage('Reserva creada exitosamente para ' + entorno);
      } else {
        setMessage('Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      setMessage('Ocurrió un error al crear la reserva');
    }
  };
  

  // Dashboard: se muestra cuando el usuario está autenticado
  return (
    <div style={{ margin: '20px' }}>
      <h1>Dashboard</h1>
      <p>Has iniciado sesión correctamente.</p>
      {message && <p>{message}</p>}

      {/* Componente para subir el archivo CSV del horario */}
      <ScheduleUpload onUploadSuccess={handleUploadSuccess} />

      {/* Componente para visualizar el horario; se pasa la prop "version" */}
      <ScheduleView onSlotClick={handleSlotClick} version={scheduleVersion}   reservations={reservations} // <--- pasamos las reservas
  onSlotReserve={handleCreateReservationSlot} // <--- pasamos la función para reservar
/>

      <h2>Crear Nueva Reserva</h2>
      <form onSubmit={handleCreateReservation}>
        <div>
          <label>Entorno:</label><br />
          <input type="text" value={entorno} onChange={(e) => setEntorno(e.target.value)} required />
        </div>
        <div>
          <label>Materia:</label><br />
          <input type="text" value={materia} onChange={(e) => setMateria(e.target.value)} required />
        </div>
        <div>
          <label>Curso:</label><br />
          <input type="text" value={curso} onChange={(e) => setCurso(e.target.value)} required />
        </div>
        <button type="submit">Crear Reserva</button>
      </form>

      <h2>Tus Reservas</h2>
      {reservations.length === 0 ? (
        <p>No tienes reservas aún.</p>
      ) : (
        <ul>
          {reservations.map((res) => (
            <li key={res.id}>
              {editingReservation === res.id ? (
                <div>
                  <input type="text" value={editEntorno} onChange={(e) => setEditEntorno(e.target.value)} placeholder="Entorno" />
                  <input type="text" value={editMateria} onChange={(e) => setEditMateria(e.target.value)} placeholder="Materia" />
                  <input type="text" value={editCurso} onChange={(e) => setEditCurso(e.target.value)} placeholder="Curso" />
                  <button onClick={() => handleUpdateReservation(res.id)}>Guardar</button>
                  <button onClick={() => setEditingReservation(null)}>Cancelar</button>
                </div>
              ) : (
                <div>
                  <strong>ID:</strong> {res.id} | <strong>Entorno:</strong> {res.entorno} | <strong>Materia:</strong> {res.materia} | <strong>Curso:</strong> {res.curso}
                  <button onClick={() => startEditing(res)}>Editar</button>
                  <button onClick={() => handleDeleteReservation(res.id)}>Eliminar</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => {
          localStorage.removeItem('token');
          setToken('');
        }}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default App;
