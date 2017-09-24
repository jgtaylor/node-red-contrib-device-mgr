"use strict";
var events = require( "events" );

// generates a valid uuid
function guid() {
	return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
		s4() + "-" + s4() + s4() + s4();
}

// produces 4 byte string
function s4() {
	return Math.floor( ( 1 + Math.random() ) * 0x10000 )
		.toString( 16 )
		.substring( 1 );
}
let dm = new events.EventEmitter();
let deviceManager = {
	devicesList: [],
	addDevice: ( devConfig ) => {
		if ( this.verifyDevice( devConfig ) ) {
			// maybe put subscribe stuff here...?
			if ( !devConfig.device ) {
				devConfig.device = guid();
			}
			this.log( "info", "Adding: " + devConfig.device );
			this.devicesList.push( devConfig );
			return true;
		}
		return false;
	},
	// verify a supplied configuration for a devicesConfig
	verifyDevice: ( devConfig ) => {
		let exists = this.devicesList.find( function ( sourceDev ) {
			return devConfig.device === sourceDev.device;
		} );
		// false means it exists, true: it's safe to insert.
		return exists ? false : true;
	},

	// delete a device from the deviceManager
	removeDevice: ( deviceID ) => {
		this.devicesList = this.devicesList.filter( function ( el ) {
			return el.device !== deviceID;
		} );
	},

	//query a device
	queryDevice: ( deviceID ) => {
		let d = this.devicesList.filter( ( el ) => {
			return el.device === deviceID;
		} );
		if ( d.length === 1 ) {
			return d[ 0 ];
		}
	}
};

module.exports = function ( RED, deviceManager ) {
	RED.nodes.registerType( "device-mgr",
		function ( config ) {
			RED.nodes.createNode( this, config );
			var node = this;
			var flow = node.context()
				.flow;
			if ( !flow.get( "deviceManager" ) ) {
				flow.set( "deviceManager", deviceManager );
			}
			/**
				"device": "dccbaa81-b2e4-46e4-a2f4-84d398dd86e3",
				"type": "virtual",
				"validCmds": [ "read", "readCont" ],
				"meta": {
					"name": "light",
					"metric": "light",
					"unit": "lux"
				}
			}, {
				"device": "828fbaa2-4f56-4cc5-99bf-57dcb5bd85f5",
				"type": "button",
				"validCmds": [ "on", "off", "getState" ],
				"meta": {
					"usage": "Mains Relay"
				}
			}, {
				"device": "c6d2a817-0c3a-4b6f-8478-cd81628a63f5",
				"type": "virtual",
				"validCmds": [ "read" ],
				"meta": {
					"keys": [ {
						"name": "rh",
						"metric": "humidity",
						"unit": "%"
					}, {
						"name": "temp",
						"metric": "temperature",
						"unit": "C",
						"validMax": 85,
						"validMin": -20
					} ],
					"deviceName": "DHT22"
				}
			} ] ];
 			*/
			node.on( "input", function ( msg ) {
				var node = this;
				var flow = node.context()
					.flow;
				var deviceManager = flow.get( "deviceManager" );
				console.log( deviceManager );
				let L = msg.payload[ 1 ];
				msg.payload.length = 0;
				L.forEach( function ( target ) {
					if ( deviceManager.addDevice( target ) ) {
						msg.payload.push( {
							action: "add",
							result: true,
							id: target.device
						} );
					} else {
						msg.payload.push( {
							action: "add",
							result: false,
							id: target.device
						} );
					}
				} );
				node.send( msg );
			} );
		}
	);
};
