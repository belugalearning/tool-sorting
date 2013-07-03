require.config({
    paths: {}
});

define(['exports', 'cocos2d', 'qlayer', 'toollayer'], function (exports, cc, QLayer, ToolLayer) {
    'use strict';

    var Tool = ToolLayer.extend({

        init: function () {

            this._super();

            this.setTouchEnabled(true);

            var size = cc.Director.getInstance().getWinSize();

            cc.Director.getInstance().setDisplayStats(false);

            return this;
        },


        emptyFunction:function() {}
    });

    ToolLayer.create = function () {
        var sg = new ToolLayer();
        if (sg && sg.init(cc.c4b(255, 255, 255, 255))) {
            return sg;
        }
        return null;
    };

    ToolLayer.scene = function () {
        var scene = cc.Scene.create();
        var layer = ToolLayer.create();
        scene.addChild(layer);

        scene.layer=layer;

        scene.ql = new QLayer();
        scene.ql.init();
        layer.addChild(scene.ql, 99);

        scene.update = function(dt) {
            this.layer.update(dt);
            this.ql.update(dt);
        };
        scene.scheduleUpdate();


        return scene;
    };

    exports.ToolLayer = Tool;

});
