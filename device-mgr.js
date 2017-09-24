module.exports = function ( RED ) {
	"use strict";
	var util = require( "util" );
	var events = require( "events" );
	RED.nodes.registerType( "device-mgr",
		function ( config ) {
			RED.nodes.createNode( this, config );
			var node = this;
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

			// add a device to the deviceManager
			function addDevice( devConfig ) {
				if ( verifyDevice( devConfig ) ) {
					// maybe put subscribe stuff here...?
					if ( !devConfig.device ) {
						devConfig.device = guid();
					}
					node.log( "info", "Adding: " + devConfig.device );
					return node.deviceManager.devicesList.push( devConfig ) ? true : false;
				}
				return false;
			}

			// verify a supplied configuration for a devicesConfig
			function verifyDevice( devConfig ) {
				let exists = node.deviceManager.find( function ( sourceDev ) {
					return devConfig.device === sourceDev.device;
				} );
				return exists ? exists : false;
			}

			// delete a device from the deviceManager
			function removeDevice( deviceID ) {
				node.deviceManager.devicesList = node.deviceManager.devicesList.filter( function ( el ) {
					return el.device !== deviceID;
				} );
			}

			var flow = this.context()
				.flow;
			if ( !flow.get( "deviceManager" ) ) {
				let dm = {
					devicesList: [],
					addDevice: node.addDevice,
					removeDevice: node.removeDevice,
					verifyDevice: node.verifyDevice
				};
				util.inherits( dm, events.EventEmitter );
				flow.set( "deviceManager", dm );
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

			var deviceManager = flow.get( "deviceManager" );
			// currently no path to delete devices.
			node.on( "input", function ( msg ) {
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
