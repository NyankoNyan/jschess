"use strict";

function Figure( battlefield, owner, place ){
	this.place = PlacePoint.copy(place);
	this.spawned = false;
	this.change = new MyEvent();
	this.battlefield = battlefield;
	this.owner = owner;
	this.name = "";
	this.moved = false;
}
Figure.prototype.spawn = function(point){
	//todo check usage
	if(!this.spawned){
		let collisions = this.battlefield.whatAreThere(point);
		if(collisions.length > 0 ){
			throw "Can't spawn on another object";
		}
		if(!battlefield.isFieldPoint(point)){
			throw "Can't spawn outside battlefield";
		}
		this.place = point;
		this.spawned = true;
		this.change.raise( { action:"spawn", object:this } );
	}
	else{
		throw "Allready spawned";
	}
};
Figure.prototype.moveTo = function( point ){
	if( this.canMoveTo( point ) ){		
		var endPointFigures = this.battlefield.whatAreThere( point );
		if( endPointFigures != null ){
			for(var figure of endPointFigures){
				figure.kill();
			}
		}
		this.place.copy( point );
		this.moved = true;
		this.change.raise( { action:"move", object:this } );
	}
	else{
		throw 'Bad place for moving';
	}
};
Figure.prototype.canMoveTo = function(point){
	return false;
};
Figure.prototype.getAvailableActions = function(){
	return null;
};
Figure.prototype.kill = function(){
	this.battlefield.removeFigure( this );
	this.change.raise( { action:"kill", object:this } );
};
Figure.prototype.getLineByOffset = function(offsetX, offsetY, limit){
	
	var result = { move:[], kill:[] };
	
	if(offsetX == 0 && offsetY == 0){
		return result;
	}
	
	for(var counter = 1; counter <= limit || limit == 0; counter++){
		var checkPoint = new PlacePoint( this.place.x + offsetX * counter, this.place.y + offsetY * counter );
		if( this.battlefield.isFieldPoint( checkPoint ) ){
			var checkFigures = this.battlefield.whatAreThere( checkPoint );
			if( checkFigures != null && checkFigures.length > 0 ){
				if(checkFigures[0].owner == this.owner){
					break;
				}
				else{
					result.kill.push(checkPoint);
					break;
				}
			}
			else{
				result.move.push(checkPoint);
			}
		}
		else{
			break;
		}
	}
	return result;
};
Figure.prototype.checkLineByOffset = function(offsetX, offsetY, limit){
	
	if(offsetX == 0 && offsetY == 0){
		return false;
	}
	
	for(var counter = 1; counter <= limit; counter++){
		var checkPoint = new PlacePoint( this.place.x + offsetX * counter, this.place.y + offsetY * counter );
		if( this.battlefield.isFieldPoint( checkPoint ) ){
			var checkFigures = this.battlefield.whatAreThere( checkPoint );
			if( checkFigures != null && checkFigures.length > 0 ){
				return false;
			}
		}
		else{
			return false;
		}
	}
	
	return true;
};
Figure.prototype.getLineOffset = function(point){
	var fullOffsetX = point.x - this.place.x;
	var fullOffsetY = point.y - this.place.y;
	
	if( ( Math.abs(fullOffsetX) == Math.abs(fullOffsetY) )
		|| ( fullOffsetX == 0 && fullOffsetY != 0 )
		|| ( fullOffsetX != 0 && fullOffsetY == 0 ) ){
		return { 
			x : Math.sign(fullOffsetX),
			y : Math.sign(fullOffsetY),
			length : (fullOffsetX != 0) ? Math.abs(fullOffsetX) : Math.abs(fullOffsetY)
		};
	}
	else{
		return null;
	}
}
Figure.prototype.checkLineByPoint = function(point, plus, cross){
	
	var offset = this.getLineOffset(point);
	
	if(offset == null){
		return false;
	}
	
	if( !( plus && ( offset.x == 0 || offset.y == 0 ) )
		&& !( cross && ( Math.abs( offset.x ) == Math.abs( offset.y ) ) ) ){
		return false;
	}
	
	return this.checkLineByOffset( offset.x, offset.y, offset.length - 1 ) && !this.battlefield.isAllyHere(point, this.owner);
};
Figure.prototype.addAction = function(actions, point){
	if(this.battlefield.isFieldPoint(point)){
		var otherFigures = this.battlefield.whatAreThere(point);
		if( otherFigures == null || otherFigures.length == 0 ){
			actions.push( { type : "move", point : point } );
		}
		else if(otherFigures.length == 1 ){
			if( otherFigures[0].owner != this.owner ){
				actions.push( { type : "kill", point : point } );
			}
		}
		else{
			throw "ERROR";			
		}
	}
}
Figure.prototype.addLine = function(actions, offsetX, offsetY){
	var linePoints = this.getLineByOffset(offsetX, offsetY, 0);
	for(var point of linePoints.move){
		actions.push( { type : "move", point : point } );
	}
	for(var point of linePoints.kill){
		actions.push( { type : "kill", point : point } );
	}
};


function FigKing( battlefield, owner, place ){
	Figure.call( this, battlefield, owner, place );
	this.name = "king";
}
Object.setPrototypeOf(FigKing.prototype, Figure.prototype);
FigKing.prototype.canMoveTo = function(point){
	if( this.battlefield.isFieldPoint(point) 
		&& this.place.x <= point.x + 1
		&& this.place.x >= point.x - 1
		&& this.place.y <= point.y + 1
		&& this.place.y >= point.y - 1 
		&& !( this.place.x == point.x && this.place.y == point.y ) 
		&& !this.battlefield.isAllyHere(point, this.owner)){		
		return true;
	}
	else{
		return false;
	}
};
FigKing.prototype.getAvailableActions = function(){
	var actions = [];	
	this.addAction( actions, new PlacePoint( this.place.x + 1, this.place.y - 1 ) );
	this.addAction( actions, new PlacePoint( this.place.x + 1, this.place.y ) );
	this.addAction( actions, new PlacePoint( this.place.x + 1, this.place.y + 1 ) );
	this.addAction( actions, new PlacePoint( this.place.x, this.place.y + 1 ) );
	this.addAction( actions, new PlacePoint( this.place.x - 1, this.place.y + 1 ) );
	this.addAction( actions, new PlacePoint( this.place.x - 1, this.place.y ) );
	this.addAction( actions, new PlacePoint( this.place.x - 1, this.place.y - 1 ) );
	this.addAction( actions, new PlacePoint( this.place.x, this.place.y - 1 ) );
	return actions;
};


function FigPawn( battlefield, owner, place ){
	Figure.call(this, battlefield, owner, place);
	this.name = "pawn";
}
Object.setPrototypeOf(FigPawn.prototype, Figure.prototype);
FigPawn.prototype.canMoveTo = function(point){
	if( this.battlefield.isFieldPoint(point) ){
		if( ( ( this.owner == Player.white && this.place.y == point.y + 2 )
				|| ( this.owner == Player.black && this.place.y == point.y - 2 ) )
			&& this.battlefield.whatAreThere( point ) == null
			&& this.battlefield.whatAreThere( new PlacePoint( this.place.x,
				( this.owner == Player.white ) ? ( this.place.y - 1 ) : ( this.place.y + 1 ) ) ) == null ){
			return true;
		}
		if( ( this.owner == Player.white && this.place.y == point.y + 1 )
			|| ( this.owner == Player.black && this.place.y == point.y - 1 ) ){
			if( this.place.x == point.x && this.battlefield.whatAreThere(point) == null ){
				return true;
			}
			if( ( this.place.x == point.x + 1 || this.place.x == point.x - 1 )
				&& this.battlefield.isEnemyHere(point, this.owner) ){
				return true;			
			}
		}
	}
	return false;
};
FigPawn.prototype.getAvailableActions = function(){
	
	var actions = [];
	
	var movePoint = new PlacePoint( this.place.x, 
		(this.owner == Player.white) ? (this.place.y - 1) : (this.place.y + 1) );
		
	if(this.battlefield.isFieldPoint(movePoint) 
		&& this.battlefield.whatAreThere(movePoint) == null){
			
		actions.push( { type:"move", point:movePoint } );	
		
		var movePoint2 = new PlacePoint( this.place.x,
			(this.owner == Player.white) ? (this.place.y - 2) : (this.place.y + 2) );
		
		if(!this.moved 
			&& this.battlefield.isFieldPoint(movePoint2) 
			&& this.battlefield.whatAreThere(movePoint2) == null)
		{
			actions.push( { type:"move", point:movePoint2 } );
		}
	}
	
	var killPoint = null;
	
	killPoint = new PlacePoint( this.place.x + 1,
		( this.owner == Player.white ) ? ( this.place.y - 1 ) : ( this.place.y + 1 ) );
		
	if( this.battlefield.isFieldPoint( killPoint )
		&& this.battlefield.isEnemyHere( killPoint, this.owner ) ) {
		actions.push( { type:"kill", point:killPoint } );
	}
	
	killPoint = new PlacePoint( this.place.x - 1,
		( this.owner == Player.white ) ? ( this.place.y - 1 ) : ( this.place.y + 1 ) );
		
	if( this.battlefield.isFieldPoint( killPoint )
		&& this.battlefield.isEnemyHere( killPoint, this.owner ) ) {
		actions.push( { type:"kill", point:killPoint } );
	}
	
	return actions;	
}


function FigBishop( battlefield, owner, place ){
	Figure.call( this, battlefield, owner, place );
	this.name = "bishop";
}
Object.setPrototypeOf(FigBishop.prototype, Figure.prototype);
FigBishop.prototype.canMoveTo = function(point){
	return this.checkLineByPoint(point, false, true);	
};
FigBishop.prototype.getAvailableActions = function(){
	var actions = [];
	this.addLine( actions, 1, 1 );
	this.addLine( actions, 1, -1 );
	this.addLine( actions, -1, -1 );
	this.addLine( actions, -1, 1 );
	return actions;
};


function FigRook( battlefield, owner, place ){
	Figure.call( this, battlefield, owner, place );
	this.name = "rook";
}
Object.setPrototypeOf(FigRook.prototype, Figure.prototype);
FigRook.prototype.canMoveTo = function(point){
	return this.checkLineByPoint(point, true, false);
};
FigRook.prototype.getAvailableActions = function(){
	var actions = [];
	this.addLine( actions, 0, 1 );
	this.addLine( actions, 1, 0 );
	this.addLine( actions, 0, -1 );
	this.addLine( actions, -1, 0 );
	return actions;
};


function FigKnight( battlefield, owner, place ){
	Figure.call( this, battlefield, owner, place );
	this.name = "knight";
}
Object.setPrototypeOf(FigKnight.prototype, Figure.prototype);
FigKnight.prototype.canMoveTo = function(point){
	if( this.battlefield.isFieldPoint(point)){
		var absX = Math.abs(point.x - this.place.x);
		var absY = Math.abs(point.y - this.place.y);
		if ( ( absX == 1 || absY == 1 )
			&& ( absX == 2 || absY == 2 ) 
			&& !this.battlefield.isAllyHere(point, this.owner) ){
			return true;
		}		
	}
	return false;
};
FigKnight.prototype.getAvailableActions = function(){
	var actions = [];
	var tryAddAction = function(actions, offsetX, offsetY){
		var point = new PlacePoint(this.place.x + offsetX, this.place.y + offsetY);
		if(this.canMoveTo(point)){
			if(this.battlefield.whatAreThere(point) == null){
				actions.push( { type:"move", point:point } );
			}
			else{
				actions.push( { type:"kill", point:point } );
			}
		}
	};
	tryAddAction.call( this, actions, 1, 2 );
	tryAddAction.call( this, actions, -1, 2 );
	tryAddAction.call( this, actions, 1, -2 );
	tryAddAction.call( this, actions, -1, -2 );
	tryAddAction.call( this, actions, 2, 1 );
	tryAddAction.call( this, actions, -2, 1 );
	tryAddAction.call( this, actions, 2, -1 );
	tryAddAction.call( this, actions, -2, -1 );
	return actions;
};


function FigQueen( battlefield, owner, place ){
	Figure.call( this, battlefield, owner, place );
	this.name = "queen";
}
Object.setPrototypeOf(FigQueen.prototype, Figure.prototype);
FigQueen.prototype.canMoveTo = function(point){
	return this.checkLineByPoint(point, true ,true);
};
FigQueen.prototype.getAvailableActions = function(){
	var actions = [];
	this.addLine( actions, 0, 1 );
	this.addLine( actions, 1, 1 );
	this.addLine( actions, 1, 0 );
	this.addLine( actions, 1, -1 );
	this.addLine( actions, 0, -1 );
	this.addLine( actions, -1, -1 );
	this.addLine( actions, -1, 0 );
	this.addLine( actions, -1, 1 );
	return actions;
};
