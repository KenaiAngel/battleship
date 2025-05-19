import { Ship } from "./ship.js";

export class BattleShipBoard {
    constructor(n, owner) {
        this.x = n;
        this.y = n;
        this.owner = owner;
        this.position_matrix = this.create_matrix();
        this.amount_ship = {'carrier':1, 'submarine':1, 'ship':3, 'boat':5};
        this.ships = this.set_ships();
        this.all_ships = []

    }

    //Instacia barcos para la clase juegos
   set_ships() {
        const ships = [];

        ships.push(new Ship(1, 'carrier', 5));
        ships.push(new Ship(1, 'submarine', 4));

        for (let i = 0; i < 3; i++) {
            let id = i;
            id++; 
            ships.push(new Ship(id, 'ship', 2));
        }

        for (let i = 0; i < 5; i++) {
            let id = i;
            id++; 
            ships.push(new Ship(id, 'boat', 1));
        }

        return ships;
    }

        //Crea el tablero logico
    create_matrix() {
        const matrix = [];
        for (let y = 0; y < this.y; y++) {
            const row = [];
            for (let x = 0; x < this.x; x++) {
                row.push(0);
            }
            matrix.push(row);
        }
        return matrix;
    }

    //Busca un barco y lo regresa
    found_ship(id, type) {
        return this.ships.find(ship => ship.type === type && ship.id === id);
    }
    
    //Dentro de la matrix cambia el estado a uno, ahi hay una parte de un barco
    set_active_boat(x,y){
        console.log(x,y);
        this.position_matrix[y][x] = 1;
    }

    //Ubico los barcos dentro de la matriz
    set_boat (id,type,coords){
       const ship = this.found_ship(id,type);
       ship.set_coords = coords;

       this.all_ships.push({'id':ship.id, 'type': ship.type, 'coords':coords, 'size':ship.size});

       console.log(ship);
       coords.forEach(coord => {
           this.set_active_boat(coord.x,coord.y);
       });
    }
}


