require.config({
    paths: {
        'dropzone': '../../tools/sorting/dropzone',
        'draggable': '../../tools/sorting/draggable',
        'draggableLayer': '../../tools/sorting/draggableLayer'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'toollayer', 'dropzone', 'draggable', 'draggableLayer'], function (exports, cc, QLayer, ToolLayer, DropZone, Draggable, DraggableLayer) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var BACKGROUND_Z = 0;
    var DROPZONE_Z = 1;
    var DRAGGABLE_Z = 2;

    var BAR_CHART = 'BAR_CHART';
    var VENN_DIAGRAM = 'VENN_DIAGRAM';

    window.toolTag = 'sorting';
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

            this.setQuestion({ type: VENN_DIAGRAM, toolConfig: {} });

            return this;
        },

        setBackground: function (resource) {
            if (_.isUndefined(this._background)) {
                this._backgroundLayer = cc.Layer.create();
                this.addChild(this._backgroundLayer, BACKGROUND_Z);
                this._background = new cc.Sprite();
            }
            this._background.initWithFile(resource);
            this._background.setPosition(this._windowSize.width/2, this._windowSize.height/2);
            this._backgroundLayer.addChild(this._background);
        },

        _draggableCounter: 0,
        _draggableLayer: undefined,
        _prevDraggable: undefined,
        addDraggable: function (position, resource) {
            var self = this;
            if (_.isUndefined(this._draggableLayer)) {
                this._draggableLayer = DraggableLayer.create();
                this.addChild(this._draggableLayer, DRAGGABLE_Z);
            }
            var dg = new Draggable();
            dg.tag = 'dg-' + this._draggableCounter;
            dg.initWithFile(resource);
            dg.setPosition(position.x, position.y);
            dg.onMoved(function (position, draggable) {
                var dzs = self.getControls(DROPZONE_PREFIX);
                self._draggableLayer.reorderChild(draggable, self._draggableCounter);
                self._draggableLayer.sortAllChildren();
                self._draggableLayer.reshuffleTouchHandlers();
                _.each(dzs, function(dz) {
                    if (dz.isPointInsideArea(position)) {
                        dz.showArea();
                    } else {
                        dz.hideArea();
                    }
                });
                if (self._prevDraggable !== draggable.tag) {
                    self._draggableCounter++;
                }
                self._prevDraggable = draggable.tag;
            });
            dg.onMoveEnded(function (position, draggable) {
                var dzs = self.getControls(DROPZONE_PREFIX);
                var inclusive = [];
                var exclusive = [];
                _.each(dzs, function(dz) {
                    if (dz.isPointInsideArea(position)) {
                        dz.findPositionFor(draggable);
                        inclusive.push(dz);
                    } else {
                        exclusive.push(dz);
                    }
                    dz.hideArea();
                });
                // check to see if it's allowed in this position
                // if (!bl.expression.valid(dg, inclusive, exclusive)) {
                //     dg.returnToLastPosition();
                // }
            });
            this._draggableLayer.addChild(dg);
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
            this._super(question);

            if (question.type === BAR_CHART) {

                this.setBackground(window.bl.getResource('barchart_base'));
                
                for (var i = 4; i >= 0; i--) {
                    this.addDropZone({x:140 + (i * 155), y:145}, [{x:0, y:0}, {x:0, y:600}, {x:120, y:600}, {x:120, y:0}]);
                }

                for (var i = 10 - 1; i >= 0; i--) {
                    var card = 'cards_lion_card';
                    if (i % 7 === 1) {
                        card = 'cards_scorpion_card';
                    } else if (i % 4 === 1) {
                        card = 'cards_rabbit_card';
                    } else if (i % 5 === 1) {
                        card = 'cards_giraffe_card';
                    } else if (i % 3 === 1) {
                        card = 'cards_pig_card';
                    }
                    this.addDraggable({x:510, y:60}, window.bl.getResource(card));
                }

            } else if (question.type === VENN_DIAGRAM) {

                this.setBackground(window.bl.getResource('venn_base'));
                
                var pos = cc.p(205, 108);
                this.addDropZone(pos, cc.DrawNode.generateCircle(pos, 175));

                pos = cc.p(295, 108);
                this.addDropZone(pos, cc.DrawNode.generateCircle(pos, 175));

                pos = cc.p(250, 183);
                this.addDropZone(pos, cc.DrawNode.generateCircle(pos, 175));
                

                for (var i = 10 - 1; i >= 0; i--) {
                    var card = 'cards_lion_card';
                    if (i % 7 === 1) {
                        card = 'cards_scorpion_card';
                    } else if (i % 4 === 1) {
                        card = 'cards_rabbit_card';
                    } else if (i % 5 === 1) {
                        card = 'cards_giraffe_card';
                    } else if (i % 3 === 1) {
                        card = 'cards_pig_card';
                    }
                    this.addDraggable({x:510, y:60}, window.bl.getResource(card));
                }
            }
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
