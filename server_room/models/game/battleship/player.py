from models.user.user import User  # Asegúrate que la ruta sea correcta
from .ship import Ship

class Player(User):
    def __init__(self, id, nickname, type):
        super().__init__(id, nickname, type)
        self.ships = []
        self.alive_ships = []
        self.amount_ship = 0
        self.attacked_ships = []
        self.state = 0  # 0 = en juego, 1 = derrotado
    
    def set_ships(self, ships):
        for ship in ships:
            current_ship = Ship(ship.id, ship.type, ship.coords, ship.size)
            self.ships.append(current_ship)
            self.alive_ships.append(current_ship)
        self.amount_ship = len(self.ships)
    
    def attack_ships(self, x, y):
        for ship in self.alive_ships:
            if ship.attack(x, y):
                if ship.status == 1:
                    self.attacked_ships.append(ship)
                    if len(self.attacked_ships) == self.amount_ship:
                        self.state = 1
                return True  # Esta línea debe estar dentro del if
        return False




