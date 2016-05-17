/**
 * @file Script Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Loader from "./loader.js";
import Script from "../script.js";


ScriptLoader = function( src, params ){

    Loader.call( this, src, params );

};

ScriptLoader.prototype = Object.assign( Object.create(

    Loader.prototype ), {

    constructor: ScriptLoader,

    _load: function( resolve, reject ){

        this.streamer.read( function(){

            var text = this.streamer.asText();
            var script = new Script( text, this.name, this.path );
            resolve( script );

        }.bind( this ) );

    }

} );


export default ScriptLoader;