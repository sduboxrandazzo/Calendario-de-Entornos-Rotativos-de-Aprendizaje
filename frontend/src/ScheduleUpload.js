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
    <div style={{ margin: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h2>Importar Horario</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: '10px' }}>Subir Horario</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ScheduleUpload;
