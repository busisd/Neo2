class CellData {
	constructor(row, col, bg_color = "rgb(130, 255, 110)", passable = true){
		this.row = row;
		this.col = col;
		this.bg_color = bg_color;
		this.passable = passable;
		this.html_element = this.calcCell();
	}
	
	calcCell() {
		var cell = document.createElement("td");
		cell.style="background-color: "+this.bg_color+";"
		cell.id = CellData.rowColToString(this.row, this.col);
		return cell;
	}
	
	static rowColToString(row, col) {
		return "cell_row_"+String(row)+"_col_"+String(col);
	}
}

G = ["rgb(130, 255, 110)", true]; //grass tiles
R = ["rgb(0, 153, 255)", false]; //river tiles
B = ["rgb(153, 102, 51)", true]; //bridge tiles
var tilemap = [
[G, G, G, G, G, G, R, G, G, G, G],
[G, G, G, G, G, G, R, G, G, G, G],
[G, G, G, G, G, G, R, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, B, B, B, G, G],
[G, G, G, G, G, G, B, B, B, G, G],
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G]
];
var MAX_ROWS = tilemap.length;
var MAX_COLS = tilemap[0].length;
var cells_array=[];
for (var i = 0; i < MAX_ROWS; i++) {
	cells_array[i]=[];
	for (var j = 0; j < MAX_COLS; j++) {
		cells_array[i][j] = new CellData(i,j,tilemap[i][j][0],tilemap[i][j][1]);
	}
}

// var MAX_ROWS = 11;
// var MAX_COLS = 11;
// var cells_array=[];
// for (i = 0; i < MAX_ROWS; i++) {
	// cells_array[i]=[];
	// for (j = 0; j < MAX_COLS; j++) {
		// cells_array[i][j] = new CellData(i,j);
	// }
// }

var map_table = document.getElementById("map_table");

function buildMap(map_array){
	for (var i = 0; i < map_array.length; i++) {
		var cur_row = document.createElement("tr");
		map_table.appendChild(cur_row);
		for (var j = 0; j < map_array[i].length; j++) {
			var cur_cell = map_array[i][j].html_element;
			cur_row.appendChild(cur_cell);
		}
	}
}

var cur_icon = "url('char_icons/char_icon_white.png')"
character_div = document.createElement("div");
character_div.id = "char_div";
character_div.style.backgroundImage=cur_icon;
portrait_div = document.getElementById("char_portrait_container");
portrait_div.style.backgroundImage=cur_icon;
cur_square = [3,4]
// function eraseCharacter(square_pos){
	// row = square_pos[0];
	// col = square_pos[1];
	// new_square = cells_array[row][col].html_element;
	// new_square.style.backgroundImage="";
// }

function drawCharacter(square_pos){
	row = square_pos[0];
	col = square_pos[1];
	new_square = cells_array[row][col].html_element;
	new_square.appendChild(character_div);
}

function isInBounds(square_pos){
	return (square_pos[0] >= 0 && square_pos[0] < MAX_ROWS && 
			square_pos[1] >= 0 && square_pos[1] < MAX_COLS &&
			cells_array[square_pos[0]][square_pos[1]].passable);
}

function moveCharacter(direction){
	// eraseCharacter(cur_square);
	var new_square;
	switch (direction){
		case "up":
			new_square = [cur_square[0]-1, cur_square[1]];
			if (isInBounds(new_square)) cur_square = new_square;
			break;
		case "down":
			new_square = [cur_square[0]+1, cur_square[1]];
			if (isInBounds(new_square)) cur_square = new_square;
			break;
		case "left":
			new_square = [cur_square[0], cur_square[1]-1];
			if (isInBounds(new_square)) cur_square = new_square;
			break;
		case "right":
			new_square = [cur_square[0], cur_square[1]+1];
			if (isInBounds(new_square)) cur_square = new_square;
			break;
		default:
			break;
	}
	drawCharacter(cur_square, cur_icon);
}

buildMap(cells_array);
drawCharacter(cur_square, cur_icon);

document.addEventListener('keydown', (e) => {
	switch(e.code){
		case("ArrowUp"):
			e.preventDefault();
			moveCharacter("up")
			break;
		case("ArrowDown"):
			e.preventDefault();
			moveCharacter("down")
			break;
		case("ArrowLeft"):
			e.preventDefault();
			moveCharacter("left")
			break;
		case("ArrowRight"):
			e.preventDefault();
			moveCharacter("right")
			break;
	}
});

function addEquipment(equipment_name) {
	new_equip = document.createElement("div");
	new_equip.className="equipment";
	new_equip.id=equipment_name;
	new_equip.style.backgroundImage = "url('equipment_icons/"+equipment_name+".png')"
	character_div.appendChild(new_equip);

	new_equip_portrait = document.createElement("div");
	new_equip_portrait.className="equipment_portrait";
	new_equip_portrait.id=equipment_name+"_portrait";
	new_equip_portrait.style.backgroundImage = "url('equipment_icons/"+equipment_name+".png')"
	portrait_div.appendChild(new_equip_portrait);
}

// addEquipment("hat_wiz_blue");
// addEquipment("pants_red");








