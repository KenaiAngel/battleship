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
        self.players_ready = 0
        #En preparacion/ 1 Jugando
        self.state = 0 
        
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
    
    def set_position (self, id, position):
       if self.game.set_ships_for_player(id,position):
           self.players_ready +=1
           print(f' {self.players_ready} == {self.amount_players}')
           if self.players_ready == self.amount_players:
            self.state = 1
    
    def play (self, id,x,y):
        mssg = self.game.attack(id,x,y)

        if mssg['impact'] == False :
            return {'turn': mssg['turn'], 'x':x,'y':y, 'mssg': 'no impact'}

        if mssg['winner']:
            return {'winner':mssg['winner'], 'mssg': 'win match'}
        
        return {'turn': mssg['turn'], 'who': mssg['who'],'x':x,'y':y, 'mssg': 'no impact'}

           

