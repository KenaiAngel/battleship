from models.game.battleship.battleship import BattleShip
from models.chat.chat import Chat

class Party:
    def __init__(self, code, game_name, amount_players, chat):
        self.code = code
        self.users = []
        self.chat = chat
        self.game_name = game_name
        self.amount_players = amount_players
        self.game = self.which_game(self.game_name, amount_players)
        self.connected_users = 0
        
    def which_game(self, name, amount):
        game = None
        if name == 'BattleShip':
            game = BattleShip(amount)
        return game
    
    def join_party (self, user):

        response = self.game.add_new_player(user)
        self.connected_users += 1
        confirmation = response['confirmation']
        if not confirmation:
            new_id = user + str(self.connected_users)
            self.users.append(new_id)
            return new_id

        new_id = response['new_id']
        self.users.append(new_id)
        return new_id
    
    def set_possiton (self, id, possition):
        self.game.set_ships_for_player(id,possition)

