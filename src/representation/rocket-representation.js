/**
 * @file Rocket Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import StructureRepresentation from "./structure-representation.js";
import Helixbundle from "../geometry/helixbundle.js";
import CylinderBuffer from "../buffer/cylinder-buffer.js";


function RocketRepresentation( structure, viewer, params ){

    this.helixbundleList = [];

    StructureRepresentation.call( this, structure, viewer, params );

}

RocketRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: RocketRepresentation,

    type: "rocket",

    parameters: Object.assign( {

        localAngle: {
            type: "integer", max: 180, min: 0, rebuild: true
        },
        centerDist: {
            type: "number", precision: 1, max: 10, min: 0, rebuild: true
        },
        ssBorder: {
            type: "boolean", rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: "impostor"
        },
        disableImpostor: {
            type: "boolean", rebuild: true
        }

    }, StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.colorScheme = p.colorScheme || "sstruc";
        p.radius = p.radius || 1.5;
        p.scale = p.scale || 1.0;

        if( p.quality === "low" ){
            this.radiusSegments = 5;
        }else if( p.quality === "medium" ){
            this.radiusSegments = 10;
        }else if( p.quality === "high" ){
            this.radiusSegments = 20;
        }else{
            this.radiusSegments = p.radiusSegments !== undefined ? p.radiusSegments : 10;
        }
        this.disableImpostor = p.disableImpostor || false;

        this.localAngle = p.localAngle || 30;
        this.centerDist = p.centerDist || 2.5;
        this.ssBorder = p.ssBorder === undefined ? false : p.ssBorder;

        StructureRepresentation.prototype.init.call( this, p );

    },

    createData: function( sview ){

        var length = 0;
        var axisList = [];
        var helixbundleList = [];

        this.structure.eachPolymer( function( polymer ){

            if( polymer.residueCount < 4 || polymer.isNucleic() ) return;

            var helixbundle = new Helixbundle( polymer );
            var axis = helixbundle.getAxis(
                this.localAngle, this.centerDist, this.ssBorder,
                this.getColorParams(), this.radius, this.scale
            );

            length += axis.size.length;
            axisList.push( axis );
            helixbundleList.push( helixbundle );

        }.bind( this ), sview.getSelection() );

        var axisData = {
            begin: new Float32Array( length * 3 ),
            end: new Float32Array( length * 3 ),
            size: new Float32Array( length ),
            color: new Float32Array( length * 3 ),
            pickingColor: new Float32Array( length * 3 ),
        };

        var offset = 0;

        axisList.forEach( function( axis ){
            axisData.begin.set( axis.begin, offset * 3 );
            axisData.end.set( axis.end, offset * 3 );
            axisData.size.set( axis.size, offset );
            axisData.color.set( axis.color, offset * 3 );
            axisData.pickingColor.set( axis.pickingColor, offset * 3 );
            offset += axis.size.length;
        } );

        var cylinderBuffer = new CylinderBuffer(
            axisData.begin,
            axisData.end,
            axisData.color,
            axisData.color,
            axisData.size,
            axisData.pickingColor,
            axisData.pickingColor,
            this.getBufferParams( {
                shift: 0,
                cap: true,
                radiusSegments: this.radiusSegments,
                disableImpostor: this.disableImpostor,
                dullInterior: true
            } )
        );

        return {
            bufferList: [ cylinderBuffer ],
            axisList: axisList,
            helixbundleList: helixbundleList,
            axisData: axisData
        };

    },

    updateData: function( what, data ){

        what = what || {};

        if( what.position ){
            this.build();
            return;
        }

        var cylinderData = {};

        if( what.color || what.radius ){

            var offset = 0;

            data.helixbundleList.forEach( function( helixbundle ){

                var axis = helixbundle.getAxis(
                    this.localAngle, this.centerDist, this.ssBorder,
                    this.getColorParams(), this.radius, this.scale
                );
                if( what.color ){
                    data.axisData.color.set( axis.color, offset * 3 );
                }
                if( what.radius || what.scale ){
                    data.axisData.size.set( axis.size, offset );
                }
                offset += axis.size.length;

            }.bind( this ) );

            if( what.color ){
                cylinderData.color = data.axisData.color;
                cylinderData.color2 = data.axisData.color;
            }

            if( what.radius || what.scale ){
                cylinderData.radius = data.axisData.size;
            }

        }

        data.bufferList[ 0 ].setAttributes( cylinderData );

    }

} );


export default RocketRepresentation;
