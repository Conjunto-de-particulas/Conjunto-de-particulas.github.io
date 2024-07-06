const map = [[0, 0, 0, 1, 1, 0, 1, 1, 1, 1], 
[0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
 [1, 1, 1, 1, 1, 0, 1, 1, 1, 0], 
 [1, 0, 1, 0, 1, 1, 0, 0, 0, 1],
 [0, 0, 1, 0, 0, 0, 1, 0, 1, 1],
 [0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
 [1, 0, 1, 1, 0, 0, 1, 1, 1, 0],
 [1, 1, 0, 1, 1, 0, 0, 1, 1, 1],
 [1, 0, 1, 1, 0, 0, 0, 1, 1, 0],
 [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]]



/*[
    [0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0],
    [0, 1, 0, 0, 1]
];*/

const players = [
	{x:2, y:2, id:0, maxMov: 4, actMov: 4, spriteSrc:'images/sprite.png', keyUp: 'ArrowUp', keyDown: 'ArrowDown', keyLeft: 'ArrowLeft', keyRight: 'ArrowRight'},
	{x:3, y:3, id:1, maxMov: 4, actMov: 4, spriteSrc:'images/sprite2.png', keyUp: 'w', keyDown: 's', keyLeft: 'a', keyRight: 'd'}

];

let currentPlayerIndex = 0;

window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const tileSize = 40;
    const spriteSize = 40; // Tamaño del sprite
	const mapOrigin = [8, 0]

    players.forEach(player => {
        player.sprite = new Image();
        player.sprite.src = player.spriteSrc;
    });

    function drawIsometricTile(x, y, size, color) {
        const isoX = (x - y) * size  + canvas.width / 2; // - (map[0].length * size) / 2
        const isoY = (x + y) * size / 2 + canvas.height / 4 - (map.length * size) / 4;
        context.beginPath();
        context.moveTo(isoX, isoY);
        context.lineTo(isoX + size, isoY - size / 2);
        context.lineTo(isoX, isoY - size);
        context.lineTo(isoX - size, isoY - size / 2);
        context.closePath();
        context.fillStyle = color;
        context.fill();
        context.strokeStyle = '#000';
        context.stroke();
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
        const isoX = (player.x - player.y) * size + canvas.width / 2 ; //- (map[0].length * size) / 2
        const isoY = (player.x + player.y) * size / 2 + canvas.height / 4 - (map.length * size) / 4;
        context.drawImage(player.sprite, (isoX - spriteSize / 2) , (isoY - spriteSize / 2) - spriteSize, spriteSize, spriteSize);
    }

    function drawGame() {
        context.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas
        drawMap(map);
        players.forEach(player => drawPlayer(player, tileSize));
    }
	
	function switchTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }
	
    function updateMenuInfo() {
        players.forEach(player => {
            const menu = document.querySelector(`#menuPlayer${player.id + 1}`);
            menu.querySelector('.player-name').textContent = player.name;
            menu.querySelector('.player-health').textContent = player.health;
        });
    }
	
	document.querySelectorAll('.end-turn-button').forEach(button => {
		button.addEventListener('click', function() {
			let player = players[currentPlayerIndex];
			let playerId = parseInt(button.getAttribute('data-player-id'), 10);
			if (playerId === currentPlayerIndex) {
				player.actMov = player.maxMov;
				switchTurn();
				drawGame();
			}
		});
	});
	
	
    document.addEventListener('keydown', function(event) {
		const player = players[currentPlayerIndex];
		let newX = player.x;
		let newY = player.y;
		let change = false;

		switch(event.key) {
			case player.keyUp:
					if(player.actMov > 0){
						newY--;
						player.actMov--;
						change = true;						
					}
					break;
			case player.keyDown:
					if(player.actMov > 0){
						newY++;
						player.actMov--;
						change = true;						
					}
					break;
			case player.keyLeft:
					if(player.actMov > 0){
						newX--;
						player.actMov--;
						change = true;						
					}			
					break;
			case player.keyRight:
					if(player.actMov > 0){
						newX++;
						player.actMov--;
						change = true;						
					}
					break;
		}

			// Comprobar que el nuevo movimiento esté dentro de los límites del mapa
		if (newX >= 0 && newX < map[0].length && newY >= 0 && newY < map.length) {
			player.x = newX;
			player.y = newY;
		}else{
			change = false;
			player.actMov++;
		}
		if(change && (player.actMov >= 0)){
			drawGame();
		}
		
    });
	
	function areaTriangle(x1, y1, x2, y2, x3, y3){
		return Math.abs(x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2)) / 2.0;
	}
	
	function is_point_in_triangle(x1, y1, x2, y2, x3, y3, x, y){
		let a = areaTriangle(x1, y1, x2, y2, x3, y3);
		
		let a1 = areaTriangle(x, y, x2, y2, x3, y3);
		let a2 = areaTriangle(x1, y1, x, y, x3, y3);
		let a3 = areaTriangle(x1, y1, x2, y2, x, y);
		
		return Math.abs(a - (a1 + a2 + a3)) < 1e-8;
	}
	

	canvas.addEventListener('mousemove', function(event) {
		let rect = canvas.getBoundingClientRect();
		let mouseX = event.clientX - rect.left;
		let mouseY = event.clientY - rect.top;
		
		mouseX -= 3;
		mouseY -= 18;
		
		console.log('x: ' + mouseX + ' y: ' + mouseY);
		
		let p = [Math.floor(mouseX/(tileSize*2)), Math.floor(mouseY/tileSize)] 
		let p2 = [mouseX%tileSize, mouseY%tileSize] 
		let pMouseMap = [(p[1] - mapOrigin[1]) + (p[0] - mapOrigin[0]), 
		(p[1] - mapOrigin[1]) - (p[0] - mapOrigin[0])]
		
		drawGame();
		
		/*context.beginPath();
		context.moveTo(p[0]*tileSize*2 + 3, p[1]*tileSize + 18);
		context.lineTo(p[0]*tileSize*2 + tileSize * 2 + 3, p[1]*tileSize + 18);
		context.lineTo(p[0]*tileSize*2 + tileSize * 2 + 3, p[1]*tileSize + tileSize + 18);
		context.lineTo(p[0]*tileSize*2 + 3, p[1]*tileSize + tileSize + 18);
		context.closePath();
		context.strokeStyle = '#8bb9cc';
        context.stroke();*/
		
		mouseX += 3;
		mouseY += 18;
		
		if(is_point_in_triangle(p[0]*tileSize*2 + 3, p[1]*tileSize + 18, 
			p[0]*tileSize*2 + tileSize + 3, p[1]*tileSize + 18, 
				p[0]*tileSize*2 + 3, p[1]*tileSize + tileSize/2 + 18, mouseX, mouseY)){
			console.log("In triangle");
			pMouseMap[0] -= 1;
		}else if(is_point_in_triangle(p[0]*tileSize*2 + tileSize + 3, p[1]*tileSize + 18, 
			p[0]*tileSize*2 + tileSize * 2 + 3, p[1]*tileSize + 18, 
			p[0]*tileSize*2 + tileSize * 2 + 3, p[1]*tileSize + tileSize/2 + 18, mouseX, mouseY)){
			console.log("In triangle");
			pMouseMap[1] -= 1;
		}else if(is_point_in_triangle(p[0]*tileSize*2 + tileSize * 2 + 3, p[1]*tileSize + tileSize/2 + 18, 
				p[0]*tileSize*2 + tileSize * 2 + 3, p[1]*tileSize + tileSize + 18, 
				p[0]*tileSize*2 + tileSize + 3, p[1]*tileSize + tileSize + 18, mouseX, mouseY)){
			console.log("In triangle");
			pMouseMap[0] += 1;
		}else if(is_point_in_triangle(p[0]*tileSize*2 + tileSize + 3, p[1]*tileSize + tileSize + 18,
					p[0]*tileSize*2 + 3, p[1]*tileSize + tileSize + 18,
					p[0]*tileSize*2 + 3, p[1]*tileSize + tileSize/2 + 18, mouseX, mouseY)){
						console.log("In triangle");
			pMouseMap[1] += 1;
		}
				
		console.log('c: ' + p[0] + ' r: ' + p[1]);
		console.log('cW: ' + pMouseMap[0] + ' rW: ' + pMouseMap[1]);
	});

    const spritesLoaded = players.map(player => new Promise((resolve) => {
        player.sprite.onload = resolve;
    }));

    Promise.all(spritesLoaded).then(drawGame);
}
