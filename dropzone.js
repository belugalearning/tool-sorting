require.config({
    paths: {}
});

define(['cocos2d'], function (cc) {
    'use strict';

    var DropZone = cc.Sprite.extend({

        ctor: function() {
            this._super();
        },

        isPointInside:function (point) {
            var bBox = this.getBoundingBox();
            return cc.Rect.CCRectContainsPoint(bBox, point);
        }

    });

    return DropZone;

});
