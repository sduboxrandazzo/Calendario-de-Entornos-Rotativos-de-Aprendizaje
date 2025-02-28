// ScheduleUpload.js
import React, { useState } from 'react';

function ScheduleUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Selecciona un archivo primero.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/schedule/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setMessage('Horario importado exitosamente');
        if (onUploadSuccess) {
          onUploadSuccess(data.data);
        }
      } else {
        setMessage('Error al subir el horario');
      }
    } catch (error) {
      console.error('Error al subir el horario:', error);
      setMessage('Ocurrió un error al subir el horario');
    }
  };

  return (
    <div className="my-4 p-3 border rounded">
      <h2>Importar Horario</h2>
      <div className="form-group">
        <input type="file" accept=".csv" className="form-control-file" onChange={handleFileChange} />
      </div>
      <button onClick={handleUpload} className="btn btn-primary">Subir Horario</button>
      {message && <div className="mt-2 alert alert-info">{message}</div>}
    </div>
  );
}

export default ScheduleUpload;
