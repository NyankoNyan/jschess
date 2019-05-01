"use strict";

function PlacePoint(x,y){
	this.x = x;
	this.y = y;
}
PlacePoint.prototype.copy = function(placePoint){
	this.x = placePoint.x;
	this.y = placePoint.y;
}
PlacePoint.prototype.isEqual = function(placePoint){
	return this.x == placePoint.x && this.y == placePoint.y;
}


function MyEvent(){
	this.handlers = [];
}
MyEvent.prototype.addHandler = function( obj, method ){
	this.handlers.push( { obj : obj, method : method } );
};
MyEvent.prototype.raise = function(args){
	for( var handler of this.handlers ){
		handler.method.call( handler.obj, args );
	}
};