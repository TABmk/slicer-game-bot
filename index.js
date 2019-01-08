const BOT = require("robotjs");
const sleep = require('sleep');

// coords are hardcoded, i've tested it with scrcpy on right screen side of FHD screen, phone also FHD
let cells = {
	'0' : {
		x : [1460, 1492, 1464, 1414, 1389, 1415],
		y : [311, 358, 396, 393, 357, 319]
	},
	'1' : {
		x : [1643, 1666, 1640, 1590, 1571, 1595],
		y : [420, 454, 501, 498, 456, 415]
	},
	'2' : {
		x : [1644, 1667, 1642, 1592, 1562, 1596],
		y : [630, 669, 712, 712, 663, 634]
	},
	'3' : {
		x : [1465, 1481, 1453, 1412, 1388, 1421],
		y : [729, 771, 810, 812, 774, 733]
	},
	'4' : {
		x : [1285, 1308, 1284, 1236, 1214, 1239],
		y : [627, 670, 706, 705, 667, 625]
	},
	'5' : {
		x : [1280, 1311, 1285, 1235, 1202, 1228],
		y : [422, 463, 497, 493, 458, 420]
	},
	'middle' : {
		x : [1467, 1491, 1464, 1415, 1388, 1424],
		y : [523, 560, 606, 606, 570, 525]
	}
}

const CELL_BG = '1f1f1f';

const GAME_OVER = {
	x : 1324,
	y : 322,
	color : 'ffffff'
};

const NEW_GAME = {
	x : 1443,
	y : 535
};

const OFF = {
	x : 1234,
	y : 980,
	color : '000000',
	ad_color : 'ffffff'
}

let click = (x, y, delay = 70) => {
	BOT.moveMouse(x, y);
	sleep.msleep(delay);
	BOT.mouseClick();
	sleep.msleep(20);
}

let getCellData = id => {
	let data = '';
	for (let i = 0; i < 6; i++) {
		(BOT.getPixelColor(cells[id]['x'][i], cells[id]['y'][i]) != CELL_BG) ? data += '1' : data += '0';
	}
	return data;
}

let indexes = (arr, f) => arr.reduce((ret, dat, i) => {
	if (dat === f) ret.push(i); 
	return ret
}, []);

// cells are presented as string of 1/0, you can visualize string in console with this function. Ex. - ■□■■□□
let visualize = data => { return data.replace(/1/g, '\u25A0').replace(/0/g, '\u25A1') }

console.log(`[START] Bot for Slices by TAB_mk (http://tab.moe)`);

let step = () => {
	
	switch (true) {
		case (BOT.getPixelColor(OFF.x, OFF.y) == OFF.ad_color):
			console.log('AD detected, closing it...');
			BOT.keyTap()
			sleep.msleep(300);
			step();
			break;
		case (BOT.getPixelColor(GAME_OVER.x, GAME_OVER.y) == GAME_OVER.color && BOT.getPixelColor(OFF.x, OFF.y) != OFF.ad_color):
			click(NEW_GAME.x, NEW_GAME.y);
			GAME_OVER.count++;
			console.log('[GAME OVER] Starting new one...');
			step();
			break;
		case (BOT.getPixelColor(OFF.x, OFF.y) == OFF.color):
			console.log('You\'ve turned off your phone, closing bot...');
			process.exit(0);
			break;
		default:
			let data = [];
			for (let i = 0; i < 6; i++) {
				let cell = getCellData(i);
				let filled = Math.round((cell.match(/1/g) || []).length / 6 * 100);
				data.push({'id' : i, 'data' : cell, 'filled' : filled});	
			}
			data.sort((a, b) => { return b.filled - a.filled });
			
			let NEW = getCellData('middle');
				NEW_index = indexes(NEW.split(''), '1');
			
			for (cell of data) {
				cell_index = indexes(cell.data.split(''), '0');
				let counter = 0;
				console.log(cell_index)
				console.log(NEW_index)
				for (n of NEW_index) if (cell_index.indexOf(n) != -1) {
					counter++;
					console.log('got')
				}
				console.log(counter)
				sleep.msleep(50);
				if (counter == NEW_index.length) {
					click(cells[cell.id]['x'][0], cells[cell.id]['y'][0]);
					console.log('CLICK ' + cell.id)
					break;
				}
			}
			sleep.msleep(50);
			step();
	}
}

step();
