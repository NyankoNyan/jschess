"use strict";

function Figure(battlefield){
	this.place = null;
	this.spawned = false;
	this.change = new MyEvent();
	this.battlefield = battlefield;
	this.owner = null;
	this.name = "";
}
Figure.prototype.spawn = function(point){
	if(!this.spawned){
		let collisions = battlefield.whatAreThere(point);
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
		this.place.copy( point );
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


function FigKing( battlefield ){
	Figure.call( this, battlefield );
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
	var addAction = function(x,y){
		var point = new PlacePoint(x,y);
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
	addAction.call( this, this.place.x + 1, this.place.y - 1 );
	addAction.call( this, this.place.x + 1, this.place.y );
	addAction.call( this, this.place.x + 1, this.place.y + 1 );
	addAction.call( this, this.place.x, this.place.y + 1 );
	addAction.call( this, this.place.x - 1, this.place.y + 1 );
	addAction.call( this, this.place.x - 1, this.place.y );
	addAction.call( this, this.place.x - 1, this.place.y - 1 );
	addAction.call( this, this.place.x, this.place.y - 1 );
	actions.push( { type : "self", point : this.place } );
	return actions;
};


function FigPawn(battlefield, side){
	Figure.call(this, battlefield);
	this.side = side;
}
Object.setPrototypeOf(FigPawn.prototype, Figure.prototype);
FigPawn.prototype.canMoveTo = function(point){
	if( battlefield.isFieldPoint(point)
		&& ( ( this.side == 1 && this.place.y == point.y + 1 )
			|| ( this.side == 2 && this.place.y == point.y - 1 ) )
		&& ( ( this.place.x == point.x && battlefield.whatAreThere(point) == null ) 
			|| ( ( this.place.x == point.x + 1
					|| this.place.x == point.x - 1 )
				&& battlefield.isEnemyHere(point, this.owner) ) ) ){
		return true;
	}
	else{
		return false;
	}
};


function FigBishop(battlefield){
	Figure.call(this, battlefield);
}
Object.setPrototypeOf(FigBishop.prototype, Figure.prototype);
FigBishop.prototype.canMoveTo = function(point){
	if( battlefield.isFieldPoint(point)
		&& this.place.x != point.x
		&& this.place.y != point.y
		&& Math.abs(this.place.x - point.x) == Math.abs(this.place.y - point.y)
		&& !battlefield.isAllyHere(point,this.owner) ){
		for(var length = 1; length < Math.abs(this.place.x - point.x); length++){
			var pathPoint = new PlacePoint(
				this.place.x + length * Math.sign(point.x - this.place.x),
				this.place.y + length * Math.sign(point.y - this.place.y) );
			if(battlefield.whatAreThere(pathPoint) != null){
				return false;
			}
		}
		return true;
	}
	return false;	
};


function FigRook(battlefield){
	Figure.call(this, battlefield);
}
Object.setPrototypeOf(FigRook.prototype, Figure.prototype);
FigRook.prototype.canMoveTo = function(point){
	if( battlefield.isFieldPoint(point)
		&& ( (this.place.x == point.x && this.place.y != point.y)
			|| (this.place.x != point.x && this.place.y == point.y))
		&& !battlefield.isAllyHere(point,this.owner) ){
		var pathLength = Math.abs(this.place.x - point.x + this.place.y - point.y) - 1;
		var directionX = Math.sign(point.x - this.place.x);
		var directionY = Math.sign(point.y - this.place.y);
		for(var step = 1; step <= pathLength; step++){
			if(battlefield.whatAreThere(new PlacePoint(this.place.x + directionX * step, this.place.y + directionY * step)) != null){
				return false;
			}
		}
		return true;
	}
	return false;
};


function FigKnight(battlefield){
	Figure.call(this, battlefield);
}
Object.setPrototypeOf(FigKnight.prototype, Figure.prototype);


function FigQueen(battlefield){
	Figure.call(this, battlefield);
}
Object.setPrototypeOf(FigQueen.prototype, Figure.prototype);
