require.config({
    paths: {
        'dropzone': '../../tools/sorting/dropzone',
        'draggable': '../../tools/sorting/draggable'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'toollayer', 'dropzone', 'draggable'], function (exports, cc, QLayer, ToolLayer, DropZone, Draggable) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';

    var Tool = ToolLayer.extend({

        init: function () {

            this._super();

            this.setTouchEnabled(true);

            var size = cc.Director.getInstance().getWinSize();

            cc.Director.getInstance().setDisplayStats(false);

            var clc = cc.Layer.create();
            var background = new cc.Sprite();
            background.initWithFile(s_deep_water_background);
            background.setPosition(size.width/2, size.height/2);
            clc.addChild(background);
            this.addChild(clc,0);

            clc = cc.Layer.create();
            var dz = new DropZone();
            dz.initWithFile(s_digital_background);
            dz.setPosition(size.width / 2, size.height / 2);
            clc.addChild(dz);
            this.addChild(clc,0);

            clc = cc.Layer.create();
            var dg = new Draggable();
            dg.initWithFile(s_add_pin_button);
            dg.setPosition(size.width / 2, size.height / 2);
            dg.onMoved(function (position) {
                console.log(dz.isPointInside(position));
            });
            clc.addChild(dg);
            this.addChild(clc,0);
            this.registerControl(DRAGGABLE_PREFIX + 'one', dg);
            clc = cc.Layer.create();

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
