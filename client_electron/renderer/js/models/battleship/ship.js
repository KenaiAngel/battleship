export class Ship {
    constructor(id, type, size){
        this.id = id;
        this.type = type;
        this.size = size;
        // 0-> noActivo, 1->Activo, 2->Eliminado
        this.status = 0; 
        this.coords = [];
        this.attacked_cells = 0; 
    }

    set_coords(coords){
        this.coords = coords;
        this.status = 1; 
    }

    still_active(){
        this.attacked_cells ++;
        if(this.attacked_cells >= this.size){
            this.status = 2; 
            return true;
        }
    }
}

