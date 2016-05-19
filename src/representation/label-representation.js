/**
 * @file Label Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Browser } from "../globals.js";
import LabelFactory from "../utils/label-factory.js";
import StructureRepresentation from "./structure-representation.js";
import TextBuffer from "../buffer/text-buffer.js";


function LabelRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

LabelRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: LabelRepresentation,

    type: "label",

    parameters: Object.assign( {

        labelType: {
            type: "select", options: LabelFactory.types, rebuild: true
        },
        fontFamily: {
            type: "select", options: {
                "sans-serif": "sans-serif",
                "monospace": "monospace",
                "serif": "serif"
            },
            buffer: true
        },
        fontStyle: {
            type: "select", options: {
                "normal": "normal",
                "italic": "italic"
            },
            buffer: true
        },
        fontWeight: {
            type: "select", options: {
                "normal": "normal",
                "bold": "bold"
            },
            buffer: true
        },
        sdf: {
            type: "boolean", buffer: true
        },
        xOffset: {
            type: "number", precision: 1, max: 20, min: -20, buffer: true
        },
        yOffset: {
            type: "number", precision: 1, max: 20, min: -20, buffer: true
        },
        zOffset: {
            type: "number", precision: 1, max: 20, min: -20, buffer: true
        },

    }, StructureRepresentation.prototype.parameters, {

        side: null,
        flatShaded: null,
        wireframe: null,
        linewidth: null,

        roughness: null,
        metalness: null,
        diffuse: null,

    } ),

    init: function( params ){

        var p = params || {};

        this.labelType = p.labelType || "res";
        this.labelText = p.labelText || {};
        this.fontFamily = p.fontFamily || "sans-serif";
        this.fontStyle = p.fontStyle || "normal";
        this.fontWeight = p.fontWeight || "bold";
        this.sdf = p.sdf !== undefined ? p.sdf : Browser !== "Firefox";  // FIXME
        this.xOffset = p.xOffset !== undefined ? p.xOffset : 0.0;
        this.yOffset = p.yOffset !== undefined ? p.yOffset : 0.0;
        this.zOffset = p.zOffset !== undefined ? p.zOffset : 0.5;

        StructureRepresentation.prototype.init.call( this, p );

    },

    createData: function( sview ){

        var what = { position: true, color: true, radius: true };
        var atomData = sview.getAtomData( this.getAtomParams( what ) );

        var text = [];
        var labelFactory = new LabelFactory(
            this.labelType, this.labelText
        );
        sview.eachSelectedAtom( function( ap ){
            text.push( labelFactory.atomLabel( ap ) );
        } );

        var textBuffer = new TextBuffer(
            atomData.position,
            atomData.radius,
            atomData.color,
            text,
            this.getBufferParams( {
                fontFamily: this.fontFamily,
                fontStyle: this.fontStyle,
                fontWeight: this.fontWeight,
                sdf: this.sdf,
                xOffset: this.xOffset,
                yOffset: this.yOffset,
                zOffset: this.zOffset
            } )
        );

        return {
            bufferList: [ textBuffer ]
        };

    },

    updateData: function( what, data ){

        var atomData = data.sview.getAtomData( this.getAtomParams( what ) );
        var textData = {};

        if( !what || what.position ){
            textData.position = atomData.position;
        }

        if( !what || what.radius ){
            textData.size = atomData.radius;
        }

        if( !what || what.color ){
            textData.color = atomData.color;
        }

        data.bufferList[ 0 ].setAttributes( textData );

    }

} );


export default LabelRepresentation;
