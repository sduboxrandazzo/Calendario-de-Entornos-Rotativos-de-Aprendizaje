// App.js
import React, { useState, useEffect } from 'react';
import ScheduleView from './ScheduleView';
import ScheduleUpload from './ScheduleUpload';
import './Dashboard.css'; // Importa tu CSS personalizado
import logo from './logo.png'; // Asegúrate de tener el archivo logo.png en la ruta indicada

function App() {
  // Estados para el login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [message, setMessage] = useState('');

  // Estado para las reservas
  const [reservations, setReservations] = useState([]);

  // Estados para crear y editar reservas (en caso de usarlos para edición)
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
        setMessage('¡Login exitoso!');
      } else {
        setMessage('Error: Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      setMessage('Ocurrió un error al iniciar sesión');
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

  // Función para editar reserva (se conserva el formulario de edición)
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
        setMessage('Reserva actualizada correctamente');
      } else {
        setMessage('Error al actualizar la reserva');
      }
    } catch (error) {
      console.error('Error al actualizar la reserva:', error);
      setMessage('Ocurrió un error al actualizar la reserva');
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
      setMessage('Ocurrió un error al eliminar la reserva');
    }
  };

  // Función para crear reserva directamente desde el horario (slot)
  const handleCreateReservationSlot = async ({ day, time, course, entorno, materia }) => {
    if (!token) {
      setMessage('Debes iniciar sesión para reservar un entorno');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ day, time, course, entorno, materia })
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(prev => [...prev, data.reservation]);
        setMessage(`Reserva creada exitosamente para ${entorno}`);
      } else {
        setMessage('Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      setMessage('Ocurrió un error al crear la reserva');
    }
  };

  // Variables de utilidad para estética y funcionalidad
  const handleUploadSuccess = (data) => {
    console.log('Horario importado:', data);
    setScheduleVersion(prev => prev + 1);
  };

  const handleSlotClick = (slotData) => {
    alert(`Intentando reservar para ${slotData.dia} - ${slotData.hora} - ${slotData.materia}`);
  };

  // Si el usuario no está autenticado, mostramos el formulario de login
  if (!token) {
    return (
      <div className="container my-4">
        <div className="dashboard-header text-center">
          <img src={logo} alt="Logo" className="logo" />
          <h1>¡Te damos la bienvenida!</h1>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
        </form>
        {message && <div className="mt-3 alert alert-info">{message}</div>}
      </div>
    );
  }

  // Dashboard: se reserva directamente desde la tabla
  return (
    <div className="container my-4">
      <div className="dashboard-header text-center">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Calendario Entornos Rotativos de Aprendizaje</h1>
      </div>
      <p className="lead text-center">Has iniciado sesión correctamente. Explora y gestiona tus reservas de entornos de aprendizaje.</p>
      {message && <div className="alert alert-info">{message}</div>}

      {/* Componente para subir el archivo CSV del horario */}
      <ScheduleUpload onUploadSuccess={handleUploadSuccess} />

      {/* Componente para visualizar el horario y hacer reservas directamente */}
      <ScheduleView 
        onSlotClick={handleSlotClick}
        version={scheduleVersion}
        reservations={reservations}
        onSlotReserve={handleCreateReservationSlot}
      />

      <h2 className="mt-5">Tus Reservas</h2>
      {reservations.length === 0 ? (
        <p>No se han realizado reservas aún.</p>
      ) : (
        <ul className="list-group">
          {reservations.map((res) => (
            <li key={res.id} className="list-group-item d-flex justify-content-between align-items-center">
              {editingReservation === res.id ? (
                <div>
                  <input type="text" className="form-control mb-1" value={editEntorno} onChange={(e) => setEditEntorno(e.target.value)} placeholder="Entorno" />
                  <input type="text" className="form-control mb-1" value={editMateria} onChange={(e) => setEditMateria(e.target.value)} placeholder="Materia" />
                  <input type="text" className="form-control mb-1" value={editCurso} onChange={(e) => setEditCurso(e.target.value)} placeholder="Curso" />
                  <button onClick={() => handleUpdateReservation(res.id)} className="btn btn-warning btn-sm mr-2">Guardar</button>
                  <button onClick={() => setEditingReservation(null)} className="btn btn-secondary btn-sm">Cancelar</button>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>
                    <strong>ID:</strong> {res.id} | <strong>Entorno:</strong> {res.entorno} | <strong>Materia:</strong> {res.materia} | <strong>Curso:</strong> {res.course || res.curso}
                  </span>
                  <div>
                    <button onClick={() => startEditing(res)} className="btn btn-warning btn-sm mr-2">Editar</button>
                    <button onClick={() => handleDeleteReservation(res.id)} className="btn btn-danger btn-sm">Eliminar</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => {
          localStorage.removeItem('token');
          setToken('');
        }} className="btn btn-secondary mt-4">
        Cerrar Sesión
      </button>
    </div>
  );
}

export default App;
