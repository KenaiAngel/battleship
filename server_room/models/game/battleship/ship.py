class Ship:
    def __init__(self, id, type, coords, size):
        self.id = id
        self.type = type
        self.coords = coords  
        self.size = size
        self.attacked = 0
        self.status = 0  # 0 = activo, 1 = destruido

    def attack(self, x, y):
        for coord in self.coords:
            if coord.x == x and coord.y == y:
                self.attacked += 1
                if self.attacked == self.size:
                    self.status = 1
                return True
        return False
