var leaders = [
	'oliver',
	'mie',
	'naja',
	'mikkel',
	'mathias',
	'david',
	'znegl',
	'morten'
];

var states = {
	START: 0,
	SELECT: 1,
	PLAY: 2,
	FINISH: 3
};

var activeKeys = [];

// State specific variables
var selectingUser = 1;

// Image array
var images;

// Players: {score: number, image: number}
var players = [];

var state = states.START;

var clockIntervalId;
var updateIntervalId;
var secondsLeft;
var interval = 1000;
var gameTime = 100;

function displayStartScreen() {
	state = states.START;

	// Clear all images
	images.prop({
		'src': '',
		'data-id': 0
	});

	// Clear players
	players = [];
	selectingUser = 1;
	updateScoreDisplay();

	// Reset time
	secondsLeft = gameTime + 1;
	updateClock();

	// Display type selector
	$('#start').addClass('active');
	$('#finish').removeClass('active');
}

function displayFinishScreen() {
	clearInterval(clockIntervalId);
	clearInterval(updateIntervalId);
	state = states.FINISH;

	$('#finish').addClass('active');
	$('#imageWrapper').removeClass('active');
	if (players.length > 1) {
		if (players[0].score == players[1].score) {
			$('#finishHeading').text('Ingen vandt!');
		} else if (players[0].score < players[1].score) {
			$('#finishHeading').text('Spiller 2 vandt!');
		} else {
			$('#finishHeading').text('Spiller 1 vandt!');
		}
	} else {
		$('#finishHeading').text('Du fik ' + players[0].score + ' point!');
	}
}

function startGame() {
	console.log('start game', players);

	state = states.PLAY;

	$('#select').removeClass('active');
	$('#imageWrapper').addClass('active');
	images.prop({
		'src': '',
		'data-id': 0
	});

	updateIntervalId = setInterval(displayRandomLeader, interval);
	clockIntervalId = setInterval(updateClock, 1000);
	displayRandomLeader();
}

function displayRandomLeader() {
	// Choose random field
	var field = Math.ceil(Math.random() * 4);

	// Choose random leader
	var leader = Math.floor(Math.random() * leaders.length);

	$('#image' + field + ' img').prop({
		'src': 'images/' + leaders[leader] + '.jpg',
		'data-index': leader + 1
	});
}

function updateClock() {
	secondsLeft--;
	$('#clock').text(secondsLeft);
	if (!secondsLeft && state == states.PLAY) {
		displayFinishScreen();
	}
}

function displayLeaderSelector() {
	console.log('display leader selector', players);

	state = states.SELECT;

	$('#start').removeClass('active');
	$('#select').addClass('active');
	$('#imageWrapper').addClass('active');

	if (players.length == 1) {
		// Single player
		$('#selectHeading').text('Vælg hvem du vil tæve');
	} else if (players.length == 2) {
		// Two player
		$('#selectHeading').text('Vælg hvem du vil tæve (spiller 1)');
	}
	displayFirst4();
}

function displayFirst4() {
	leaders.forEach(function(leader, index) {
		if (index < 4) {
			images[index].setAttribute('data-index', index + 1);
			images[index].src = 'images/' + leader + '.jpg';
		}
	});
}
function displayLast4() {
	leaders.forEach(function(leader, index) {
		if (index > 3) {
			images[index-4].setAttribute('data-index', index + 1);
			images[index-4].src = 'images/' + leader + '.jpg';
		}
	});
}

function updateScoreDisplay() {
	if (players.length == 0) {
		$('.score').text(0);
		return;
	}

	$('#score1').text(players[0].score);
	if (players.length > 1) {
		$('#score2').text(players[1].score);
	}
}

function validateKeyPress(e) {

	if (activeKeys.indexOf(e.keyCode) != -1) {
		return;
	}
	activeKeys.push(e.keyCode);

	var selectedImage = -1;
	switch(e.keyCode) {
		case 49: // 1
		case 38: // Key up
			selectedImage = 1;
			break;
		case 50: // 2
		case 40: // Key down
			selectedImage = 2;
			break;
		case 51: // 3
		case 37: // Key left
			selectedImage = 3;
			break;
		case 52: // 4
		case 39: // Key right
			selectedImage = 4;
			break;
		case 32: // Space
			break;
		default:
			console.log('Keycode', e.keyCode);
			break;
	}

	switch(state) {
		case states.PLAY:
			if (e.keyCode == 32) {
				secondsLeft = 1;
				return;
			}
			if (selectedImage == -1) {
				return;
			}
			var image = $('#image' + selectedImage + ' img');

			var correct = false;

			// Count up if the pressed leader is one of the selected leaders
			players.forEach(function(player) {
				if (player.image == image.prop('data-index')) {
					console.log('image selected', image.prop('data-index'));
					player.score++;
					image.prop({
						'src': '',
						'data-index': 0
					});
					correct = true;
				}
			});

			// Count down if not
			if (!correct && players.length == 1) {
				players.forEach(function(player) {
					player.score--;
				});
			}

			updateScoreDisplay();
			break;
		case states.START:
			if (selectedImage == 2) {
				// Add one player
				players.push({score: 0, image: 0});
			} else if (selectedImage == 3) {
				// Add two players
				players.push({score: 0, image: 0});
				players.push({score: 0, image: 0});
			} else {
				return;
			}
			displayLeaderSelector();
			break;
		case states.SELECT:
			if (selectedImage == -1) {
				if (images[0].src.indexOf(leaders[0]) != -1) {
					displayLast4();
				} else {
					displayFirst4()
				}
			} else {
				players[selectingUser-1].image = $('#image' + selectedImage + ' img').attr('data-index');
				if (players.length > 1) {
					if (selectingUser == 2) {
						startGame();
					} else {
						selectingUser++;
						$('#selectHeading').text('Vælg hvem du vil tæve (spiller 2)');
					}
				} else {
					startGame();
				}
			}
			break;
		case states.FINISH:
			if (e.keyCode == 32) {
				displayStartScreen();
			}
			break;
	}
}

function validateKeyRelease(e) {
	var index = activeKeys.indexOf(e.keyCode);
	if (index != -1) {
		activeKeys.splice(index, 1);
	}
}

// Start the game
$(document).ready(function() {

	images = $('.image img');

	displayStartScreen();

	$('body').keydown(validateKeyPress);
	$('body').keyup(validateKeyRelease);
});
