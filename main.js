require.config({
    paths: {
        'dropzone': '../../tools/sorting/dropzone',
        'draggable': '../../tools/sorting/draggable'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'toollayer', 'dropzone', 'draggable'], function (exports, cc, QLayer, ToolLayer, DropZone, Draggable) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var BACKGROUND_Z = 0;
    var DROPZONE_Z = 1;
    var DRAGGABLE_Z = 2;

    var Tool = ToolLayer.extend({

        _windowSize: undefined,
        _background: undefined,
        _backgroundLayer: undefined,

        init: function () {
            var self = this;

            this._super();

            this.setTouchEnabled(true);

            this._windowSize = cc.Director.getInstance().getWinSize();

            cc.Director.getInstance().setDisplayStats(false);

            this.setBackground(s_deep_water_background);

            this.addDropZone({x:300, y:100}, [{x:10, y:10}, {x:10, y:150}, {x:420, y:150}, {x:420, y:10}], s_digital_background);
            this.addDropZone({x:300, y:500}, [{x:10, y:10}, {x:10, y:150}, {x:420, y:150}, {x:420, y:10}], s_digital_background);

            this.addDraggable(s_add_pin_button);

            return this;
        },

        setBackground: function (resource) {
            var hasBg = true;
            if (_.isUndefined(this._background)) {
                this._backgroundLayer = cc.Layer.create();
                this._background = new cc.Sprite();
                hasBg = false;
            }
            this._background.initWithFile(resource);
            this._background.setPosition(this._windowSize.width/2, this._windowSize.height/2);
            this._backgroundLayer.addChild(this._background);
            if (!hasBg) {
                this.addChild(this._backgroundLayer, BACKGROUND_Z);
            }
        },

        _draggableCounter: 0,
        addDraggable: function (resource) {
            var self = this; 
            var clc = cc.Layer.create();
            var dg = new Draggable();
            dg.initWithFile(resource);
            dg.setPosition(this._windowSize.width / 2, this._windowSize.height / 2);
            dg.onMoved(function (position, draggable) {
                var dzs = self.getControls(DROPZONE_PREFIX);
                _.each(dzs, function(dz) {
                    if (dz.isPointInsideArea(position)) {
                        dz.showArea();
                    } else {
                        dz.hideArea();
                    }
                });
            });
            dg.onMoveEnded(function (position, draggable) {
                var dzs = self.getControls(DROPZONE_PREFIX);
                _.each(dzs, function(dz) {
                    if (dz.isPointInside(position)) {
                        dz.findPositionFor(this);
                    }
                });
            });
            clc.addChild(dg);
            this.addChild(clc, DRAGGABLE_Z);
            this.registerControl(DRAGGABLE_PREFIX + this._draggableCounter, dg);
            this._draggableCounter++;
        },

        _dropzoneCounter: 0,
        addDropZone: function (position, points, bgResource) {
            var clc = cc.Layer.create();
            var dz = new DropZone();
            if (_.isUndefined(bgResource)) {
                dz.init();
            } else {
                dz.initWithFile(bgResource);
            }
            dz.setPosition(position.x, position.y);
            dz.setPoints(points);
            clc.addChild(dz);
            this.registerControl(DROPZONE_PREFIX + this._dropzoneCounter, dz);
            this.addChild(clc, DROPZONE_Z);
            this._dropzoneCounter++;
        },

        getState: function () {
            throw {name : "NotImplementedError", message : "This needs implementing"};
        },

        setQuestion: function (question) {
            this._super();
        }
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
