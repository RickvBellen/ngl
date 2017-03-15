/**
 * @file Viewer Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Matrix4, Quaternion } from "../../lib/three.es6.js";


/**
 * Scene orientation matrix, a 4x4 transformation matrix with rotation part
 * used for scene rotation, scale part for scene camera distance and
 * position part for scene translation
 * @typedef {Matrix4} OrientationMatrix - orientation matrix
 */


const tmpQ = new Quaternion();
const tmpP = new Vector3();
const tmpS = new Vector3();

const tmpScaleVector = new Vector3();
const tmpRotateMatrix = new Matrix4();
const tmpRotateVector = new Vector3();
const tmpCenterVector = new Vector3();
const tmpAlignMatrix = new Matrix4();

const negateVector = new Vector3( -1, -1, -1 );


class ViewerControls{

    /**
     * create viewer controls
     * @param  {Stage} stage - the stage object
     */
    constructor( stage ){

        this.stage = stage;
        this.viewer = stage.viewer;

    }

    /**
     * scene center position
     * @member
     * @readOnly
     * @type {Vector3}
     */
    get position(){

        return this.viewer.translationGroup.position;

    }

    /**
     * scene rotation
     * @member
     * @readOnly
     * @type {Quaternion}
     */
    get rotation(){

        return this.viewer.rotationGroup.quaternion;

    }

    /**
     * set scene orientation
     * @param {OrientationMatrix} orientation - scene orientation
     * @return {undefined}
     */
    setOrientation( orientation ){

        orientation.decompose( tmpP, tmpQ, tmpS )

        this.viewer.rotationGroup.setRotationFromQuaternion( tmpQ );
        this.viewer.translationGroup.position.copy( tmpP );
        this.viewer.camera.position.z = -tmpS.z;

        this.viewer.requestRender();

    }

    /**
     * get scene orientation
     * @param {Matrix4} optionalTarget - pre-allocated target matrix
     * @return {OrientationMatrix} scene orientation
     */
    getOrientation( optionalTarget ){

        const m = optionalTarget || new Matrix4();

        m.copy( this.viewer.rotationGroup.matrix );
        const z = -this.viewer.camera.position.z;
        m.scale( tmpScaleVector.set( z, z, z ) );
        m.setPosition( this.viewer.translationGroup.position );

        return m;

    }

    /**
     * translate scene
     * @param  {Vector3} vector - translation vector
     * @return {undefined}
     */
    translate( vector ){

        this.viewer.translationGroup.position.add( vector );
        this.viewer.requestRender();

    }

    /**
     * center scene
     * @param  {Vector3} position - center position
     * @return {undefined}
     */
    center( position ){

        this.viewer.translationGroup.position.copy( position ).negate();
        this.viewer.requestRender();

    }

    /**
     * zoom scene
     * @param  {Number} delta - zoom change
     * @return {undefined}
     */
    zoom( delta ){

        this.distance( this.viewer.camera.position.z * ( 1 - delta ) );

    }

    /**
     * camera distance
     * @param  {Number} z - distance
     * @return {undefined}
     */
    distance( z ){

        this.viewer.camera.position.z = z;
        this.viewer.updateZoom();
        this.viewer.requestRender();

    }

    /**
     * spin scene on axis
     * @param  {Vector3} axis - rotation axis
     * @param  {Number} angle - amount to spin
     * @return {undefined}
     */
    spin( axis, angle ){

        tmpRotateMatrix.getInverse( this.viewer.rotationGroup.matrix );
        tmpRotateVector.copy( axis ).applyMatrix4( tmpRotateMatrix );

        this.viewer.rotationGroup.rotateOnAxis( tmpRotateVector, angle );
        this.viewer.requestRender();

    }

    /**
     * align scene to basis matrix
     * @param  {Matrix4} basis - basis matrix
     * @return {undefined}
     */
    align( basis ){

        tmpAlignMatrix.getInverse( basis );
        if( tmpAlignMatrix.determinant() < 0 ){
            tmpAlignMatrix.scale( negateVector );
        }

        this.viewer.rotationGroup.setRotationFromMatrix( tmpAlignMatrix );
        this.viewer.requestRender();

    }

    /**
     * apply rotation matrix to scene
     * @param  {Matrix4} matrix - rotation matrix
     * @return {undefined}
     */
    applyMatrix( matrix ){

        this.viewer.rotationGroup.applyMatrix( matrix );
        this.viewer.requestRender();

    }

    /**
     * auto-center scene
     * @return {undefined}
     */
    centerScene(){

        if( !this.viewer.boundingBox.isEmpty() ){
            this.center( this.viewer.boundingBox.center( tmpCenterVector ) );
        }

    }

    /**
     * auto-zoom scene
     * @return {undefined}
     */
    zoomScene(){

        this.distance( -this.stage.getOptimalDistance() );

    }

    /**
     * apply scene center-view
     * @param  {Boolean} zoom - flag to indicate auto-zoom
     * @param  {Vector3} position - center position
     * @return {undefined}
     */
    centerView( zoom, position ){

        if( position === undefined ){
            this.centerScene();
        }else{
            this.center( position );
        }
        if( zoom ){
            this.zoomScene();
        }

    }

    /**
     * apply scene align-view
     * @param  {Matrix4} basis - basis matrix
     * @param  {Vector3} position - center position
     * @param  {Boolean} zoom - flag to indicate auto-zoom
     * @return {undefined}
     */
    alignView( basis, position, zoom ){

        this.align( basis );
        this.centerView( zoom, position );

    }

}


export default ViewerControls;
