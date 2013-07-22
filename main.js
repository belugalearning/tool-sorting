require.config({
    paths: {
        'dropzone': '../../tools/sorting/dropzone',
        'circulardropzone': '../../tools/sorting/circulardropzone',
        'draggable': '../../tools/sorting/draggable',
        'draggableLayer': '../../tools/sorting/draggableLayer'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'polygonclip', 'toollayer', 'stackedsprite', 'dropzone', 'draggable', 'draggableLayer', 'circulardropzone'], function (exports, cc, QLayer, Polygon, ToolLayer, StackedSprite, DropZone, Draggable, DraggableLayer, CircularDropZone) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var BACKGROUND_Z = 0;
    var DROPZONE_Z = 1;
    var DRAGGABLE_Z = 2;

    var BAR_CHART = 'BAR_CHART';
    var VENN_DIAGRAM = 'venn';

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

            this.setQuestion(
              contentService.question({
                tool:'sorting',
                toolMode:'venn',
                setCategory:'creature',
                numSets:3
              })
            )
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
        addDraggable: function (position, resource, definitionURL, onMoved, onMoveEnded) {
            var self = this;

            onMoved = onMoved || function (position, draggable) {
                var dzs = self.getControls(DROPZONE_PREFIX);
                self._draggableLayer.reorderChild(draggable, self._draggableCounter);
                self._draggableLayer.sortAllChildren();
                self._draggableLayer.reshuffleTouchHandlers();

                _.each(dzs, function(dz) {
                    // todo check center point of draggable, not touch point
                    //
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
            };

            onMoveEnded = onMoveEnded || function (position, draggable) {
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
                if (!self.checkValid(dg, inclusive, exclusive)) {
                    dg.returnToLastPosition();
                }
            };

            if (_.isUndefined(this._draggableLayer)) {
                this._draggableLayer = DraggableLayer.create();
                this.addChild(this._draggableLayer, DRAGGABLE_Z);
            }
            var dg = new Draggable();
            dg.definitionURL = definitionURL;
            dg.tag = 'dg-' + this._draggableCounter;
            if (typeof resource === 'object') {
                dg.initWithSprite(resource);
            } else {
                dg.initWithFile(resource);
            }
            dg.setPosition(position.x, position.y);
            dg.onMoved(onMoved);
            dg.onMoveEnded(onMoveEnded);
            this._draggableLayer.addChild(dg);
            this.registerControl(DRAGGABLE_PREFIX + this._draggableCounter, dg);
            this._draggableCounter++;
        },

        _dropzoneCounter: 0,
        _addDropZone: function (dz, position, shape, label, definitionURL, bgResource) {
            var clc = cc.Layer.create();
            dz.definitionURL = definitionURL;
            if (_.isUndefined(bgResource)) {
                dz.init();
            } else {
                dz.initWithFile(bgResource);
            }
            dz.setPosition(position.x, position.y);
            dz.setShape(shape);
            dz.setLabel(label);
            clc.addChild(dz);
            this.registerControl(DROPZONE_PREFIX + this._dropzoneCounter, dz);
            this.addChild(clc, DROPZONE_Z);
            this._dropzoneCounter++;
            return dz;
        },

        addDropZone: function (position, shape, label, definitionURL, bgResource) {
            var args = Array.prototype.slice.call(arguments);
            var dz = new DropZone();
            args.unshift(dz);
            return this._addDropZone.apply(this, args);
        },

        addCircularDropZone: function (position, shape, label, definitionURL, bgResource) {
            var dz = new CircularDropZone();
            var args = Array.prototype.slice.call(arguments);
            args.unshift(dz);
            return this._addDropZone.apply(this, args);
        },

        getState: function () {
            throw {name : "NotImplementedError", message : "This needs implementing"};
        },

        checkValid: function (dg, inclusive, exclusive) {

            var expression = ['<apply>'];

            expression.push('<and />');

            _.each(inclusive, function (dz) {
                expression.push('<apply><in />');
                expression.push('<csymbol definitionURL="' + dg.definitionURL + '" />');
                expression.push('<csymbol definitionURL="' + dz.definitionURL + '" />');
                expression.push('</apply>');
            });

            _.each(exclusive, function (dz) {
                expression.push('<apply><notin />');
                expression.push('<csymbol definitionURL="' + dg.definitionURL + '" />');
                expression.push('<csymbol definitionURL="' + dz.definitionURL + '" />');
                expression.push('</apply>');
            });

            expression.push('</apply>');

            console.log({
                symbols: this.question.symbols,
                expression: expression.join('')
            })


            return Math.random() > 0.5;

            // POST:

            // {
            //     symbols: same as from question,
            //     expression: construct the following
            //         <apply>
            //           <and/>
            //           <apply>
            //             <in/>
            //             <csymbol definitionURL="local://symbols/creatures/creature0" />
            //             <csymbol definitionURL="local://symbols/sets/set0" />
            //           </apply>
            //           <apply>
            //             <notin/>
            //             <csymbol definitionURL="local://symbols/creatures/creature0" />
            //             <csymbol definitionURL="local://symbols/sets/set1" />
            //           </apply>
            //           <apply>
            //             <notin/>
            //             <csymbol definitionURL="local://symbols/creatures/creature0" />
            //             <csymbol definitionURL="local://symbols/sets/set2" />
            //           </apply>
            //         </apply>
            // }

        },

        setQuestion: function (question) {
            var self = this;

            this._super(question);

            if (question.toolMode === BAR_CHART) {

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

            } else if (question.toolMode === VENN_DIAGRAM) {

                this.setBackground(window.bl.getResource('venn_base'));
                
                var circles = [
                    {
                        r: 175,
                        p: cc.p(245, 110),
                        label: question.symbols.sets.set0.label,
                        definitionURL: question.symbols.sets.set0.definitionURL
                    },
                    {
                        r: 175,
                        p: cc.p(428, 110),
                        label: question.symbols.sets.set1.label,
                        definitionURL: question.symbols.sets.set1.definitionURL
                    },
                    {
                        r: 175,
                        p: cc.p(335, 265),
                        label: question.symbols.sets.set2.label,
                        definitionURL: question.symbols.sets.set2.definitionURL
                    }
                ];

                _.each(circles, function (c1, i) {
                    var path1 = cc.DrawNode.generateCircle(cc.p(c1.r, c1.r), c1.r);
                    path1 = _.map(path1, function(p) {
                        return cc.p(p.x + c1.p.x, p.y + c1.p.y);
                    });
                    path1 = Polygon.fromCCPoints(path1);

                    // this is the start of working out all the segments
                    // _.each(circles, function (c2, j) {
                    //     if (i !== j) {

                    //         var path2 = cc.DrawNode.generateCircle(cc.p(c2.r, c2.r), c2.r);
                    //         // offset this path based on it's position
                    //         path2 = _.map(path2, function(p) {
                    //             return cc.p(p.x + c2.p.x, p.y + c2.p.y);
                    //         });
                    //         path2 = Polygon.fromCCPoints(path2);

                    //         path1 = path2.clip(path1, 'difference')[0];

                    //     }

                    // });

                    var path = Polygon.toCCPoints(path1.points);
                    path = _.map(path, function (p) {
                        return cc.p(p.x - c1.p.x, p.y - c1.p.y);
                    });
                    var dz = self.addCircularDropZone(c1.p, path, c1.label, c1.definitionURL);

                    if (i === 0) {
                        dz._label.setRotation(45);
                        dz._label.setPosition(cc.p(dz.getContentSize().width * 0.3, dz.getContentSize().height * 0.3));
                    } else if (i === 1) {
                        dz._label.setRotation(-45);
                        dz._label.setPosition(cc.p(dz.getContentSize().width * 0.7, dz.getContentSize().height * 0.3));
                    } else if (i === 2) {
                        dz._label.setPosition(cc.p(dz.getContentSize().width * 0.5, dz.getContentSize().height * 0.7));
                    }

                });

                _.each(question.symbols.set_members, function (creature, k) {
                    var sprite = new StackedSprite();

                    sprite.setup({ layers: creature.sprite });
                    self.addDraggable({x:510, y:60}, sprite, creature.definitionURL);
                });

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
