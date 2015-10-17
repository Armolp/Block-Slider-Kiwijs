var gameOptions = {
	renderer: Kiwi.RENDERER_WEBGL, 
	width: 360,
	height: 360
}

var game = new Kiwi.Game('content', 'myGame', null, gameOptions);

var myState = new Kiwi.State( "myState" );

myState.preload = function() {

	Kiwi.State.prototype.preload.call( this );

    //load all images
	this.addSpriteSheet( "characterSprite", "character.png", 36, 36 );
    this.addImage( "goalSprite", "goal.png" );
    this.addImage( "obstacleSprite", "obstacle.png" );
    this.addImage( "background", "background.png" );

};

myState.create = function(){

	Kiwi.State.prototype.create.call( this );

    var obstacleMap = [ 
            [0,0,0,0,0,0,1,0,0,0],
            [0,0,0,0,0,0,0,0,1,0],
            [0,1,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,1],
            [0,0,0,0,0,1,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0]];
    this.velocity = 9;

	this.background = new Kiwi.GameObjects.StaticImage( this, this.textures.background, 0, 0 );
	this.character = new Kiwi.GameObjects.Sprite( this, this.textures.characterSprite, 0, 0 );
    this.goal = new Kiwi.GameObjects.Sprite( this, this.textures.goalSprite, 2*36, 8*36 );
    this.obstacleGroup = new Kiwi.Group( this );

    this.textField = new Kiwi.GameObjects.Textfield(this, '');
    this.textField.x = this.game.stage.width / 2;
    this.textField.y = 10;
    this.textField.color = '#FFFFFF';
    this.textField.fontFamily = 'Roboto, sans-serif';
    this.textField.textAlign = Kiwi.GameObjects.Textfield.TEXT_ALIGN_CENTER;

    for(var row=0; row<10; row++) {
        for(var col=0; col<10; col++) {
            if(obstacleMap[row][col] == 1) {
                console.log("row: "+row+" col: "+col);
                this.obstacleGroup.addChild( new Kiwi.GameObjects.Sprite(
                    this, this.textures.obstacleSprite, col*36, row*36));
            }
        }
    }

	this.leftKey 	= this.game.input.keyboard.addKey( Kiwi.Input.Keycodes.LEFT );
    this.rightKey 	= this.game.input.keyboard.addKey( Kiwi.Input.Keycodes.RIGHT );
    this.upKey 		= this.game.input.keyboard.addKey( Kiwi.Input.Keycodes.UP );
    this.downKey 	= this.game.input.keyboard.addKey( Kiwi.Input.Keycodes.DOWN );

    this.character.animation.add( 'idle', [0], 0.1, false );
    this.character.animation.add( 'right', [1], 0.1, false );
    this.character.animation.add( 'left', [2], 0.1, false );
    this.character.animation.add( 'up', [3], 0.1, false );
    this.character.animation.add( 'down', [4], 0.1, false );

    this.facing = 'idle';

    this.character.animation.play( 'idle' );
    
    this.addChild(this.background);
    this.addChild(this.character);
    this.addChild(this.goal);
    this.addChild(this.obstacleGroup);
    this.addChild(this.textField);

};

myState.update = function() {

	Kiwi.State.prototype.update.call( this );

	//Only registers inputs when the character is idle
	if ( this.facing == 'idle' ) {
		if ( this.downKey.isDown ) {
	        if ( this.character.animation.currentAnimation.name != ( 'down' )) {
	            this.character.animation.play( 'down' );
	        }
	        this.facing = 'down';
	    }
	    else if ( this.upKey.isDown ) {
	        if ( this.character.animation.currentAnimation.name != ( 'up' )) {
	            this.character.animation.play( 'up' );
	    	}
	    	this.facing = 'up';
	    }
	    else if ( this.leftKey.isDown ) {
	        if ( this.character.animation.currentAnimation.name != ( 'left' )) {
	            this.character.animation.play( 'left' );
	    	}
	    	this.facing = 'left';
	    }
	    else if ( this.rightKey.isDown ) {
	        if ( this.character.animation.currentAnimation.name != ( 'right' )) {
	            this.character.animation.play( 'right' );
	        }
	        this.facing = 'right';
	    }
	}
	//moves while the status is not idle
    else if ( this.facing == 'down' ) {
        this.character.transform.y += this.velocity;
    }
    else if ( this.facing == 'up' ) {
        this.character.transform.y -= this.velocity;
    }
    else if ( this.facing == 'left' ) {
        this.character.transform.x -= this.velocity;
    }
    else if ( this.facing == 'right' ) {
        this.character.transform.x += this.velocity;
    }

    //Check all colisions
    this.checkColision();
    
};

myState.checkColision = function() {

    //check colision with wall limits
    if ( this.character.transform.y > 324 ) {
        this.character.transform.y = 324;
        this.facing = 'idle';
        this.character.animation.play( 'idle' );
    }
    else if ( this.character.transform.y < 0 ) {
        this.character.transform.y = 0;
        this.facing = 'idle';
        this.character.animation.play( 'idle' );
    }
    else if ( this.character.transform.x < 0 ) {
        this.character.transform.x = 0;
        this.facing = 'idle';
        this.character.animation.play( 'idle' );
    }
    else if ( this.character.transform.x > 324 ) {
        this.character.transform.x = 324;
        this.facing = 'idle';
        this.character.animation.play( 'idle' );
    }

    //temporal box object to detect colision with obstacles and goal
    var characterBox = this.character.box.bounds;

    //check colision with goal
    if( this.goal.box.bounds.intersects(characterBox) ) {
        this.facing = 'stop';
        this.character.animation.play('idle');
        this.textField.text = 'You win!!!';
        this.character.x = this.goal.x;
        this.character.y = this.goal.y;
        this.goal.destroy();
    }

    //check colision with obstacles
    var obstacles = this.obstacleGroup.members;
    for(var n=0; n<obstacles.length; n++) {
        if(obstacles[n].box.bounds.intersects(characterBox)){
            console.log("true");
            if(this.facing == "up") {
                this.character.transform.y += this.velocity;
            }
            else if(this.facing == "down") {
                this.character.transform.y -= this.velocity;
            }
            else if(this.facing == "left") {
                this.character.transform.x += this.velocity;
            }
            else if(this.facing == "right") {
                this.character.transform.x -= this.velocity;
            }
            this.facing = 'idle';
            this.character.animation.play( 'idle' );
        }
    }

}

game.states.addState( myState );

//start game
game.states.switchState( 'myState' );