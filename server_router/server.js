const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// __dirname está disponible directamente en CommonJS
const PROTO_PATH = path.join(__dirname, './grpc_proto/battleship_proto/battleship.proto');

// Cargar el archivo .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const battleshipPackage = grpc.loadPackageDefinition(packageDefinition).battleship;

// Crear cliente gRPC apuntando al servidor de Python
const grpcClient = new battleshipPackage.BattleShipService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const app = express();
const PORT = 3000;

app.use(express.json());


// Ruta para unirse a una partida existente
app.post('/api/get-access-to-game', (req, res) => {
  const { user_id, code } = req.body;

  grpcClient.joinMessage(
    {
      current_id: user_id,
      code: code,
    },
    (err, response) => {
      if (err) {
        console.error('Error en gRPC:', err);
        return res.status(500).json({ error: 'Error al unirse a la partida' });
      }

      return res.json({
        confirmation: response.confirmation,
        new_id: response.new_id,
        direction: response.direction,
        number_players: response.number_players
      });
    }
  );
});

// Ruta para crear una nueva partida 
app.post('/api/post-new-game', (req, res) => {
  const { user_id, number_players, spectators } = req.body;

  grpcClient.createMessage(
    {
      amount_user: number_players.toString(),
      current_id: user_id,
      spectators: Boolean(spectators),
    },
    (err, response) => {
      if (err) {
        console.error('Error en gRPC:', err);
        return res.status(500).json({ error: 'Error al crear partida' });
      }
      console.log(response);
      return res.json({
        confirmation: response.confirmation,
        new_id: response.new_id,
        direction: response.direction,
        code: response.code
      });
    }
  );
});

// Iniciar servidor Express
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});
