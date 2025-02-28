import React, { useEffect, useState } from 'react';

// Franja horaria fija
const timeSlots = [
  '8:15 a 8:55',
  '8:55 a 9:35',
  '9:35 a 9:50', // Recreo
  '9:50 a 10:30',
  '10:30 a 11:10',
  '11:10 a 11:25', // Recreo
  '11:25 a 12:05',
  '12:05 a 12:45',
  '12:45 a 13:20', // Almuerzo
  '13:20 a 14:00 (PRE-HORA)',
  '14:00 a 14:40',
  '14:40 a 15:20',
  '15:20 a 15:30', // Recreo
  '15:30 a 16:10'
];

// Días de la semana
const days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

// Lista de entornos disponibles
const ENTORNOS = [
  "Robótica",
  "Colaboratorio",
  "ConCiencia",
  "Zona SAP",
  "CreArte",
  "TED Classroom",
  "Atelier Digital",
  "Manos a la Obra"
];

function ScheduleView({ onSlotClick, version, reservations, onSlotReserve }) {
  const [schedule, setSchedule] = useState([]);

  // Cargar el horario desde el backend cada vez que "version" cambie
  useEffect(() => {
    fetch('http://localhost:5000/api/schedule')
      .then(response => response.json())
      .then(data => {
        console.log('Horario recibido:', data);
        setSchedule(data);
      })
      .catch(error => console.error('Error al obtener horario:', error));
  }, [version]);

  // Obtiene los cursos (únicos) para un día dado
  const getCoursesForDay = (day) => {
    const items = schedule.filter(item => item.dia.toUpperCase() === day);
    const coursesSet = new Set(items.map(item => item.curso));
    return Array.from(coursesSet);
  };

  // Devuelve todos los registros (items) para (día, hora, curso)
  const getItemsForSlot = (day, time, course) => {
    return schedule.filter(
      item =>
        item.dia.toUpperCase() === day &&
        item.hora === time &&
        item.curso === course
    );
  };

  /**
   * Obtiene la lista de entornos **ya reservados** en ese día y franja horaria,
   * sin importar la materia (ni subgrupo).
   * Así se bloquea globalmente para cualquier materia/submateria.
   */
  const getReservedEnvsForSlot = (day, time) => {
    if (!reservations) return [];
    return reservations
      .filter(r => r.day === day && r.time === time)
      .map(r => r.entorno);
  };

  return (
    <div className="my-4">
      <h2>Horario</h2>
      {days.map(day => {
        const courses = getCoursesForDay(day);
        return (
          <div key={day} className="mb-4">
            <h3>{day}</h3>
            <table
              className="table table-bordered table-striped"
              style={{ width: '80%', margin: '0 auto', borderCollapse: 'collapse' }}
            >
              <thead>
                <tr>
                  <th>HORAS</th>
                  {courses.map(course => (
                    <th key={course} style={{ backgroundColor: '#cceeff' }}>
                      {course}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, index) => (
                  <tr key={index}>
                    <td>{slot}</td>
                    {courses.map(course => {
                      const items = getItemsForSlot(day, slot, course);
                      return (
                        <td key={course + slot} style={{ verticalAlign: 'top', padding: '5px' }}>
                          {items.length > 0 ? (
                            items.map((itm, idx) => {
                              // Busca si ya existe reserva para este (día, hora, curso, materia)
                              const rsv = reservations.find(r =>
                                r.day === day &&
                                r.time === slot &&
                                r.course === course &&
                                r.materia === itm.materia
                              );
                              // Entornos reservados globalmente para esta franja (sin discriminar materia)
                              const reservedEnvs = getReservedEnvsForSlot(day, slot);

                              return (
                                <div
                                  key={idx}
                                  style={{
                                    marginBottom: '5px',
                                    borderBottom: '1px solid #ccc',
                                    paddingBottom: '3px',
                                    backgroundColor: rsv ? '#d4edda' : 'transparent'
                                  }}
                                >
                                  <div>
                                    <strong>{itm.materia}</strong>
                                  </div>
                                  <div>{itm.docente}</div>
                                  {rsv ? (
                                    <div className="mt-1 text-success">
                                      <strong>Entorno:</strong> {rsv.entorno}
                                    </div>
                                  ) : (
                                    <select
                                      defaultValue=""
                                      className="form-control form-control-sm mt-2"
                                      onChange={(e) => {
                                        const entornoElegido = e.target.value;
                                        if (entornoElegido) {
                                          onSlotReserve({
                                            day,
                                            time: slot,
                                            course,
                                            materia: itm.materia,
                                            entorno: entornoElegido
                                          });
                                          e.target.value = "";
                                        }
                                      }}
                                    >
                                      <option value="">Reservar entorno...</option>
                                      {ENTORNOS.map(env => (
                                        <option
                                          key={env}
                                          value={env}
                                          disabled={reservedEnvs.includes(env)}
                                        >
                                          {env}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              );
                            })
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export default ScheduleView;
