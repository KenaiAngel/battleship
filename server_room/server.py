import asyncio
from websockets.legacy.server import serve, WebSocketServerProtocol
import grpc
from concurrent import futures
import battleship_pb2
import battleship_pb2_grpc
import random
import string
import json

from models.party.party import Party

# Diccionario global de partidas
parties = {}

# Configuración del WebSocket
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
        code = self.generate_code()
        chat = []  # Podrías reemplazar con un objeto Chat si es necesario
        party = Party(code, 'BattleShip', int(request.amount_user), chat)
        new_id = party.join_party(request.current_id)
        parties[code] = party
        return battleship_pb2.CreateReply(
            confirmation=True,
            new_id=new_id,
            direction=SOCKET_URL,
            code=party.code
        )

    async def joinMessage(self, request, context):
        code = request.code
        if code not in parties:
            return battleship_pb2.JoinReply(
                confirmation=False,
                new_id="",
                direction=""
            )
        party = parties[code]
        new_id = party.join_party(request.current_id)
        return battleship_pb2.JoinReply(
            confirmation=True,
            new_id=new_id,
            direction=SOCKET_URL,
            number_players=str(party.amount_players)
        )

# -----------------------------
# WebSocket Server
# -----------------------------
# -----------------------------
# Servidor WebSocket
# -----------------------------
async def handler(websocket):
    try:
        init_message = await websocket.recv()
        init_data = json.loads(init_message)

        user_id = init_data.get("user_id")
        code = init_data.get("code")
        print(f"🟡 Conexión recibida - user_id: {user_id}, code: {code}")

        if not user_id or not code:
            await websocket.send(json.dumps({"error": "user_id y code requeridos"}))
            print("🔴 user_id o code faltantes")
            return

        if code not in parties:
            await websocket.send(json.dumps({"error": "Partida no encontrada"}))
            print("🔴 Código de partida no existe")
            return

        party = parties[code]
        success = party.set_medium(user_id, websocket)
        

        if success:
            print(f"🟢 Socket asignado correctamente a {user_id}")
            await websocket.send(json.dumps({
                "confirmation": True,
                "message": f"{user_id} conectado a partida {code}"
            }))
        else:
            print(f"🔴 No se pudo asignar el socket a {user_id}")
            await websocket.send(json.dumps({
                "confirmation": False,
                "message": f"{user_id} ocurrió un error al conectar"
            }))
            return

        print(f"✅ Usuarios en partida {code}: {list(party.users.keys())}")
        print(f"✅ Sockets en partida {code}: {[(uid, sock.open) for uid, sock in party.users.items()]}")

        async for mssg in websocket:
            data = json.loads(mssg)
            print(f"📩 Mensaje recibido de {user_id}: {data}")

            if data.get("action") == "set_position":
                position = data["position"]
                print(f"📦 {user_id} envió posición: {position}")
                party.set_position(user_id, position)
                print(f"⚙️ Total jugadores listos: {party.players_ready}/{party.amount_players}")

                if party.state == 1:
                    print("🚦 Todos los jugadores listos. Enviando turno inicial.")
                    turn = party.get_turn()
                    
                    print(f"🎯 Jugadores activos: {list(party.get_players().keys())}")
                    
                    for uid, sock in party.get_players().items():
                        print(f"📌 Revisando {uid}: tipo={type(sock)}, abierto={getattr(sock, 'open', False)}")

                        if isinstance(sock, WebSocketServerProtocol) and sock.open:
                            try:
                                await sock.send(json.dumps({
                                    "confirmation": "ready",
                                    "turn": turn,
                                    "mssg": "All Players Ready To Play"
                                }))
                                print(f"📤 Enviado a {uid}")
                            except Exception as send_err:
                                print(f"❌ Error al enviar a {uid}: {send_err}")
                        else:
                            print(f"⚠️ Socket inválido o cerrado para {uid}")


            elif data.get("action") == "attack":
                attacker = data["user_id"]
                x, y = data["x"], data["y"]
                print(f"⚔️ {attacker} ataca a coordenadas ({x}, {y})")
                result = party.play(attacker, x, y)
                print(f"📊 Resultado del ataque: {result}")

                for uid, sock in party.get_players().items():
                    if sock and sock.open:
                        print(f"📤 Enviando resultado a {uid}")
                        await sock.send(json.dumps(result))
                    else:
                        print(f"❌ Socket de {uid} no disponible (sock={sock})")

            else:
                print(f"⚠️ Acción no válida: {data.get('action')}")
                await websocket.send(json.dumps({"error": "Acción no válida"}))

    except Exception as e:
        print(f"❌ Error en handler de {user_id}: {e}")

# -----------------------------
# Lanzadores de servidores
# -----------------------------

async def start_websocket_server():
    print("🚀 Iniciando WebSocket...")
    async with serve(handler, WEBSOCKET_HOST, WEBSOCKET_PORT):  # ← este es el `serve` correcto
        print(f"WebSocket escuchando en {SOCKET_URL}")
        await asyncio.Future()


def serve_grpc():
    server = grpc.aio.server()
    battleship_pb2_grpc.add_BattleShipServiceServicer_to_server(BattleShipService(), server)
    server.add_insecure_port('[::]:50051')
    return server

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

