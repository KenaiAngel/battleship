from concurrent import futures
import grpc
import battleship_pb2
import battleship_pb2_grpc

from models.party.party import Party
from models.game.battleship.battleship import BattleShip
from models.chat.chat import Chat

online_code = []

def instantiate_game (amount_players, current_id):
    new_game = BattleShip(amount_players)
    new_chat = Chat()
    new_party = Party(amount_players, 123,new_game,new_chat)
    online_code = new_party.code
    return new_party.code

def join_game ():
    pass



"""
class BattleShipService (battleship_pb2_grpc.BattleShipServiceServicer):
    def createMessage(self,request, context):
        amount_user =  request.amount_user
        user_id = request.current_id
        spectators = request.spectators


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    chat_pb2_grpc.add_ChatServiceServicer_to_server(ChatService(), server)
    server.add_insecure_port('[::]:50051')  # Escucha en el puerto 50051
    server.start()
    print("Servidor gRPC escuchando en puerto 50051...")
    server.wait_for_termination()

serve()"""

