import { RenderBattleShipBoard } from './graphics/render_battleship_board.js'
import { BattleShipBoard } from './models/battleship/battleship_board.js';

const board_to_set = document.getElementById('own_board');

const renderOwnBoard = new RenderBattleShipBoard(10,'me');
const logicalOwnBoard = new BattleShipBoard(10,'me');

renderOwnBoard.drawBattleShipBoard(board_to_set);
console.log(logicalOwnBoard.position_matrix);

function get_owner_x_y(id) {
    const regex = /^(.*)_x(\d+)_y(\d+)$/;
    const match = id.match(regex);
    
    if (match) {
        const [, name, x, y] = match;
        return [name, parseInt(x), parseInt(y)];
    } else {
        throw new Error("ID no válido. Debe tener el formato 'owner_x3_y5'");
    }
}

let global_coords = [];

document.querySelectorAll('#ships-group input[type="radio"]').forEach(radio => {
    
    radio.addEventListener('click', (e) => {
        console.log("Ship",logicalOwnBoard.ships);
       
        const selectedRadio = e.target;
        const ship_name =  selectedRadio.name;
        let x_counter = 0,
            y_counter = 0,
            amount_type_boat = 0,
            number_input_boats = 0,
            clicked_cell = 0;

        let id_boat = 1; 
        let local_coords = [];
        const current_ship = logicalOwnBoard.found_ship(id_boat,ship_name);
        const amount_ship = logicalOwnBoard.amount_ship;

        amount_type_boat = amount_ship[ship_name];

        const size_current_ship =  current_ship.size;

       function search_neighboors(x, y) {
            for (let ship of global_coords) {
                for (let coord of ship) {
                    if (
                        Math.abs(coord.x - x) <= 1 &&
                        Math.abs(coord.y - y) <= 1
                    ) {
                        return true;
                    }
                }
            }
            return false;
        }

        console.log(current_ship);

        // Desactivar el radio seleccionado
        selectedRadio.disabled = true;

        // Quitar listeners anteriores para evitar múltiples asignaciones
        document.querySelectorAll('.set_own_board_cell').forEach(cell => {
            cell.replaceWith(cell.cloneNode(true)); // Elimina todos los listeners
        });

        document.querySelectorAll('.set_own_board_cell').forEach(cell => {
            cell.addEventListener('click', () => {
                console.log(cell.id);
                const [owner, x, y] = get_owner_x_y(cell.id);

                function to_do_complete_boat (){
                    console.log("Dentro");
                    number_input_boats++;
                    global_coords.push(local_coords);
                    logicalOwnBoard.set_boat(id_boat,ship_name,local_coords);
                    local_coords = [];
                    clicked_cell = 0;
                    id_boat++;
                    console.log(logicalOwnBoard.position_matrix);
                }
                

                if (number_input_boats >= amount_type_boat || clicked_cell >= size_current_ship){
                    console.log(logicalOwnBoard.position_matrix);
                    return;
                } 

                if (search_neighboors(x, y)){
                    console.log("Vecino Colindante");
                    return;
                } 

                // No permitir repetir coordenada
                const alreadyUsed = local_coords.some(coord => coord.x === x && coord.y === y);
                if (alreadyUsed) {
                    console.log("No puedes colocar en el mismo lugar");
                    return;
                }

                // Verifica si es la primera celda del barco
                if (local_coords.length === 0) {
                    local_coords.push({ x, y });
                    x_counter++;
                    y_counter++;
                    clicked_cell++;
                    renderOwnBoard.printBoat(board_to_set, cell.id);

                    if(clicked_cell === size_current_ship){
                       to_do_complete_boat();
                        
                    }
                    //number_input_boats++;
                    return;
                }

                // Verifica si es contiguo (misma fila o columna)
                const isValid = local_coords.some(coord => {
                    const sameRow = coord.y === y && (coord.x === x || coord.x + 1 === x || coord.x - 1 === x);
                    const sameCol = coord.x === x && (coord.y === y || coord.y + 1 === y || coord.y - 1 === y);
                    return sameRow || sameCol;
                });

                if (!isValid) {
                    console.log("Debe estar en la misma fila o columna y ser contiguo.");
                    return;
                }

                // Agrega coordenada válida
                local_coords.push({ x, y });
                clicked_cell++;

        
                if(clicked_cell === size_current_ship){
                    to_do_complete_boat();
                }
                renderOwnBoard.printBoat(board_to_set, cell.id);
               
                
            });
        });

    });
});
