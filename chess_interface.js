"use strict";

document.addEventListener('DOMContentLoaded', function(){
	var gameStage = new GameStage(Player.white);
	
	var battlefield = new Battlefield();
	battlefield.setupChess();
	
	var playerInterfaceModel = new PlayerInterfaceModel();
	var battlefieldView = new BattlefieldView();
	var offlinePlayerController = new OfflinePlayerController();
	
	battlefieldView.battlefield = battlefield;
	battlefieldView.onCellClick.addHandler( offlinePlayerController, offlinePlayerController.onCellClick );
	
	playerInterfaceModel.eventSelect.addHandler( battlefieldView, battlefieldView.onFigureSelect );
	playerInterfaceModel.eventDeselect.addHandler( battlefieldView, battlefieldView.onFigureDeselect );
	
	offlinePlayerController.battlefield = battlefield;	
	offlinePlayerController.battlefieldView = battlefieldView;
	offlinePlayerController.gameStage = gameStage;
	offlinePlayerController.playerInterfaceModel = playerInterfaceModel;
	
	battlefieldView.open();
});

// View and Controller 

function OfflinePlayerController(){
	this.battlefield = null;
	this.battlefieldView = null;
	this.gameStage = null;
	this.playerInterfaceModel = null;
}
OfflinePlayerController.prototype.onCellClick = function(point){
	
	var tryMoveSelected = function(){
		let selectedPoint = this.playerInterfaceModel.getSelected();			
		if(selectedPoint != null){
			let selectedFigure = this.battlefield.whatAreThere(selectedPoint)[0];
			if(selectedFigure == null){
				throw "WTF? Where is selected figure?";
			}
			try{
				selectedFigure.moveTo(point);
				this.playerInterfaceModel.clear();
				this.gameStage.nextTurn();
			}
			catch(e){
				//todo think about message for player
			}
		}
	};
	
	let figuresInCell = this.battlefield.whatAreThere(point);
	
	if(figuresInCell == null || figuresInCell.length == 0){
		tryMoveSelected.call(this);
	}
	else if(figuresInCell.length == 1){
		let figure = figuresInCell[0];
		let playerId = this.gameStage.getCurrentPlayer();
		if(playerId == figure.owner){
			let selectedPoint = this.playerInterfaceModel.getSelected();
			if(selectedPoint != null && selectedPoint.isEqual(point)){
				this.playerInterfaceModel.clear();
			}
			else{
				this.playerInterfaceModel.setSelected(point);
			}
		}
		else{
			tryMoveSelected.call(this);
		}
	}
	else{
		//todo error
		//debug
		throw "More than one figure in cell";
	}	
};


function BattlefieldView(){
	this.screen = document.getElementById("screen");
	this.chessFieldNode = null;
	// this.onCellClick = function(point){};
	this.onCellClick = new MyEvent();
	this.battlefield = null;
	this.figureElements = new Map();
	this.modifiedCells = [];
}
BattlefieldView.defaultCellClass = "cell";
BattlefieldView.prototype.render = function(){
	this.renderField();
	this.renderFigures();
};
BattlefieldView.prototype.renderField = function(){
	
	while(this.screen.firstChild){
		this.screen.removeChild(this.screen.firstChild);
	}
	
	var chessFieldNode = document.createElement("div");
	chessFieldNode.className = "chessField";
	
	for( var y = 0; y < 8; y++ ){
		var rowNode = document.createElement("div");
		rowNode.className = "row";
		chessFieldNode.appendChild(rowNode);
		for( var x = 0; x < 8; x++ ){
			var cellNode = document.createElement("div");
			cellNode.className = BattlefieldView.defaultCellClass;
			cellNode.id = this.getIdByPoint(new PlacePoint(x,y));
			var _this = this;
			cellNode.onclick = function(e){
				_this.onCellClick.raise(_this.getPointById(this.id));
			};
			var rectNode = document.createElement("div");
			cellNode.appendChild(rectNode);
			rowNode.appendChild(cellNode);
		}
	}
	
	this.chessFieldNode = chessFieldNode;
	this.screen.appendChild(chessFieldNode);
	
};
BattlefieldView.prototype.renderFigures = function(){
	this.figureElements.clear();
	for(var figure of this.battlefield.figures){
		var figureNode = document.createElement("div");
		figureNode.className = "figure";
		
		switch(figure.name){
			case "king":
				figureNode.textContent = "K";
				break;				
		}
		
		switch(figure.owner){
			case 1:
				figureNode.className += " white";
				break;
			case 2:
				figureNode.className += " black";
				break;
		}
		
		this.setFigureElementPlace( figureNode, figure );
		this.figureElements.set(figure, figureNode);
		this.screen.appendChild(figureNode);
		figure.change.addHandler( this, this.onFigureChange );
		
	}
};
BattlefieldView.prototype.setFigureElementPlace = function(figureNode, figureModel){
	
	var cellId = this.getIdByPoint(figureModel.place);
	var cellNode = document.getElementById(cellId);
	
	if(cellNode != null){
		
		var offset = this.getOffset(cellNode);
		figureNode.style.top = offset.top;
		figureNode.style.left = offset.left;
	
	}
	else{
		//todo error
	}
};
BattlefieldView.prototype.getOffset = function( elem ) {
    var _x = 0;
    var _y = 0;
	var iterElem = elem;
    while( iterElem && iterElem != this.screen ) {
        _x += iterElem.offsetLeft - iterElem.scrollLeft;
        _y += iterElem.offsetTop - iterElem.scrollTop;
        iterElem = iterElem.offsetParent;
    }
    return { top: _y, left: _x };
};
BattlefieldView.prototype.getPointById = function(id){
	var idParts = id.split( "_" );
	return new PlacePoint(parseInt(idParts[1],10), parseInt(idParts[2],10));
};
BattlefieldView.prototype.getIdByPoint = function(point){
	return "cell_" + point.x.toString() + "_" + point.y.toString();
};
BattlefieldView.prototype.onUpdate = function(){
};
BattlefieldView.prototype.open = function(){
	this.render();
};
BattlefieldView.prototype.onFigureChange = function(args){
	if( args.action == "move" ){
		var figureNode = this.figureElements.get( args.object );
		this.setFigureElementPlace( figureNode, args.object );	
	}
	if( args.action == "kill" ){
		var figureNode = this.figureElements.get( args.object );
		figureNode.remove();
		this.figureElements.delete( args.object );
	}
};
BattlefieldView.prototype.onFigureSelect = function(selectedPoint){
	var figures = this.battlefield.whatAreThere(selectedPoint);
	if(figures != null && figures.length == 1){
		var actions = figures[0].getAvailableActions();
		for(var action of actions){
			var cellNode = document.getElementById(this.getIdByPoint(action.point));
			switch( action.type ){
				case "self":
					cellNode.className += " selected";
					break;
				case "kill":
					cellNode.className += " kill";
					break;
				case "move":
					cellNode.className += " move";
					break;
			}
			this.modifiedCells.push(cellNode);
		}
	}
};
BattlefieldView.prototype.onFigureDeselect = function(args){
	for(var cellNode of this.modifiedCells){
		cellNode.className = BattlefieldView.defaultCellClass;
	}
	this.modifiedCells.length = 0;
};


function PlayerInterfaceModel(){
	this.eventDeselect = new MyEvent();
	this.eventSelect = new MyEvent();
	this.selectedObject = null;
}
PlayerInterfaceModel.prototype.setSelected = function(obj){
	if(this.selectedObject != null){
		this.eventDeselect.raise(this.selectedObject);
	}
	this.selectedObject = obj;
	if(this.selectedObject != null){
		this.eventSelect.raise(this.selectedObject);
	}	
};
PlayerInterfaceModel.prototype.getSelected = function(){
	return this.selectedObject;
};
PlayerInterfaceModel.prototype.clear = function(){
	if(this.selectedObject != null){
		this.eventDeselect.raise(this.selectedObject);
		this.selectedObject = null;
	}
};
