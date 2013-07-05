require.config({
    paths: {}
});

define(['cocos2d'], function (cc) {
    'use strict';

    var DraggableLayer = cc.Layer.extend({

        ctor:function() {
            this._super();
        },

        // Manually change the priority of touch controls based on their zOrder
        reshuffleTouchHandlers: function () {
            
            cc.Director.getInstance().getTouchDispatcher()._targetedHandlers = _.sortBy(cc.Director.getInstance().getTouchDispatcher()._targetedHandlers,function (x) {
                return x._delegate._zOrder * -1;
            });

        }

    });

    DraggableLayer.create = function () {
        var ret = new DraggableLayer();
        if (ret && ret.init())
            return ret;
        return null;
    };

    return DraggableLayer;

});
