module.exports = function ( RED ) {
		RED.nodes.registerType( "device-mgr", function deviceMgrNode( config ) {
				RED.nodes.createNode( this, config );
				var node = this;
				node.on( 'input', function ( msg ) {
						if ( !flow.get( "devicesConfig" ) ) {
							flow.set( "devicesConfig", [] );
						}

						var dc = flow.get( "devicesConfig" );
						var add = ( config ) => {
							console.log( "Adding: " + config.device );
							dc.push( config );
							flow.set( "devicesConfig", dc );
							return true;
						};
						let L = msg.payload[ 1 ];
						msg.payload.length = 0;
						L.forEach( function ( target ) {
							let exists = dc.find( function ( sEl ) {
								return target.device === sEl.device;
							} );

							if ( ( !exists ) || target.device !== exists.device ) {
								if ( add( target ) ) {
									msg.payload.push( {
										action: "add",
										result: true,
										id: target.device
									} );
								}
							} else {
								msg.payload.push( {
									action: "add",
									result: false,
									id: target.device
								} );
							}

						} );
						node.send( msg );
					}
				}
			);
		}
