export class RenderBattleShipBoard {
    constructor(n,owner){
        this.x = n;
        this.y = n;
        this.owner = owner;
    }

    //Dibuja el tablero
    drawBattleShipBoard(container) {
        container.style.gridTemplateColumns = `repeat(${this.x}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${this.y}, 1fr)`;

        container.innerHTML = ''; 
        
        for (let y = 0; y < this.y; y++) {
            for (let x = 0; x < this.x; x++) {

                const celda = document.createElement('div');
                celda.id = `${this.owner}_x${x}_y${y}`;
                celda.classList.add('set_own_board_cell'); 
                //celda.textContent = `${this.owner}_${x}_${y}`;
                container.appendChild(celda);
            }
        }
    }

    //Obtiene quien es, la x y la y, del valor de texto que se le pase 
    get_owner_x_y(id) {
        const regex = /^(.*)_x(\d+)_y(\d+)$/;
        const match = id.match(regex);
        
        if (match) {
            const [, name, x, y] = match;
            return [name, parseInt(x), parseInt(y)];
        } else {
            throw new Error("ID no válido. Debe tener el formato 'owner_x3_y5'");
        }
    }

    //Pinta una celda del bote
    printBoat(container, id){
        let son = container.querySelector(`#${id}`);
        son.classList.add('boat_cell');

    }


    sayHello (){
        console.log(this.x);
    }

}