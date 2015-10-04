build:
	browserify -t babelify --outfile bundle-game.js js/*.js js/game/*.js
	browserify -t babelify --outfile bundle-index.js js/*.js js/index/*.js
