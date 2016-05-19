/**
 * @file Hyperball Stick Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { calculateCenterArray } from "../math/array-utils.js";
import BoxBuffer from "./box-buffer.js";


function HyperballStickImpostorBuffer( position1, position2, color, color2, radius1, radius2, pickingColor, pickingColor2, params ){

    var p = params || {};

    var shrink = p.shrink !== undefined ? p.shrink : 0.14;

    this.impostor = true;
    this.count = position1.length / 3;
    this.vertexShader = "HyperballStickImpostor.vert";
    this.fragmentShader = "HyperballStickImpostor.frag";

    BoxBuffer.call( this, p );

    var matrix = new THREE.Matrix4();

    function matrixCalc( object, camera ){

        var u = object.material.uniforms;

        if( u.modelViewMatrixInverse ){
            u.modelViewMatrixInverse.value.getInverse(
                object.modelViewMatrix
            );
        }

        if( u.modelViewMatrixInverseTranspose ){
            if( u.modelViewMatrixInverse ){
                u.modelViewMatrixInverseTranspose.value.copy(
                    u.modelViewMatrixInverse.value
                ).transpose();
            }else{
                u.modelViewMatrixInverseTranspose.value
                    .getInverse( object.modelViewMatrix )
                    .transpose();
            }
        }

        if( u.modelViewProjectionMatrix ){
            u.modelViewProjectionMatrix.value.multiplyMatrices(
                camera.projectionMatrix, object.modelViewMatrix
            );
        }

        if( u.modelViewProjectionMatrixInverse ){
            if( u.modelViewProjectionMatrix ){
                matrix.copy(
                    u.modelViewProjectionMatrix.value
                );
                u.modelViewProjectionMatrixInverse.value.getInverse(
                    matrix
                );
            }else{
                matrix.multiplyMatrices(
                    camera.projectionMatrix, object.modelViewMatrix
                );
                u.modelViewProjectionMatrixInverse.value.getInverse(
                    matrix
                );
            }
        }

    }

    var modelViewProjectionMatrix = new THREE.Uniform( new THREE.Matrix4() )
        .onUpdate( matrixCalc );
    var modelViewProjectionMatrixInverse = new THREE.Uniform( new THREE.Matrix4() )
        .onUpdate( matrixCalc );
    var modelViewMatrixInverseTranspose = new THREE.Uniform( new THREE.Matrix4() )
        .onUpdate( matrixCalc );

    this.addUniforms( {
        "modelViewProjectionMatrix": modelViewProjectionMatrix,
        "modelViewProjectionMatrixInverse": modelViewProjectionMatrixInverse,
        "modelViewMatrixInverseTranspose": modelViewMatrixInverseTranspose,
        "shrink": { value: shrink },
    } );

    this.addAttributes( {
        "color": { type: "c", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
        "radius2": { type: "f", value: null },
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
    } );

    this.setAttributes( {
        "color": color,
        "color2": color2,
        "radius": radius1,
        "radius2": radius2,
        "position1": position1,
        "position2": position2,

        "position": calculateCenterArray( position1, position2 ),
    } );

    if( pickingColor ){

        this.addAttributes( {
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        } );

        this.setAttributes( {
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        } );

        this.pickable = true;

    }

    this.makeMapping();

}

HyperballStickImpostorBuffer.prototype = Object.assign( Object.create(

    BoxBuffer.prototype ), {

    constructor: HyperballStickImpostorBuffer,

    parameters: Object.assign( {

        shrink: { uniform: true }

    }, BoxBuffer.prototype.parameters );

} );


export default HyperballStickImpostorBuffer;
