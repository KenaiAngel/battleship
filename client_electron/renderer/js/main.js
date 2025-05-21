import { RenderBattleShipBoard } from './graphics/render_battleship_board.js'
import { BattleShipBoard } from './models/battleship/battleship_board.js';

//Variable para el flujo
let conection_id =  null;
let conection_code =  null;
let socket_direction = null;
let number_players = null;
let socket = null;
let value_enter_code = null;
let is_my_turn = false;


//Creo el tablero que se va a dibujar y el logico
let renderOwnBoard = null;
let renderRivalBoard = null;
let logicalOwnBoard = null;
let board_to_set = null;
let size;

//Secciones de la Aplicacion/Flujo
let user_id = `user_${crypto.randomUUID()}`;

const main_menu = document.getElementById("main_menu");
const create_menu = document.getElementById("create_menu");
const join_menu = document.getElementById("join_menu");
const set_board = document.getElementById("display_set_board");
let code_html =  document.getElementById("code");
let game_board = document.getElementById("display_game_board");

//Esconder Secciones de la Aplicacion/Flujo
set_board.classList.remove('set_board');
set_board.classList.add('none');

game_board.classList.remove('game_board');
game_board.classList.add('none');

create_menu.classList.remove("create_menu_class");
create_menu.classList.add("none");

join_menu.classList.remove("join_menu_class");
join_menu.classList.add("none");



//Primer Menu 
document.getElementById("go_to_join_menu").addEventListener('click',()=>{
    main_menu.classList.remove("main_menu_class");
    main_menu.classList.add("none");

    join_menu.classList.remove("none");
    join_menu.classList.add("join_menu_class");

});

document.getElementById("go_to_create_menu").addEventListener('click',()=>{
    main_menu.classList.remove("main_menu_class");
    main_menu.classList.add("none");

    create_menu.classList.remove("none");
    create_menu.classList.add("create_menu_class");

});

function set_tam (number_of_players){
    switch(number_of_players){
        case '2':
            return 10;
        default:
            return -1;
    }
}

function before_ready (id,code,direction, number=null){
    join_menu.classList.remove("join_menu_class");
    join_menu.classList.add("none");

    create_menu.classList.remove("create_menu_class");
    create_menu.classList.add("none");

    set_board.classList.remove('none');
    set_board.classList.add('set_board');

    conection_id = id;
    socket_direction = direction;

    if (number != null) {
        conection_code = value_enter_code;
        size = set_tam(number);
    } else {
        conection_code = code;
        size = set_tam(number_players);
    }

    if (size === -1) {
        console.log('Numero de jugadores no permitidos');
        return;
    }

    code_html.textContent = conection_code;  // ✅ Ahora sí está definido

    board_to_set = document.getElementById('set_own_board');

    renderOwnBoard = new RenderBattleShipBoard(size, conection_id);
    logicalOwnBoard = new BattleShipBoard(size, conection_id);

    renderOwnBoard.drawBattleShipBoard(board_to_set);

}

//Menu para crear
document.getElementById("create_party_bttn").addEventListener('click', async ()=>{
    number_players = document.getElementById('num_players').value;
    const spectators = false;
    const link = 'http://localhost:3000/api/post-new-game';
    try{
        const rest = await fetch(link, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user_id, number_players: number_players, spectators:spectators })
        });
        const data = await rest.json();
        console.log(data);
        if(data['confirmation']){
            before_ready(data['new_id'], data['code'],data['direction']);
        }
        
        
    } catch(err){
        console.error('Fetch error:', err);
    } 

});

//Menu  para unirse
document.getElementById("search_party_bttn").addEventListener('click', async ()=>{
    value_enter_code = document.getElementById('enter_code').value;
    console.log(value_enter_code);
    const link = 'http://localhost:3000/api/get-access-to-game'; 
    try{
        const rest = await fetch(link, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user_id, code: value_enter_code })
        });
        const data = await rest.json();
        console.log(data);
        if(data['confirmation']){
            before_ready(data['new_id'], data['code'],data['direction'], data['number_players']);
        }


    } catch(err){
        console.error('Fetch error:', err);
    } 
});

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
                    console.log(logicalOwnBoard.all_ships);
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

document.getElementById('ready_to_set_bttn').addEventListener('click', () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.warn("WebSocket ya conectado");
        
    }else{
        socket = new WebSocket(socket_direction);  
    }
    

    socket.onopen = () => {

        console.log(`🟢 Conectado al WebSocket ${conection_id}`);

        // Paso 1: Identificación
        const ready_mssg = {
            'user_id': conection_id,
            'code': conection_code
        };
        socket.send(JSON.stringify(ready_mssg));
        set_board.classList.remove('set_board');
        set_board.classList.add('none');
        

        // Paso 2: Enviar posiciones de los barcos
        const set_ships = {
            action: 'set_position',
            position: logicalOwnBoard.all_ships  // asegúrate de que esté definido y tenga el formato correcto
        };
        socket.send(JSON.stringify(set_ships));
    };

    socket.onerror = (err) => {
        console.log("❌ Error en WebSocket:", err);
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data['confirmation'] === 'ready'){

            console.log(data['confirmation']);
            game_board.classList.remove('none');
            game_board.classList.add('game_board');

            board_to_set = document.getElementById('game_own_board');
            renderOwnBoard.drawBattleShipBoardBaseOnMarix(board_to_set,logicalOwnBoard.position_matrix);

            board_to_set = document.getElementById('game_rival_board');
            renderRivalBoard = new RenderBattleShipBoard(size,'Rival');
            renderRivalBoard.drawBattleShipBoard(board_to_set);

            console.log(`${data['turn']} === ${conection_id}`);
            if(data['turn'] === conection_id){
                is_my_turn = true;
            }
        }

        console.log("📨 Mensaje recibido del servidor:", data);
    };

    socket.onclose = () => {
        console.log("🔴 WebSocket cerrado");
    };
});

