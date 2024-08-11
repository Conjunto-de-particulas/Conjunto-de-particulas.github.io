let map = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];


const players = [
	{ x: 2, y: 2, id: 0, maxMov: 4, actMov: 4, spriteSrc: 'images/sprite.png', keyUp: 'ArrowUp', keyDown: 'ArrowDown', keyLeft: 'ArrowLeft', keyRight: 'ArrowRight' },
	{ x: 3, y: 3, id: 1, maxMov: 4, actMov: 4, spriteSrc: 'images/sprite2.png', keyUp: 'w', keyDown: 's', keyLeft: 'a', keyRight: 'd' }
];

let currentPlayerIndex = 0;
let cW = undefined;
let rW = undefined;
let visited = undefined;
let path = undefined;
let moving = false;

window.onload = function () {
	const canvas = document.getElementById('gameCanvas');
	const context = canvas.getContext('2d');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const tileSize = 40;
	const spriteSize = 40; // Tamaño del sprite
	const mapOrigin = [0, 0]

	bfs(players[currentPlayerIndex])

	players.forEach(player => {
		player.sprite = new Image();
		player.sprite.src = player.spriteSrc;
	});

	let cubeImage = new Image();
	cubeImage.src = 'images/cube3.png';

	function drawIsometricTile(x, y, size, color) {
		let delta = 0;
		if (Math.floor(Math.random() * 1000) > 999) { delta = Math.floor(Math.random() * 4); }

		const isoX = (x - y) * size + canvas.width / 2;
		const isoY = (x + y) * size / 2 + size * 2 + delta;
		
		/*context.beginPath();
		context.moveTo(isoX, isoY);
		context.lineTo(isoX + size, isoY - size / 2);
		context.lineTo(isoX, isoY - size);
		context.lineTo(isoX - size, isoY - size / 2);
		context.closePath();
		context.fillStyle = color;
		context.fill();
		context.strokeStyle = '#000';
		context.stroke();*/

		context.drawImage(cubeImage, isoX - size, isoY - size, 80, 84);
	}

	function drawMap(map) {
		for (let row = 0; row < map.length; row++) {
			for (let col = 0; col < map[row].length; col++) {
				const color = map[row][col] === 1 ? '#6b8e23' : '#8b4513';
				drawIsometricTile(col, row, tileSize, color);
			}
		}
	}

	function drawPlayer(player, size) {
		const isoX = (player.x - player.y) * size + canvas.width / 2; //- (map[0].length * size) / 2
		const isoY = (player.x + player.y) * size / 2 + size * 2;
		context.drawImage(player.sprite, (isoX - spriteSize / 2), (isoY - spriteSize / 2) - spriteSize, spriteSize, spriteSize);
	}

	function drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas
		drawMap(map);
		if (moving == false && visited.size > 1) {
			drawAreaMovement();
		}
		players.forEach(player => drawPlayer(player, tileSize));
		updateMenuInfo();
	}

	function switchTurn() {
		currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
		bfs(players[currentPlayerIndex])[`${cW} ${rW}`];
	}

	function updateMenuInfo() {
		players.forEach(player => {
			const menu = document.querySelector(`#menuPlayer${player.id + 1}`);
			menu.querySelector('.player-name').textContent = player.name;
			menu.querySelector('.player-health').textContent = player.health;
		});
	}

	document.querySelectorAll('.end-turn-button').forEach(button => {
		button.addEventListener('click', function () {
			let player = players[currentPlayerIndex];
			let playerId = parseInt(button.getAttribute('data-player-id'), 10);
			if (playerId === currentPlayerIndex) {
				player.actMov = player.maxMov;
				switchTurn();
			}
		});
	});

	
	function areaTriangle(x1, y1, x2, y2, x3, y3) {
		return Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0;
	}

	function is_point_in_triangle(x1, y1, x2, y2, x3, y3, x, y) {
		let a = areaTriangle(x1, y1, x2, y2, x3, y3);

		let a1 = areaTriangle(x, y, x2, y2, x3, y3);
		let a2 = areaTriangle(x1, y1, x, y, x3, y3);
		let a3 = areaTriangle(x1, y1, x2, y2, x, y);

		return Math.abs(a - (a1 + a2 + a3)) < 1e-8;
	}


	canvas.addEventListener('mousemove', function (event) {
		let rect = canvas.getBoundingClientRect();
		let mouseX = event.clientX - rect.left;
		let mouseY = event.clientY - rect.top;

		console.log('x: ' + mouseX + ' y: ' + mouseY);


		deltaX = canvas.width / 2 - tileSize;
		deltaY = tileSize;

		mouseX -= deltaX;
		mouseY -= deltaY;

		let p = [Math.floor(mouseX/ (tileSize * 2)), Math.floor(mouseY / tileSize)]
		let p2 = [mouseX % tileSize, mouseY % tileSize]
		let pMouseMap = [(p[1] - mapOrigin[1]) + (p[0] - mapOrigin[0]),
		(p[1] - mapOrigin[1]) - (p[0] - mapOrigin[0])]

		/*context.beginPath();
		context.moveTo(p[0]*tileSize*2 + deltaX , p[1]*tileSize + deltaY);
		context.lineTo(p[0]*tileSize*2 + tileSize * 2 + deltaX , p[1]*tileSize + deltaY);
		context.lineTo(p[0]*tileSize*2 + tileSize * 2 + deltaX , p[1]*tileSize + tileSize + deltaY);
		context.lineTo(p[0]*tileSize*2 + deltaX , p[1]*tileSize + tileSize + deltaY);
		context.closePath();
		context.strokeStyle = '#8bb9cc';
		context.stroke();*/

		if (is_point_in_triangle(p[0] * tileSize * 2, p[1] * tileSize,
			p[0] * tileSize * 2 + tileSize, p[1] * tileSize,
			p[0] * tileSize * 2, p[1] * tileSize + tileSize / 2, mouseX, mouseY)) {
			console.log("In triangle");
			pMouseMap[0] -= 1;
		}

		else if (is_point_in_triangle(p[0] * tileSize * 2 + tileSize, p[1] * tileSize,
			p[0] * tileSize * 2 + tileSize * 2, p[1] * tileSize,
			p[0] * tileSize * 2 + tileSize * 2, p[1] * tileSize + tileSize / 2, mouseX, mouseY)) {
			console.log("In triangle");
			pMouseMap[1] -= 1;
		}

		else if (is_point_in_triangle(p[0] * tileSize * 2 + tileSize * 2, p[1] * tileSize + tileSize / 2,
			p[0] * tileSize * 2 + tileSize * 2, p[1] * tileSize + tileSize,
			p[0] * tileSize * 2 + tileSize, p[1] * tileSize + tileSize, mouseX, mouseY)) {
			console.log("In triangle");
			pMouseMap[0] += 1;
		}

		else if (is_point_in_triangle(p[0] * tileSize * 2 + tileSize, p[1] * tileSize + tileSize,
			p[0] * tileSize * 2, p[1] * tileSize + tileSize,
			p[0] * tileSize * 2, p[1] * tileSize + tileSize / 2, mouseX, mouseY)) {
			console.log("In triangle");
			pMouseMap[1] += 1;
		}

		console.log('c: ' + p[0] + ' r: ' + p[1]);
		console.log('cW: ' + pMouseMap[0] + ' rW: ' + pMouseMap[1]);
		cW = pMouseMap[0];
		rW = pMouseMap[1];
	});

	function bfs(player) {
		let directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
		let queue = [[player.x, player.y, 0]];
		visited = new Set();
		let paths = {};

		visited.add(`${player.x} ${player.y}`);
		paths[`${player.x} ${player.y}`] = [];

		while (queue.length > 0) {
			let [x, y, mov] = queue.shift();

			for (let [dx, dy] of directions) {
				let nx = x + dx;
				let ny = y + dy;
				if (nx >= 0 && nx < map[0].length && ny >= 0 && ny < map.length && !visited.has(`${nx} ${ny}`) && mov < player.actMov && map[ny][nx] == 1) {
					queue.push([nx, ny, mov + 1]);
					visited.add(`${nx} ${ny}`);
					paths[`${nx} ${ny}`] = [...paths[`${x} ${y}`], [nx, ny]];
				}
			}

		}
		return paths;
	}

	function movePlayer(path) {
		let index = 0;
		if (path != undefined) {
			function animateMovement() {
				if (index < path.length) {
					let [nextX, nextY] = path[index];
					players[currentPlayerIndex].x = nextX;
					players[currentPlayerIndex].y = nextY;
					index++;
					players[currentPlayerIndex].actMov -= 1;
					bfs(players[currentPlayerIndex])[`${cW} ${rW}`];
					setTimeout(animateMovement, 400); // Ajusta el tiempo para la velocidad de la animación
				} else {
					console.log("Movimiento completado");
					moving = false;
				}
			}
			animateMovement();
		}
	}

	canvas.addEventListener('click', function (event) {
		let rect = canvas.getBoundingClientRect();
		let clickX = event.clientX - rect.left;
		let clickY = event.clientY - rect.top;

		if (cW >= 0 && cW < map[0].length && rW >= 0 && rW < map.length && players[currentPlayerIndex].actMov > 0) {
			path = bfs(players[currentPlayerIndex])[`${cW} ${rW}`];
			console.log(path);
			moving = true;
			movePlayer(path);
		}

		//console.log('Click position - x: ' + clickX + ', y: ' + clickY);
	});

	function drawAreaMovement() {
		context.globalAlpha = 0.2;

		for (let p of visited) {
			let coor = p.split(' ');
			coor[0] = parseInt(coor[0]);
			coor[1] = parseInt(coor[1]);

			const isoX = (coor[0] - coor[1]) * tileSize + canvas.width / 2;
			const isoY = (coor[0] + coor[1]) * tileSize / 2 + tileSize * 2;
			context.beginPath();
			context.moveTo(isoX, isoY);
			context.lineTo(isoX + tileSize, isoY - tileSize / 2);
			context.lineTo(isoX, isoY - tileSize);
			context.lineTo(isoX - tileSize, isoY - tileSize / 2);
			context.closePath();
			context.fillStyle = 'blue';
			context.fill();
			context.strokeStyle = '#000';
			context.stroke();
		}

		context.globalAlpha = 1.0;
	}

	const spritesLoaded = players.map(player => new Promise((resolve) => {
		player.sprite.onload = resolve;
	}));

	Promise.all(spritesLoaded).then(drawGame);


	function gameLoop() {
		drawGame();
		requestAnimationFrame(gameLoop);
	}

	gameLoop();
}