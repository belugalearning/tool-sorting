require.config({
    paths: {
        'dropzone': '../../tools/sorting/dropzone',
        'draggable': '../../tools/sorting/draggable',
        'draggableLayer': '../../tools/sorting/draggableLayer'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'polygonclip', 'toollayer', 'stackedsprite', 'dropzone', 'draggable', 'draggableLayer'], function (exports, cc, QLayer, Polygon, ToolLayer, StackedSprite, DropZone, Draggable, DraggableLayer) {
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

            this.setQuestion({
                tool: "sorting",
                mode: "venn",
                autoreject: true,
                symbols: {
                    lists: {
                        unclassified: {
                            definitionURL: "local://symbols/lists/unclassified",
                            mathml: "\
                                <list>\
                                    <members>\
                                        <csymbol definitionURL=%22local://symbols/creatures/creature0%22 />\
                                        <csymbol definitionURL=%22local://symbols/creatures/creature1%22 />\
                                        <csymbol definitionURL=%22local://symbols/creatures/creature2%22 />\
                                        <csymbol definitionURL=%22local://symbols/creatures/creature3%22 />\
                                    </members>/
                                </list>"
                        }
                    }
                    sets: {
                        set0: {
                            definitionURL: "local://symbols/sets/set0",
                            mathml: "\
                                <set>\
                                    <bvar><ci>x</ci></bvar>\
                                    <condition>\
                                        <apply>\
                                            <eq/>\
                                                <apply>\
                                                    <property/>\
                                                    <ci>x</ci>\
                                                    <key>colour</key>\
                                                </apply>\
                                                <string>e70000</string>\
                                            </eq>\
                                        </apply>\
                                    </condition>\
                                </set>",
                            label: "Red"
                        },
                        set1: {
                            definitionURL: "local://symbols/sets/set1",
                            mathml: "\
                                <set>\
                                    <bvar><ci>x</ci></bvar>\
                                    <condition>\
                                        <apply>\
                                            <eq/>\
                                                <apply>\
                                                    <property/>\
                                                    <ci>x</ci>\
                                                    <key>legs</key>\
                                                </apply>\
                                                <cn>3</cn>\
                                            </eq>\
                                        </apply>\
                                    </condition>\
                                </set>",
                            label: "3 Legs"
                        },
                        set2: {
                            definitionURL: "local://symbols/sets/set2",
                            mathml: "\
                                <set>\
                                    <bvar><ci>x</ci></bvar>\
                                    <condition>\
                                        <apply>\
                                            <eq/>\
                                                <apply>\
                                                    <property/>\
                                                    <ci>x</ci>\
                                                    <key>eyes</key>\
                                                </apply>\
                                                <cn>3</cn>\
                                            </eq>\
                                        </apply>\
                                    </condition>\
                                </set>",
                            label: "3 Eyes"
                        }
                    },
                    creatures: {
                        creature0: {
                            definitionURL: "local://symbols/creatures/creature0",
                            eyes: 3,
                            legs: 3,
                            colour: {
                                r: 231,
                                g: 0,
                                b: 0,
                                a: 255
                            },
                            horn: true,
                        },
                        creature1: {
                            definitionURL: "local://symbols/creatures/creature1",
                            eyes: 2,
                            legs: 2,
                            colour: {
                                r: 247,
                                g: 204,
                                b: 0,
                                a: 255
                            },
                            horn: false,
                        },
                        creature2: {
                            definitionURL: "local://symbols/creatures/creature2",
                            eyes: 3,
                            legs: 4,
                            colour: {
                                r: 0,
                                g: 170,
                                b: 234,
                                a: 255
                            },
                            horn: false,
                        },
                        creature3: {
                            definitionURL: "local://symbols/creatures/creature3",
                            eyes: 1,
                            legs: 3,
                            colour: {
                                r: 115,
                                g: 116,
                                b: 172,
                                a: 255
                            },
                            horn: true,
                        }
                    }
                },
                state: "\
                    <state>\
                        <csymbol definitionURL=%22local://symbols/lists/unclassified%22 />\
                        <csymbol definitionURL=%22local://symbols/sets/set0%22 />\
                        <csymbol definitionURL=%22local://symbols/sets/set1%22 />\
                        <csymbol definitionURL=%22local://symbols/sets/set2%22 />\
                    </state>",
                completionEvaluation: "\
                    <apply>\
                        <cardinality/>\
                        <csymbol definitionURL=%22local://lists/unclassified%22/>\
                        <cn>0</cn>\
                    </apply>"
            });

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
        addDraggable: function (position, resource, definitionURL) {
            var self = this;
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
            dg.onMoved(function (position, draggable) {
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
                if (!self.checkValid(dg, inclusive, exclusive)) {
                    dg.returnToLastPosition();
                }
            });
            this._draggableLayer.addChild(dg);
            this.registerControl(DRAGGABLE_PREFIX + this._draggableCounter, dg);
            this._draggableCounter++;
        },

        _dropzoneCounter: 0,
        addDropZone: function (position, shape, label, definitionURL, bgResource) {
            var clc = cc.Layer.create();
            var dz = new DropZone();
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

            return false;

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

            if (question.mode === BAR_CHART) {

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

            } else if (question.mode === VENN_DIAGRAM) {

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
                    self.addDropZone(c1.p, path, c1.label, c1.definitionURL);

                });

                _.each(question.symbols.creatures, function (creature, k) {
                    var sprite = new StackedSprite();
                    var layers = [
                        {
                            color: creature.colour,
                            width: 60,
                            height: 70,
                            position: {
                                x: 10,
                                y: 10
                            }
                        },
                        {
                            filename: 'mask_legs_' + creature.legs,
                            width: 86,
                            height: 83,
                            position: {
                                x: 42,
                                y: 42
                            }
                        },
                        {
                            filename: 'eyes_' + creature.eyes,
                            width: 86,
                            height: 83,
                            position: {
                                x: 42,
                                y: 42
                            }
                        }
                    ];
                    if (creature.horn) {
                        layers.push({
                            filename: 'horns',
                            width: 86,
                            height: 83,
                            position: {
                                x: 42,
                                y: 42
                            }
                        })
                    }
                    sprite.setup({ layers: layers });
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
