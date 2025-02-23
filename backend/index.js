const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Servidor backend funcionando');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
