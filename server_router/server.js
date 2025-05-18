// server.js
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para que Express entienda JSON en el cuerpo (body)
app.use(express.json());

// Ruta GET donde el cliente envía algo
app.post('/api/get-access-to-game', (req, res) => {
  const { user_id, code } = req.body;          // Lo que manda el cliente
  console.log('Recibido del cliente:', user_id,code);

  // Respondemos con confirmación, nuevo id y la direccion del socket
  res.json({
    confirmation: true,
    new_id: 'Lobito1',
    direction: 'werewfdfdf'
  });
});


// Ruta GET donde el cliente envía algo
app.post('/api/get-access-to-game', (req, res) => {
  const { user_id, code } = req.body;          // Lo que manda el cliente
  console.log('Recibido del cliente:', user_id,code);

  // Respondemos con confirmación, nuevo id y la direccion del socket
  res.json({
    confirmation: true,
    new_id: 'Lobito1',
    direction: 'werewfdfdf'
  });
});

// Ruta POST donde el cliente envía algo
app.post('/api/post-new-game', (req, res) => {
  const { user_id, number_players, spectators } = req.body;          // Lo que manda el cliente
  console.log('Recibido del cliente:', user_id,number_players, spectators );

  // Respondemos con confirmación, nuevo id y la direccion del socket
  res.json({
    confirmation: true,
    new_id: 'Lobito1',
    direction: 'werewfdfdf'
  });
});

// Arrancamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
