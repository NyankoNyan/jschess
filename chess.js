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
			return figure.owner = owner;
		}
	}
	return false;
};
Battlefield.prototype.setupChess = function(){
	
	var figure = null;
	
	figure = new FigKing(this);
	figure.owner = 1;
	figure.place = new PlacePoint(4,7);
	this.figures.push(figure);
	
	figure = new FigKing(this);
	figure.owner = 2;
	figure.place = new PlacePoint(4,0);
	this.figures.push(figure);
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