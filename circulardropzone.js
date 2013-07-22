require.config({
    paths: {}
});

define(['cocos2d', 'bldrawnode', 'underscore', 'dropzone'], function (cc, BLDrawNode, _, DropZone) {
    'use strict';

    var CircularDropZone = DropZone.extend({

        findPositionFor: function (draggable) {
            // draggable.setPositionX(this.getPositionX() + 60);
            if (this._stackDraggables) {
                // set it's position
                // rotate an angle
                // update label count
            }
        }

    });

    return CircularDropZone;

});
