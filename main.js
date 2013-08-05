require.config({
    paths: {
        'circulardropzone': '../../tools/sorting/circulardropzone',
        'splitdropzone': '../../tools/sorting/splitdropzone'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'bldrawnode', 'polygonclip', 'toollayer', 'stackedsprite', 'dropzone', 'draggable', 'draggableLayer', 'circulardropzone', 'splitdropzone', 'blbutton'], function (exports, cc, QLayer, BLDrawNode, Polygon, ToolLayer, StackedSprite, DropZone, Draggable, DraggableLayer, CircularDropZone, SplitDropZone, BlButton) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var DROPZONE_Z = 1;
    var LABEL_Z = 2;
    var DRAGGABLE_Z = 3;

    var BAR_CHART = 'bar';
    var VENN_DIAGRAM = 'venn';
    var TABLE_DIAGRAM = 'table';
    var BOXES_DIAGRAM = 'boxes';

    window.bl.toolTag = 'sorting';
    var Tool = ToolLayer.extend({

        _windowSize: undefined,

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
            );
            return this;
        },

        reset: function () {
            this._draggableCounter = 0;
            this._draggableLayer = undefined;
            this._prevDraggable = undefined;
            this._barChartButton = undefined;
            this._dropzoneCounter = 0;
            this._totalLabels = [];
            this._subTotalLabels = [];
            this._super();
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
                    if (dz.containsPoint(position)) {
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
                    if (dz.containsPoint(position)) {
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
            // Set the default anchor point
            dg.definitionURL = definitionURL;
            dg.tag = 'dg-' + this._draggableCounter;
            if (typeof resource === 'object') {
                dg.initWithSprite(resource);
            } else {
                dg.initWithFile(resource);
            }
            dg.setPosition(position);
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

            var self = this;
            var expression = ['<apply>'];

            expression.push('<and />');

            _.each(inclusive, function (dz) {
                expression.push('<apply><in />');
                expression.push('<csymbol definitionURL="' + dg.definitionURL + '" />');
                expression.push('<csymbol definitionURL="' + dz.definitionURL + '" />');
                expression.push('</apply>');
                self.question.symbols.lists.unclassified.mathml = self.question.symbols.lists.unclassified.mathml.replace('<csymbol definitionURL="' + dg.definitionURL + '" />', '');
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
            });

            return window.bl.expressionService.evaluateExpression({
                symbols: this.question.symbols,
                expression: expression.join('')
            });

        },

        _barChartButton: undefined,
        _totalLabels: [],
        _subTotalLabels: [],
        setQuestion: function (question) {
            var self = this;

            this._super(question);
            this.setBackground(window.bl.getResource('deep_water_background'));
            this.addBackgroundComponent(window.bl.getResource('dock'), cc.p(this._windowSize.width / 2, 40));

            var setLength = 0, key;
            for (key in question.symbols.sets) {
                if (question.symbols.sets.hasOwnProperty(key)) setLength++;
            }

            var setMemberLength = 0;
            for (key in question.symbols.set_members) {
                if (question.symbols.set_members.hasOwnProperty(key)) setMemberLength++;
            }

            var members = $($.parseXML(question.symbols.lists.unclassified.mathml)).find('csymbol').toArray().map(function(csymbol) { var id = $(csymbol).attr('definitionURL').match(/[^/]+$/)[0]; return question.symbols.set_members[id]; });


            if (question.toolMode === BAR_CHART) {

                this.addBackgroundComponent(window.bl.getResource('x_axis'), cc.p(this._windowSize.width / 2, 145));
                
                for (var i = 0; i < setLength; i++) {
                    var dz = this.addDropZone({
                        x:140 + (i * 155), y:153},
                        bl.PolyRectMake(0, 0, 120, 600),
                        question.symbols.sets['set' + i].label,
                        question.symbols.sets['set' + i].definitionURL);
                    dz._label.setPosition(60, -20);
                    dz._label.setFontSize(20);
                }

                var placed = 0;
                var maxCards = 6;
                var spaceHeight = 600 / maxCards;
                var colours = [cc.c4FFromccc4B({r:241,g:201,b:46,a:255}), cc.c4FFromccc4B({r:45,g:211,b:43,a:255}), cc.c4FFromccc4B({r:47,g:185,b:196,a:255}), cc.c4FFromccc4B({r:226,g:68,b:46,a:255}), cc.c4FFromccc4B({r:244,g:100,b:185,a:255})];
                _.each(members, function (creature, k) {

                    var sprite = new StackedSprite();
                    sprite.setup({ layers: creature.sprite });
                    self.addDraggable({x:510, y:60}, sprite, creature.definitionURL, undefined, function (position, draggable) {
                        var dzs = self.getControls(DROPZONE_PREFIX);
                        var inclusive = [];
                        var exclusive = [];
                        _.each(dzs, function(dz) {
                            if (dz.containsPoint(position)) {
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
                            _.each(inclusive, function (dz) {
                                dz.placed--;
                            });
                        } else {
                            placed++;
                            draggable.setTouchEnabled(false);
                            draggable.setRotation(_.random(-10, 10));
                            draggable.setPosition(cc.p(inclusive[0].getPosition().x + 60, inclusive[0].getPosition().y + (inclusive[0].placed * 100) - 50));
                            if (placed >= setMemberLength) {
                                var action = bl.animation.popIn();

                                // show bar chart button
                                this._barChartButton = new BlButton.create(bl.getResource('barchart_button'));
                                this._barChartButton.setPosition(cc.p(100, 100));
                                this._barChartButton.onTouchUp(function (postion, btn) {

                                    btn.setOpacity(255/2);
                                    btn.setEnabled(false);
                                    
                                    var dgs = self.getControls(DRAGGABLE_PREFIX);
                                    _.each(dgs, function(dg) {
                                        dg.setVisible(false);
                                    });
                                    var maxPlaced = _.max(dzs, function(dz) { return dz.placed; }).placed;
                                    _.each(dzs, function(dz, i) {
                                        dz.area.clear();
                                        dz.area.drawPoly(bl.PolyRectMake(0, -4, 120, dz.placed * spaceHeight), colours[i], 2, cc.c4f(1,2,1,1));
                                        dz.showArea();
                                    });

                                    // add y axis
                                    self.yAxis = new BLDrawNode();
                                    self.yAxis.setZOrder(1);
                                    self.addChild(self.yAxis);
                                    self.yAxis.drawPoly(bl.PolyRectMake(115, 145, 0, 610), cc.c4f(1,1,1,1), 3, cc.c4f(1,1,1,1));

                                    _.times(maxCards + 1, function (i) {
                                        self.yAxis.drawPoly(bl.PolyRectMake(95, 148 + i * spaceHeight, 20, 0), cc.c4f(1,1,1,1), 3, cc.c4f(1,1,1,1));
                                        var label = cc.LabelTTF.create(i, "mikadoBold", 20);
                                        label.setColor(cc.c3b(255,255,255));
                                        self.addChild(label);
                                        label.setPosition(cc.p(75, 148 + i * spaceHeight));
                                    });
                                });

                                this._barChartButton.runAction(action);
                                self.addChild(this._barChartButton, 10);

                            }

                        }
                    });
                });

            } else if (question.toolMode === BOXES_DIAGRAM) {

                this.addBackgroundComponent(window.bl.getResource('sorting_boxes'), cc.p(this._windowSize.width / 2, (this._windowSize.height / 2)));

                _.each(members, function (creature, k) {
                    var sprite = new StackedSprite();
                    sprite.setup({ layers: creature.sprite });
                    self.addDraggable({x:510, y:60}, sprite, creature.definitionURL);
                });

            } else if (question.toolMode === TABLE_DIAGRAM) {

                this.addBackgroundComponent(window.bl.getResource('table_frame'), cc.p(this._windowSize.width / 2, (this._windowSize.height / 2) + 40));
                
                // setup dropzones

                var table_pos = cc.p(344, 260);

                var area_side = 164;
                var bar_width = 5;
                var label_gap = 20;

                var rect_h_width = area_side * 2 + bar_width;
                var rect_h_height = area_side;

                var dz = this.addSplitDropZone(table_pos, bl.PolyRectMake(0, rect_h_height, rect_h_width, rect_h_height), bl.PolyRectMake(0, 0, rect_h_width, rect_h_height), question.symbols.sets.set0.label, question.symbols.sets.set0.negationLabel, question.symbols.sets.set0.definitionURL);
                dz._label.setPosition(-label_gap, 1.5 * (area_side + bar_width));
                dz._label.setFontSize(20);
                dz._negationLabel.setPosition(-label_gap, 0.5 * (area_side));
                dz._negationLabel.setFontSize(20);

                dz = this.addSplitDropZone(table_pos, bl.PolyRectMake(0, 0, rect_h_height, rect_h_width), bl.PolyRectMake(rect_h_height, 0, rect_h_height, rect_h_width), question.symbols.sets.set1.label, question.symbols.sets.set1.negationLabel, question.symbols.sets.set1.definitionURL);
                dz._label.setPosition(label_gap, 2 * (area_side + bar_width) + label_gap);
                dz._label.setDimensions(cc.SizeMake(120, 80));
                dz._label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                dz._label.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                dz._label.setFontSize(label_gap);
                dz._label.setAnchorPoint(cc.p(0, 0));
                dz._negationLabel.setPosition(1 * (area_side + bar_width) + label_gap, 2 * (area_side + bar_width) + label_gap);
                dz._negationLabel.setDimensions(cc.SizeMake(120, 80));
                dz._negationLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                dz._negationLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                dz._negationLabel.setFontSize(label_gap);
                dz._negationLabel.setAnchorPoint(cc.p(0, 0));


                var total_left = cc.LabelTTF.create('TOTAL', "mikadoBold", 20);
                total_left.setPosition(cc.p(table_pos.x - label_gap - bar_width, table_pos.y - (area_side * 0.5 + bar_width)));
                total_left.setZOrder(LABEL_Z);
                total_left.setAnchorPoint(cc.p(1, 0.5));
                self.addChild(total_left);

                var total_top = cc.LabelTTF.create('TOTAL', "mikadoBold", 20);
                total_top.setPosition(cc.p(table_pos.x + (2.5 * (area_side + bar_width)), table_pos.y + (area_side * 2.5 + bar_width) - label_gap));
                total_top.setZOrder(LABEL_Z);
                total_top.setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(total_top);

                // add totals
                self._totalLabels[0] = cc.LabelTTF.create('0', "mikadoBold", 30);
                self._totalLabels[0].setPosition(cc.p(table_pos.x + (2.5 * (area_side + bar_width)), table_pos.y + (area_side * 1.5 + bar_width)));
                self._totalLabels[0].setZOrder(LABEL_Z);
                self._totalLabels[0].setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(self._totalLabels[0]);

                self._totalLabels[1] = cc.LabelTTF.create('0', "mikadoBold", 30);
                self._totalLabels[1].setPosition(cc.p(table_pos.x + (2.5 * (area_side + bar_width)), table_pos.y + (area_side * 0.5 + bar_width)));
                self._totalLabels[1].setZOrder(LABEL_Z);
                self._totalLabels[1].setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(self._totalLabels[1]);

                self._totalLabels[2] = cc.LabelTTF.create('0', "mikadoBold", 30);
                self._totalLabels[2].setPosition(cc.p(table_pos.x + 0.5 * area_side, table_pos.y - 0.5 * area_side));
                self._totalLabels[2].setZOrder(LABEL_Z);
                self._totalLabels[2].setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(self._totalLabels[2]);

                self._totalLabels[3] = cc.LabelTTF.create('0', "mikadoBold", 30);
                self._totalLabels[3].setPosition(cc.p(580, table_pos.y - 0.5 * area_side));
                self._totalLabels[3].setZOrder(LABEL_Z);
                self._totalLabels[3].setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(self._totalLabels[3]);

                self._totalLabels[4] = cc.LabelTTF.create('0', "mikadoBold", 30);
                self._totalLabels[4].setPosition(cc.p(table_pos.x + (2.5 * (area_side + bar_width)), table_pos.y - 0.5 * area_side));
                self._totalLabels[4].setZOrder(LABEL_Z);
                self._totalLabels[4].setAnchorPoint(cc.p(0.5, 0.5));
                self.addChild(self._totalLabels[4]);


                var visible_areas = [];
                var drop_spots = [];
                _.times(2, function (row) {
                    _.times(2, function (col) {

                        var a = new BLDrawNode();
                        var pos = cc.p(table_pos.x + (row * (area_side + bar_width)), table_pos.y + (col * (area_side + bar_width)));
                        a.setZOrder(1);
                        a.setVisible(false);
                        a.setPosition(pos);
                        var v = bl.PolyRectMake(0, 0, area_side, area_side);
                        a.vertices = v;
                        a.drawPoly(v, cc.c4FFromccc4B(cc.c4b(35, 35, 35, 50)), 1, cc.c4FFromccc4B(cc.c4b(35,35,35,50)));
                        
                        self.addChild(a);

                        visible_areas.push(a);

                        var x_max = _.max(v, function (x) { return x.x; }).x;
                        var y_max = _.max(v, function (x) { return x.y; }).y;
                        drop_spots.push(cc.p(pos.x + x_max * 0.5, pos.y + y_max * 0.5));

                    });
                });



                // add draggables

                _.each(members, function (creature, k) {
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
                                if (dz.containsPoint(position)) {
                                    dz.showArea();
                                    dz.hideNegationArea();
                                } else {
                                    dz.hideArea();

                                    if (dz.negationAreaContainsPoint(position)) {
                                        dz.showNegationArea();
                                    } else {
                                        dz.hideNegationArea();
                                    }
                                }
                            });

                            _.each(visible_areas, function (a) {
                                if (bl.isPointInsideArea(position, a.vertices, a.getPosition())) {
                                    a.setVisible(true);
                                } else {
                                    a.setVisible(false);
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
                                if (dz.containsPoint(position)) {
                                    inclusive.push(dz);
                                } else if (dz.negationAreaContainsPoint(position)) {
                                    exclusive.push(dz);
                                }
                                dz.hideArea();
                                dz.hideNegationArea();
                            });

                            _.each(visible_areas, function (a) {
                                a.setVisible(false);
                            });

                            if (inclusive.length + exclusive.length < 2 || !self.checkValid(draggable, inclusive, exclusive)) {
                                draggable.returnToLastPosition();
                            } else {
                                var nearest_spot = window.bl.getClosestPoint(position, drop_spots);

                                draggable.setPosition(nearest_spot);
                                var rotation = _.random(-10, 10);
                                draggable.setRotation(rotation);

                                var sub_totals = [0,0,0,0];
                                var totals = {};
                                var dgs = self.getControls(DRAGGABLE_PREFIX);

                                // update sub_totals
                                var updated_sub_total_index = 0;
                                _.each(drop_spots, function (spot, i) {
                                    _.each(dgs, function (dg, j) {
                                        if (dg.getPosition().x === spot.x && dg.getPosition().y === spot.y) {
                                            sub_totals[i] += 1;
                                            updated_sub_total_index = i;
                                            return;
                                        }
                                    });
                                });

                                _.each(sub_totals, function (v, i) {
                                    var str = 'x' + v;
                                    if (_.isUndefined(self._subTotalLabels[i])) {
                                        self._subTotalLabels[i] = cc.LabelTTF.create(str, "mikadoBold", 12);
                                        self._subTotalLabels[i].setPosition(cc.p(drop_spots[i].x + 15, drop_spots[i].y + 20));
                                        self._subTotalLabels[i].setZOrder(500);
                                        self._subTotalLabels[i].setColor(cc.c3b(224,161,40));
                                        self._subTotalLabels[i].setAnchorPoint(cc.p(0, 0));
                                        self.addChild(self._subTotalLabels[i]);
                                    }
                                    self._subTotalLabels[i].setVisible(v > 0);
                                    if (i == updated_sub_total_index) {
                                        self._subTotalLabels[i].setRotation(rotation);
                                    }
                                    self._subTotalLabels[i].setString(str);
                                });

                                self._totalLabels[0].setString(sub_totals[1] + sub_totals[3]);
                                self._totalLabels[1].setString(sub_totals[0] + sub_totals[2]);
                                self._totalLabels[2].setString(sub_totals[1] + sub_totals[0]);
                                self._totalLabels[3].setString(sub_totals[3] + sub_totals[2]);
                                var cumulative = 0;
                                var sums = _.map(sub_totals,function(num) {
                                    cumulative += num;
                                    return cumulative;
                                });
                                self._totalLabels[4].setString(sums[sums.length - 1]);

                            }
                        }
                    );
                });

            } else if (question.toolMode === VENN_DIAGRAM) {

                this.addBackgroundComponent(window.bl.getResource('dock'), cc.p(this._windowSize.width / 2, 40));
                this.addBackgroundComponent(window.bl.getResource('venn_diagram_3_colour'), cc.p(this._windowSize.width / 2, (this._windowSize.height / 2) + 30));
                
                var radius = 198;
                var circles = [
                    {
                        r: radius,
                        p: cc.p(208, 129),
                        label: question.symbols.sets.set0.label,
                        definitionURL: question.symbols.sets.set0.definitionURL
                    },
                    {
                        r: radius,
                        p: cc.p(416, 129),
                        label: question.symbols.sets.set1.label,
                        definitionURL: question.symbols.sets.set1.definitionURL
                    },
                    {
                        r: radius,
                        p: cc.p(this._windowSize.width / 2 - (radius + 2), (this._windowSize.height / 2) - 78),
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
                        dz._label.setPosition(cc.p(dz.getContentSize().width * -0.0001, dz.getContentSize().height * -0.0001));
                    } else if (i === 1) {
                        dz._label.setRotation(-45);
                        dz._label.setPosition(cc.p(dz.getContentSize().width * 1, dz.getContentSize().height * -0.0001));
                    } else if (i === 2) {
                        dz._label.setPosition(cc.p(dz.getContentSize().width * 0.5, dz.getContentSize().height * 1.1));
                    }

                });

                _.each(members, function (creature, k) {
                    var sprite = new StackedSprite();
                    sprite.setup({ layers: creature.sprite });
                    self.addDraggable({x:self._windowSize.width / 2, y:60}, sprite, creature.definitionURL);
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
