require.config({
    paths: {
        'dropzone': '../../tools/sorting/dropzone',
        'circulardropzone': '../../tools/sorting/circulardropzone',
        'splitdropzone': '../../tools/sorting/splitdropzone',
        'draggable': '../../tools/sorting/draggable',
        'draggableLayer': '../../tools/sorting/draggableLayer'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'polygonclip', 'toollayer', 'stackedsprite', 'dropzone', 'draggable', 'draggableLayer', 'circulardropzone', 'splitdropzone'], function (exports, cc, QLayer, Polygon, ToolLayer, StackedSprite, DropZone, Draggable, DraggableLayer, CircularDropZone, SplitDropZone) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var BACKGROUND_Z = 0;
    var DROPZONE_Z = 1;
    var DRAGGABLE_Z = 2;

    var BAR_CHART = 'bar';
    var VENN_DIAGRAM = 'venn';
    var TABLE_DIAGRAM = 'table';
    var BOXES_DIAGRAM = 'boxes';

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
              window.bl.contentService.question({
                tool:'sorting',
                toolMode:'venn',
                setCategory:'creature',
                numSets:3
              })
            )
            return this;
        },

        reset: function () {
            this._background = undefined;
            this._backgroundLayer = undefined;
            this._draggableCounter = 0;
            this._draggableLayer = undefined;
            this._prevDraggable = undefined;
            this._dropzoneCounter = 0;
            this._totalLabels = [];
            this._subTotalLabels = [];
            this._super();
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
                draggable.setRotation(0);
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
                if (!self.checkValid(draggable, inclusive, exclusive)) {
                    draggable.returnToLastPosition();
                } else {
                    draggable.setRotation(_.random(-10, 10));
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

        addSplitDropZone: function (position, shape, negationShape, label, negationLabel, definitionURL, bgResource) {
            var dz = new SplitDropZone();
            var clc = cc.Layer.create();
            dz.definitionURL = definitionURL;
            if (_.isUndefined(bgResource)) {
                dz.init();
            } else {
                dz.initWithFile(bgResource);
            }
            dz.setPosition(position.x, position.y);
            dz.setShape(shape);
            dz.setNegationShape(negationShape);
            dz.setLabel(label);
            dz.setNegationLabel(negationLabel);
            clc.addChild(dz);
            this.registerControl(DROPZONE_PREFIX + this._dropzoneCounter, dz);
            this.addChild(clc, DROPZONE_Z);
            this._dropzoneCounter++;
            return dz;
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


            return true;
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

        _totalLabels: [],
        _subTotalLabels: [],
        setQuestion: function (question) {
            var self = this;

            this._super(question);

            var setLength = 0, key;
            for (key in question.symbols.sets) {
                if (question.symbols.sets.hasOwnProperty(key)) setLength++;
            }

            var setMemberLength = 0, key;
            for (key in question.symbols.set_members) {
                if (question.symbols.set_members.hasOwnProperty(key)) setMemberLength++;
            }

            if (question.toolMode === BAR_CHART) {

                this.setBackground(window.bl.getResource('barchart_base'));
                
                for (var i = 0; i < setLength; i++) {
                    var dz = this.addDropZone({
                        x:140 + (i * 155), y:145},
                        [{x:0, y:0}, {x:0, y:600}, {x:120, y:600}, {x:120, y:0}],
                        question.symbols.sets['set' + i].label,
                        question.symbols.sets['set' + i].definitionURL);
                    dz._label.setPosition(60, -20);
                    dz._label.setFontSize(15);
                }

                var placed = 0;
                var colours = [cc.c4f(241/255,201/255,46/255,255/255), cc.c4f(45/255,211/255,43/255,255/255), cc.c4f(47/255,185/255,196/255,255/255), cc.c4f(226/255,68/255,46/255,255/255), cc.c4f(244/255,100/255,185/255,255/255)];
                _.each(question.symbols.set_members, function (creature, k) {
                    var sprite = new StackedSprite();
                    sprite.setup({ layers: creature.sprite });
                    self.addDraggable({x:510, y:60}, sprite, creature.definitionURL, undefined, function (position, draggable) {
                        var dzs = self.getControls(DROPZONE_PREFIX);
                        var inclusive = [];
                        var exclusive = [];
                        _.each(dzs, function(dz) {
                            if (dz.isPointInsideArea(position)) {
                                dz.findPositionFor(draggable);
                                inclusive.push(dz);
                                dz.placed = dz.placed || 0;
                                dz.placed++;
                            } else {
                                exclusive.push(dz);
                            }
                            dz.hideArea();
                        });
                        if (!self.checkValid(draggable, inclusive, exclusive)) {
                            draggable.returnToLastPosition();
                        } else {
                            placed++;
                            draggable.setRotation(_.random(-10, 10));
                            if (placed >= setMemberLength) {

                                var dgs = self.getControls(DRAGGABLE_PREFIX);
                                _.each(dgs, function(dg) {
                                    dg.setVisible(false);
                                });
                                var maxPlaced = _.max(dzs, function(dz) { return dz.placed }).placed;
                                _.each(dzs, function(dz, i) {
                                    dz.area.clear();
                                    console.log(colours[i])
                                    dz.area.drawPoly(bl.PolyRectMake(0, 2, 120, (dz.placed / maxPlaced) * 600), colours[i], 2, cc.c4f(0,0,0,1));
                                    dz.showArea();
                                });
                            }
                        }
                    });
                });

            } else if (question.toolMode === BOXES_DIAGRAM) {

                this.setBackground(window.bl.getResource('boxes_base'));

                _.each(question.symbols.set_members, function (creature, k) {
                    var sprite = new StackedSprite();
                    sprite.setup({ layers: creature.sprite });
                    self.addDraggable({x:510, y:60}, sprite, creature.definitionURL);
                });

            } else if (question.toolMode === TABLE_DIAGRAM) {

                this.setBackground(window.bl.getResource('table_base'));

                // setup dropzones

                var dz = this.addSplitDropZone(cc.p(370,205), bl.PolyRectMake(0,130,280,130), bl.PolyRectMake(0,0,280,130), question.symbols.sets.set0.label, question.symbols.sets.set0.negationLabel, question.symbols.sets.set0.definitionURL);
                dz._label.setPosition(-20, 195);
                dz._negationLabel.setPosition(-20, 65);

                dz = this.addSplitDropZone(cc.p(370,207), bl.PolyRectMake(0,0,140,255), bl.PolyRectMake(140,0,140,255), question.symbols.sets.set1.label, question.symbols.sets.set1.negationLabel, question.symbols.sets.set1.definitionURL);
                dz._label.setPosition(90, 280);
                dz._label.setRotation(-90);
                dz._label.setAnchorPoint(cc.p(0, 0));
                dz._negationLabel.setPosition(225, 280);
                dz._negationLabel.setRotation(-90);
                dz._negationLabel.setAnchorPoint(cc.p(0, 0));

                // add totals

                self._totalLabels[0] = cc.LabelTTF.create('0', "mikadoBold", 30);
                self._totalLabels[0].setPosition(cc.p(720, 400));
                self._totalLabels[0].setZOrder(500);
                self._totalLabels[0].setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(self._totalLabels[0]);

                self._totalLabels[1] = cc.LabelTTF.create('0', "mikadoBold", 30);
                self._totalLabels[1].setPosition(cc.p(720, 265));
                self._totalLabels[1].setZOrder(500);
                self._totalLabels[1].setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(self._totalLabels[1]);

                self._totalLabels[2] = cc.LabelTTF.create('0', "mikadoBold", 30);
                self._totalLabels[2].setPosition(cc.p(440, 150));
                self._totalLabels[2].setZOrder(500);
                self._totalLabels[2].setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(self._totalLabels[2]);

                self._totalLabels[3] = cc.LabelTTF.create('0', "mikadoBold", 30);
                self._totalLabels[3].setPosition(cc.p(580, 150));
                self._totalLabels[3].setZOrder(500);
                self._totalLabels[3].setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(self._totalLabels[3]);


                // add draggables

                _.each(question.symbols.set_members, function (creature, k) {
                    var sprite = new StackedSprite();
                    sprite.setup({ layers: creature.sprite });
                    self.addDraggable({x:510, y:60}, sprite, creature.definitionURL,
                        function onMoved (position, draggable) {
                            draggable.setRotation(0);
                            var dzs = self.getControls(DROPZONE_PREFIX);
                            self._draggableLayer.reorderChild(draggable, self._draggableCounter);
                            self._draggableLayer.sortAllChildren();
                            self._draggableLayer.reshuffleTouchHandlers();

                            _.each(dzs, function(dz) {
                                // todo check center point of draggable, not touch point
                                //
                                if (dz.isPointInsideArea(position)) {
                                    dz.showArea();
                                    dz.hideNegationArea();
                                } else {
                                    dz.hideArea();

                                    if (dz.isPointInsideNegationArea(position)) {
                                        dz.showNegationArea();
                                    } else {
                                        dz.hideNegationArea();
                                    }
                                }
                            });
                            if (self._prevDraggable !== draggable.tag) {
                                self._draggableCounter++;
                            }
                            self._prevDraggable = draggable.tag;
                        },
                        function onMoveEnded (position, draggable) {
                            var dzs = self.getControls(DROPZONE_PREFIX);
                            var inclusive = [];
                            var exclusive = [];
                            _.each(dzs, function(dz) {
                                if (dz.isPointInsideArea(position)) {
                                    inclusive.push(dz);
                                } else if (dz.isPointInsideNegationArea(position)) {
                                    exclusive.push(dz);
                                } 
                                dz.hideArea();
                                dz.hideNegationArea();
                            });
                            if (inclusive.length + exclusive.length < 2 || !self.checkValid(draggable, inclusive, exclusive)) {
                                draggable.returnToLastPosition();
                            } else {
                                var spots = [cc.p(440, 400), cc.p(580, 400), cc.p(580, 265), cc.p(440, 265)];
                                var distance = 9999999 * 99999999;
                                var index = 0;
                                _.each(spots, function (spot, i) {
                                    var x = Math.abs(position.x - spot.x);
                                    var y = Math.abs(position.y - spot.y);
                                    var distanceSq = Math.min(x * x + y * y, distance);
                                    if (distanceSq < distance) {
                                        distance = distanceSq;
                                        index = i;
                                    }
                                });

                                draggable.setPosition(spots[index]);
                                var rotation = _.random(-10, 10);
                                draggable.setRotation(rotation);

                                var sub_totals = {};
                                var totals = {};
                                var dgs = self.getControls(DRAGGABLE_PREFIX);

                                // update sub_totals
                                _.each(dgs, function (dg) {
                                    _.each(spots, function (spot, i) {
                                        sub_totals[i] = sub_totals[i] || 0;
                                        if (dg.getPosition().x === spot.x && dg.getPosition().y === spot.y) {
                                            sub_totals[i] += 1;
                                        }
                                    });
                                });

                                _.each(sub_totals, function (v, k) {
                                    var str = 'x' + v;
                                    if (_.isUndefined(self._subTotalLabels[k])) {
                                        self._subTotalLabels[k] =  cc.LabelTTF.create(str, "mikadoBold", 12);
                                        self._subTotalLabels[k].setPosition(cc.p(spots[k].x + 15, spots[k].y + 20));
                                        self._subTotalLabels[k].setZOrder(500);
                                        self._subTotalLabels[k].setColor(cc.c3b(224,161,40));
                                        self._subTotalLabels[k].setAnchorPoint(cc.p(0, 0));
                                        self.addChild(self._subTotalLabels[k]);
                                    }
                                    self._subTotalLabels[k].setVisible(v > 0);
                                    if (self._subTotalLabels[k].getString() !== str) {
                                        self._subTotalLabels[k].setRotation(rotation);
                                    }
                                    self._subTotalLabels[k].setString(str);
                                });

                                self._totalLabels[0].setString(sub_totals[0] + sub_totals[1]);
                                self._totalLabels[1].setString(sub_totals[2] + sub_totals[3]);
                                self._totalLabels[2].setString(sub_totals[0] + sub_totals[1]);
                                self._totalLabels[3].setString(sub_totals[1] + sub_totals[2]);

                            }
                        }
                    );
                });

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
