class GameSession {
	constructor(){
		this.cur_encounter = null;
		this.player_character = new Character;
		this.cur_map = null;
		this.cur_char_pos = null;
	}
	
	
}

// ################################ ENCOUNTER METHODS ################################

class Encounter {
	
}

class MonsterEncounter extends Encounter {
	constructor(monster = new SlimeMonster()){
		super();
		this.monster = monster;
	}
}

class Character {
	constructor(hp = 10, stats={"STR": 3, "DEX": 3, "INT": 3}){
		this.hp = hp;
		this.stats = stats;
		this.all_attacks = {};
	}	
}

class Monster extends Character {
	constructor(hp = 10, portrait = 'monster_icons/generic_monster.png'){
		super(hp);
		this.portrait = portrait;
		this.all_attacks["basic_attack"] = new Attack(this);
	}
	
	act(){
		var attacks = [];
		attacks.push(this.all_attacks["basic_attack"]);
		return attacks;
	}
}

class SlimeMonster extends Monster {
	constructor(){
		super(randomIntBetween(8,12));
		this.portrait = 'monster_icons/slime.png';
		var attack_flavor_roll = {launch: "The slime attempts to roll into you!", 
								hit: "It hits you!", 
								miss: "You dive out of the way!"}
		var attack_flavor_swing = {launch: "The slime grows a pseudopod and attempts to hit you!", 
								hit: "It hits you!", 
								miss: "You block the attack!"}
		this.roll_attack = new Attack(this, "DEX", 1, 2, attack_flavor_roll);
		this.swing_attack = new Attack(this, "STR", 1, 2, attack_flavor_swing);
	}
	
	act(){
		var attacks = [];
		if (Math.random() > 0.5){
			attacks.push(this.roll_attack);
		} else {
			attacks.push(this.swing_attack); 
		}
		return attacks;
	}
}

class Attack {
	constructor(char_attacker, target_stat = "STR", damage_min = 1, damage_max = 1,
				flavor_text = {launch: "It swings", hit: "It connects", miss: "It misses"}){
		this.target_stat = target_stat;
		this.char_attacker = char_attacker;
		this.damage_min = damage_min;
		this.damage_max = damage_max;
		this.flavor_text = flavor_text;
	}
	
	calculateHitOn(char_attacked){
		if (this.char_attacker.stats[this.target_stat]*Math.random()*2 > char_attacked.stats[this.target_stat]) {
			return this.makeHit();
		} else {
			return this.makeMiss();
		}
	}
	
	makeMiss(){
		return {attack_hit: false, damage: 0, flavor: this.flavor_text.miss, attack: this}
	}
	
	makeHit(){
		var damage_done = randomIntBetween(this.damage_min, this.damage_max);
		return {attack_hit: true, damage: damage_done, flavor: this.flavor_text.hit, attack: this}
	}
}

function randomIntBetween(min, max){
	/*
		Returns a random int between the two values, inclusive
	*/
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random()*(max - min + 1) + min);
}

var cur_encounter = null;
var encounter_portrait = document.getElementById("encounter_portrait");
function startEncounter(){
	cur_encounter = new MonsterEncounter();
	toggleEncounterDiv(true);
	encounter_portrait.src = cur_encounter.monster.portrait;
}

function endEncounter(){
	cur_encounter = null;
	toggleEncounterDiv(false);
	encounter_portrait.src = "";
}

map_wrapper = document.getElementById("map_container_wrapper");
encounter_div = document.getElementById("encounter_div");
function toggleEncounterDiv(is_encounter) {
	if (is_encounter) {
		map_wrapper.style.display = "none";
		encounter_div.style.display = "block";
	} else {
		map_wrapper.style.display = "block";
		encounter_div.style.display = "none";
	}
}

// ###################### PLAYER STUFF ######################

var player_character = new Character();

var str_val = document.getElementById("str_val");
var dex_val = document.getElementById("dex_val");
var int_val = document.getElementById("int_val");
function display_player_stats() {
	str_val.innerText = player_character.stats["STR"];
	dex_val.innerText = player_character.stats["DEX"];
	int_val.innerText = player_character.stats["INT"];
}

player_character.all_attacks["basic_attack"] = new Attack(player_character,
	target_stat = "STR", damage_min = 1, damage_max = 3,
	flavor_text = {launch: "You swing...", hit: "You hit!", miss: "You miss."});

display_player_stats();

// #################### END PLAYER STUFF ####################

function stepEncounter(){
	if (cur_encounter != null) {		
		flavor_div.innerHTML = "";
		logAttack(player_character.all_attacks["basic_attack"].calculateHitOn(cur_encounter.monster));
		logAttack(cur_encounter.monster.act()[0].calculateHitOn(player_character));
	}
}

var flavor_div = document.getElementById("flavor");
function logAttack(attack_results){
	console.log(attack_results["attack"].flavor_text["launch"]);
	if (attack_results["attack_hit"]) {
		console.log(attack_results["flavor"], " Damage:", attack_results["damage"]);
	} else {
		console.log(attack_results["flavor"]);
	}

	flavor_div.innerHTML += attack_results["attack"].flavor_text["launch"];
	flavor_div.innerHTML += "<br>";	
	if (attack_results["attack_hit"]) {
		flavor_div.innerHTML += attack_results["flavor"]+" Damage:"+attack_results["damage"];
	} else {
		flavor_div.innerHTML += attack_results["flavor"];
	}
	flavor_div.innerHTML += "<br>";
}

// ############################## END ENCOUNTER METHODS ##############################



// ################################ MAP METHODS ################################

class CellData {
	/*
		Class that stores the data for specific cells/tiles on the map.
	*/
	
	constructor(row, col, bg_color = "rgb(130, 255, 110)", passable = true){
		this.row = row;
		this.col = col;
		this.bg_color = bg_color;
		this.passable = passable;
		this.html_element = this.calcCell();
		this.special_behavior = {}
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
	
	changeType(new_type) {
		this.bg_color = new_type[0];
		this.html_element.style="background-color: "+this.bg_color+";";
		this.passable = new_type[1];
	}
}

function mapFromTiles(tiles_array) {
	/* 
		Given an array of tiles (which are arrays of the form ["color", isPassable?]), 
		returns an array of CellData objects that correspond to the given tiles.
	*/
	
	new_map = [];
	for (var i = 0; i < tiles_array.length; i++) {
		new_map[i]=[];
		for (var j = 0; j < tiles_array[i].length; j++) {
			new_map[i][j] = new CellData(i,j,tiles_array[i][j][0],tiles_array[i][j][1]);
		}
	}
	
	return new_map;
}

function transition_func(new_map, new_pos) {
	/*
		Returns a lambda function that transitions the map to the given new map,
		setting the character at the given new position.
	*/
	var new_func = function() {changeMap(new_pos, new_map)}
	return new_func;
}

function add_vertical_transitions(bottom_map, top_map){
	/*
		Adds transitions from bottom_map to top_map, along the entire top/bottom edge.
		Does so by modifying the special_behavior array of each cell along the appropriate
		rows in the two maps.
	*/
	
	for (var i = 0; i<MAX_COLS; i++){
		//Note that, if we don't use transition_func, then the lambda function will change with the changing value of i.
		bottom_map[0][i].special_behavior["up"] = transition_func(top_map, [MAX_ROWS-1, i]);
		top_map[MAX_ROWS-1][i].special_behavior["down"] = transition_func(bottom_map, [0, i]);
	}
}

function add_horizontal_transitions(left_map, right_map){
	/*
		Adds transitions from left_map to right_map, along the entire right/left edge.
		Does so by modifying the special_behavior array of each cell along the appropriate
		columns in the two maps.
	*/
	
	for (var i = 0; i<MAX_ROWS; i++){
		//Note that, if we don't use transition_func, then the lambda function will change with the changing value of i.
		left_map[i][MAX_COLS-1].special_behavior["right"] = transition_func(right_map, [i, 0]);
		right_map[i][0].special_behavior["left"] = transition_func(left_map, [i, MAX_COLS-1]);
	}
}

// ############################## END MAP METHODS ##############################

// ################################ CREATING THE MAPS ################################

var MAX_ROWS = 11;
var MAX_COLS = 11;

var G = ["rgb(130, 255, 110)", true]; //grass tiles
var R = ["rgb(0, 153, 255)", false]; //river tiles
var B = ["rgb(153, 102, 51)", true]; //bridge tiles
var M = ["rgb(166, 173, 172)", false]; //mountain tiles
var L = ["rgb(235, 80, 80)", true]; //lever tiles
var S = ["rgb(235, 235, 245)", true]; //snow tiles

var tiles_grasslands = [
[G, G, G, G, G, G, R, G, G, G, G],
[G, G, G, G, G, G, R, G, G, G, G],
[G, G, G, G, G, G, R, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, B, B, B, G, G],
[G, G, G, G, G, G, B, B, B, G, G],
[G, G, G, G, L, G, G, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, G, R, G, G, G]
];
var map_grasslands = mapFromTiles(tiles_grasslands);

var tiles_grasslands_north = [
[M, M, M, G, G, G, G, G, G, G, G],
[M, M, M, G, G, G, G, G, G, G, G],
[M, M, G, G, G, G, G, M, M, M, G],
[M, G, G, G, G, G, M, M, R, M, G],
[G, G, G, G, G, G, M, R, R, M, G],
[M, G, G, G, M, M, M, R, M, M, G],
[M, G, G, G, G, R, R, R, M, G, G],
[M, M, G, G, G, R, R, M, G, G, G],
[M, M, G, G, G, G, R, G, G, G, G],
[M, G, G, G, G, G, R, G, G, G, G],
[G, G, G, G, G, G, R, G, G, G, G]
];
var map_grasslands_north = mapFromTiles(tiles_grasslands_north);

var tiles_mountains = [
[M, M, M, M, G, R, G, G, M, M, M],
[M, M, M, M, R, R, G, M, M, M, M],
[G, G, M, M, R, M, M, M, M, M, M],
[M, G, G, B, B, B, G, G, G, M, M],
[M, M, M, M, R, M, M, G, G, G, G],
[M, M, M, M, R, R, M, M, M, M, M],
[M, M, M, M, M, R, M, M, M, M, M],
[M, M, S, M, M, R, R, R, R, R, M],
[M, S, S, S, M, M, M, M, R, R, M],
[M, M, S, S, M, M, M, M, M, M, M],
[M, M, M, M, M, M, M, M, M, M, M]
];
var map_mountains = mapFromTiles(tiles_mountains);

var tiles_lake = [
[G, G, G, G, G, G, G, R, G, G, G],
[G, G, G, G, G, G, R, R, G, G, G],
[G, G, G, G, G, R, R, R, R, G, G],
[G, G, G, G, R, R, R, R, R, G, G],
[G, G, G, G, R, R, R, R, R, R, G],
[G, G, G, R, R, R, R, R, R, R, G],
[G, G, G, R, R, R, R, R, R, R, G],
[G, G, G, G, R, R, R, R, R, R, G],
[G, G, G, G, R, R, R, R, R, G, G],
[G, G, G, G, G, R, R, R, R, G, G],
[G, G, G, G, G, R, R, R, G, G, G]
];
var map_lake = mapFromTiles(tiles_lake);

add_vertical_transitions(map_grasslands, map_grasslands_north);
add_vertical_transitions(map_lake, map_grasslands);

//Adds a button that lowers/raises the bridge on map_grasslands
map_grasslands[8][4].special_behavior["interact"] = function() {
	if (map_grasslands[6][7].passable) {
		map_grasslands[6][7].changeType(R);
		map_grasslands[7][7].changeType(R);
	} else {
		map_grasslands[6][7].changeType(B);
		map_grasslands[7][7].changeType(B);		
	}
}

add_horizontal_transitions(map_mountains, map_grasslands_north);

// ############################## DONE CREATING THE MAPS ##############################



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

function changeMap(new_pos, new_map) {
	if (!isInBounds(new_pos, new_map)) {
		return;
	}
	cur_map = new_map;
	map_table.innerHTML = "";
	buildMap(cur_map);
	cur_square = new_pos;
	drawCharacter(cur_square, cur_icon);
}

var cur_icon = "url('char_icons/char_icon_white.png')"
// var cur_icon = "char_icons/char_icon_white.png" // This makes things resize weirdly for the image
var character_div = document.createElement("div");
// character_div = document.createElement("img");
character_div.id = "char_div";
character_div.style.backgroundImage=cur_icon;
// character_div.src=cur_icon;
var portrait_div = document.getElementById("char_portrait_container");
portrait_div.style.backgroundImage=cur_icon;
var cur_square = [3,4]
// function eraseCharacter(square_pos){
	// row = square_pos[0];
	// col = square_pos[1];
	// new_square = map_grasslands[row][col].html_element;
	// new_square.style.backgroundImage="";
// }

//returns the cell in the current map corresponding to the given position
function getCell(square_pos, square_map) {
	return square_map[square_pos[0]][square_pos[1]];
}

function drawCharacter(square_pos) {
	var new_square = getCell(square_pos, cur_map);
	new_square.html_element.appendChild(character_div);
}

function isInBounds(square_pos, square_map=cur_map){
	return (square_pos[0] >= 0 && square_pos[0] < MAX_ROWS && 
			square_pos[1] >= 0 && square_pos[1] < MAX_COLS &&
			getCell(square_pos, square_map).passable);
}

function moveIfValid(direction){
	if (cur_encounter == null) {
		moveCharacter(direction);
	}
}

function moveCharacter(direction){
	// eraseCharacter(cur_square);
	var special_act = cur_map[cur_square[0]][cur_square[1]].special_behavior[direction];
	if (special_act) {
		special_act();
	} else {
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
			case "up_right":
				new_square = [cur_square[0]-1, cur_square[1]+1];
				if (isInBounds(new_square)) cur_square = new_square;
				break;
			case "up_left":
				new_square = [cur_square[0]-1, cur_square[1]-1];
				if (isInBounds(new_square)) cur_square = new_square;
				break;
			case "down_right":
				new_square = [cur_square[0]+1, cur_square[1]+1];
				if (isInBounds(new_square)) cur_square = new_square;
				break;
			case "down_left":
				new_square = [cur_square[0]+1, cur_square[1]-1];
				if (isInBounds(new_square)) cur_square = new_square;
				break;
			default:
				break;
		}
		drawCharacter(cur_square, cur_icon);
	}
}

var cur_map = map_grasslands;
buildMap(cur_map);
drawCharacter(cur_square, cur_icon);

document.addEventListener('keydown', (e) => {
	switch(e.code){
		case("ArrowUp"):
			e.preventDefault();
			moveIfValid("up")
			break;
		case("ArrowDown"):
			e.preventDefault();
			moveIfValid("down")
			break;
		case("ArrowLeft"):
			e.preventDefault();
			moveIfValid("left")
			break;
		case("ArrowRight"):
			e.preventDefault();
			moveIfValid("right")
			break;
		case("Space"):
			e.preventDefault();
			moveIfValid("interact")
			break;
		case("KeyJ"):
			e.preventDefault();
			startEncounter();
			break;
		case("KeyK"):
			e.preventDefault();
			endEncounter();
			break;
		case("KeyL"):
			e.preventDefault();
			stepEncounter();
			break;
		default:
			break;
	}
});

var cur_equipment = {"pants":null, "hat":null, "shirt": null}
var cur_equipment_portrait = {"pants":null, "hat":null, "shirt": null}



function addEquipment(slot_name, equipment_name) {
	var new_equip = document.createElement("img");
	new_equip.className="equipment";
	new_equip.id=equipment_name;
	new_equip.src = "equipment_icons/"+equipment_name+".png"
	character_div.appendChild(new_equip);

	var new_equip_portrait = document.createElement("div");
	new_equip_portrait.className="equipment_portrait";
	new_equip_portrait.id=equipment_name+"_portrait";
	new_equip_portrait.style.backgroundImage = "url('equipment_icons/"+equipment_name+".png')"
	portrait_div.appendChild(new_equip_portrait);
	
	cur_equipment[slot_name] = new_equip;
	cur_equipment_portrait[slot_name] = new_equip_portrait;
}


function clearEquipment(slot_name) {
	if (cur_equipment[slot_name] === null) {
		return
	}
	
	char_div.removeChild(cur_equipment[slot_name]);
	portrait_div.removeChild(cur_equipment_portrait[slot_name]);
	cur_equipment[slot_name] = null;
	cur_equipment_portrait[slot_name] = null;
}

function change_equipment(caller_ele) {
	var equip_selected = JSON.parse(caller_ele.value);
	clearEquipment(equip_selected[0]);
	if (equip_selected[1] !== null){
		addEquipment(equip_selected[0], equip_selected[1]);
	}
}

arrow_dir_map = {
	0: "up_left",
	1: "up",
	2: "up_right",
	3: "left",
	4: "interact",
	5: "right",
	6: "down_left",
	7: "down",
	8: "down_right"
}
function handle_arrows_clicked(ev, caller_ele) {
	// console.log("x:", ev.pageX, "y:", ev.pageY);
	// console.log("ele x:", caller_ele.offsetLeft, "ele y:", caller_ele.offsetTop);
	var cur_x = ev.pageX - caller_ele.offsetLeft;
	var cur_y = ev.pageY - caller_ele.offsetTop;
	// console.log("x:", cur_x, "y:", cur_y);
	
	var cur_select = 0;
	if (cur_x > 70) {
		cur_select += 1;
	}
	if (cur_x > 142) {
		cur_select += 1;
	}
	if (cur_y > 70) {
		cur_select += 1*3;
	}
	if (cur_y > 142) {
		cur_select += 1*3;
	}
	
	moveCharacter(arrow_dir_map[cur_select]);
}


