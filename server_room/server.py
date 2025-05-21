import asyncio
import websockets
import grpc
from concurrent import futures
import battleship_pb2
import battleship_pb2_grpc
import random
import string
import json

from models.party.party import Party

# Diccionario para guardar partidas
parties = {}

# Datos de configuración del WebSocket Server
WEBSOCKET_HOST = 'localhost'
WEBSOCKET_PORT = 9000
SOCKET_URL = f"ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}"

# -----------------------------
# Clase gRPC
# -----------------------------
class BattleShipService(battleship_pb2_grpc.BattleShipServiceServicer):
    def generate_code(self):
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    async def createMessage(self, request, context):
        print(request)
        code = self.generate_code()
        chat = []  # Placeholder para el objeto chat
        party = Party(code, 'BattleShip', int(request.amount_user), chat)
        new_id = party.join_party(request.current_id)

        parties[code] = party

        return battleship_pb2.CreateReply(
            confirmation=True,
            new_id=new_id,
            direction=SOCKET_URL,
            code = party.code
        )

    async def joinMessage(self, request, context):
        print(request)
        code = request.code
        if code not in parties:
            return battleship_pb2.JoinReply(
                confirmation=False,
                new_id="",
                direction=""
            )

        party = parties[code]
        new_id = party.join_party(request.current_id)
        print(f"number_players={party.amount_players} ({type(party.amount_players)})")
        return battleship_pb2.JoinReply(
            confirmation=True,
            new_id=new_id,
            direction=SOCKET_URL,
            number_players=str(party.amount_players)
        )

# -----------------------------
# Servidor WebSocket
# -----------------------------
async def handler(websocket):
    try:
        # Mensaje inicial de identificación
        init_message = await websocket.recv()
        init_data = json.loads(init_message)

        user_id = init_data.get("user_id")
        code = init_data.get("code")

        if not user_id or not code:
            await websocket.send(json.dumps({"error": "user_id y code requeridos"}))
            return

        if code not in parties:
            await websocket.send(json.dumps({"error": "Partida no encontrada"}))
            return

        party = parties[code]
        success = party.set_medium(user_id, websocket)

        if success:
            await websocket.send(json.dumps({
                "confirmation": True,
                "message": f"{user_id} conectado a partida {code}"
            }))
        else:
            await websocket.send(json.dumps({
                "confirmation": False,
                "message": f"{user_id} ocurrió un error al conectar"
            }))
            return

        # Bucle principal de escucha de mensajes
        async for mssg in websocket:
            data = json.loads(mssg)

            # Colocar barcos
            if data.get("action") == "set_position":
                position = data["position"]
                party.set_position(user_id, position)
                print(party.get_players())

                if party.state == 1:
                    turn = party.get_turn()
                    print('Holaap')
                    
                    for current_socket in party.get_players().values():
                        await current_socket.send(json.dumps({"confirmation": "ready", "turn":turn, "mssg":"All Players Ready To Play"}))
                    

            # Ataque
            elif data.get("action") == "attack":
                attacker = data["user_id"]
                x, y = data["x"], data["y"]
                result = party.play(attacker, x, y)

                for current_socket in party.get_players().values():
                    await current_socket.send(json.dumps(result))

            else:
                await websocket.send(json.dumps({"error": "Acción no válida"}))

    except Exception as e:
        print(f"Error en handler: {e}")

async def start_websocket_server():
    print("🚀 Iniciando WebSocket...")  
    async with websockets.serve(handler, WEBSOCKET_HOST, WEBSOCKET_PORT):
        print(f"WebSocket escuchando en {SOCKET_URL}")
        await asyncio.Future()  # run forever

# -----------------------------
# Servidor gRPC
# -----------------------------
def serve_grpc():
    server = grpc.aio.server()
    battleship_pb2_grpc.add_BattleShipServiceServicer_to_server(BattleShipService(), server)
    server.add_insecure_port('[::]:50051')
    return server

# -----------------------------
# Arranque
# -----------------------------

async def main():
    try:
        print("⏳ Iniciando servidores...")
        grpc_server = serve_grpc()
        await grpc_server.start()
        print("✅ gRPC server escuchando en puerto 50051")

        await asyncio.gather(
            grpc_server.wait_for_termination(),
            start_websocket_server()
        )
    except Exception as e:
        print(f"❌ Error al iniciar servidores: {e}")

if __name__ == '__main__':
    asyncio.run(main())



