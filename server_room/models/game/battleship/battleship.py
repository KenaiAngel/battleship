from .ship import Ship
from .player import Player

class BattleShip:
    def __init__(self, amount_players):
        self.players = []
        self.players_playing = []
        self.plays = []
        self.turn = 0
        self.turns = []
        self.winner = None
        self.amount_players = amount_players
        self.counter_players = 0

    def add_new_player(self, current_id):
        self.counter_players += 1

        if self.counter_players > self.amount_players:
            return {'confirmation': False}
        
        current_player = Player(current_id + str(self.counter_players), current_id, 'player')
        self.players.append(current_player)
        self.players_playing.append(current_player)
        self.turns.append(current_player.id)

        return {'confirmation': True, 'new_id': current_player.id}
    
    def set_ships_for_player(self, current_id, ships):
        for player in self.players_playing:
            if current_id == player.id:
                player.set_ships(ships)
                return True
        return False
    
    def attack(self, who_id, x, y):
        if len(self.turns) == 0:
            return None
        
        self.turn += 1
        if self.turn >= len(self.turns):
            self.turn = 0

        impacted = []
        mssg = None

        for player in self.players_playing[:]:  # Copia para evitar errores en remove
            if player.id == who_id:
                continue

            if player.attack_ships(x, y):
                impacted.append(player.id)
                if player.state == 1:
                    self.players_playing.remove(player)
                    self.turns.remove(player.id)
                    if len(self.turns) == 1:
                        self.winner = self.players_playing[0]
                        return {'winner': self.winner.id}

        if impacted:
            mssg = {'turn': self.turns[self.turn], 'who': impacted, 'x': x, 'y': y}
        return mssg






        
        
        