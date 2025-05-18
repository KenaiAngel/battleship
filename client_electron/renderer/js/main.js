import { RenderBattleShipBoard } from './graphics/render_battleship_board.js'
import { BattleShipBoard } from './models/battleship/battleship_board.js';

//Secciones de la Aplicacion/Flujo
let user_id = 'Lobito';
const main_menu = document.getElementById("main_menu");
const create_menu = document.getElementById("create_menu");
const join_menu = document.getElementById("join_menu");
const set_board = document.getElementById("display_set_board");

//Esconder Secciones de la Aplicacion/Flujo
set_board.classList.remove('set_board');
set_board.classList.add('none');

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

//Menu para crear
document.getElementById("create_party_bttn").addEventListener('click', async ()=>{
    const number_players = document.getElementById('num_players').value;
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
        
    } catch(err){
        console.error('Fetch error:', err);
    } 

});


//Menu  para unirse
document.getElementById("search_party_bttn").addEventListener('click', async ()=>{
    const value = document.getElementById('enter_code').value;
    const link = 'http://localhost:3000/api/get-access-to-game'; 
    try{
        const rest = await fetch(link, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user_id, code: value })
        });
        const data = await rest.json();
        console.log(data);
        
    } catch(err){
        console.error('Fetch error:', err);
    } 
});