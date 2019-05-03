"use strict";

// Model


function Battlefield(){
	this.updateHandler = null;
	this.figures = [];
}
Battlefield.prototype.whatAreThere = function(point){
	var result = null;
	for(var figId = 0; figId < this.figures.length; figId++){
		var figure = this.figures[figId];
		if(figure.place.isEqual(point)){
			if(result === null){
				result = [];
			}
			result.push(figure);
		}
	}
	return result;
};
Battlefield.prototype.isFieldPoint = function(point){
	return point.x >= 0 && point.x <= 7 && point.y >= 0 && point.y <= 7;
};
Battlefield.prototype.isEnemyHere = function(point, owner){
	for(var figId = 0; figId < this.figures.length; figId++){
		var figure = this.figures[figId];
		if(figure.place.isEqual(point)){
			return figure.owner != owner;
		}
	}
	return false;
};
Battlefield.prototype.isAllyHere = function(point, owner){
	for(var figId = 0; figId < this.figures.length; figId++){
		var figure = this.figures[figId];
		if(figure.place.isEqual(point)){
			return figure.owner == owner;
		}
	}
	return false;
};
Battlefield.prototype.setupChess = function(){	
	this.figures.push( new FigKing( this, 1, new PlacePoint(4, 7) ) );
	this.figures.push( new FigKing( this, 2, new PlacePoint(4, 0) ) );
	
	this.figures.push( new FigQueen( this, 1, new PlacePoint(3, 7) ) );
	this.figures.push( new FigQueen( this, 2, new PlacePoint(3, 0) ) );
	
	this.figures.push( new FigBishop( this, 1, new PlacePoint(2, 7) ) );
	this.figures.push( new FigBishop( this, 1, new PlacePoint(5, 7) ) );
	this.figures.push( new FigBishop( this, 2, new PlacePoint(2, 0) ) );
	this.figures.push( new FigBishop( this, 2, new PlacePoint(5, 0) ) );
	
	this.figures.push( new FigKnight( this, 1, new PlacePoint(1, 7) ) );
	this.figures.push( new FigKnight( this, 1, new PlacePoint(6, 7) ) );
	this.figures.push( new FigKnight( this, 2, new PlacePoint(1, 0) ) );
	this.figures.push( new FigKnight( this, 2, new PlacePoint(6, 0) ) );
	
	this.figures.push( new FigRook( this, 1, new PlacePoint(0, 7) ) );
	this.figures.push( new FigRook( this, 1, new PlacePoint(7, 7) ) );
	this.figures.push( new FigRook( this, 2, new PlacePoint(0, 0) ) );
	this.figures.push( new FigRook( this, 2, new PlacePoint(7, 0) ) );
	
	
	for(var x = 0; x < 8; x++){
		this.figures.push( new FigPawn( this, 1, new PlacePoint(x,6) ) );
		this.figures.push( new FigPawn( this, 2, new PlacePoint(x,1) ) );
	}
};
Battlefield.prototype.removeFigure = function(figure){
	
	var figIndex = this.figures.indexOf(figure);
	if( figIndex >= 0 ){
		this.figures.splice(figIndex,1);
	}
};


function Player(){
}
Player.white = 1;
Player.black = 2;


function GameStage(firstPlayer){
	this.nextPlayerId = firstPlayer;
}
GameStage.prototype.nextTurn = function(){
	this.nextPlayerId = this.getNext();
	return this.nextPlayerId;
};
GameStage.prototype.getNext = function(){
	if( this.nextPlayerId == Player.white ){
		return Player.black;
	}
	else{
		return Player.white;
	}
};
GameStage.prototype.getCurrentPlayer = function(){
	return this.nextPlayerId;
};