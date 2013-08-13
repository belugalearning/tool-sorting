require.config({
    paths: {
        'circulardropzone': '../../tools/sorting/circulardropzone',
        'splitdropzone': '../../tools/sorting/splitdropzone',
        'venndiagram': '../../tools/sorting/VennDiagram',
        'barchart': '../../tools/sorting/BarChart',
        'tablediagram': '../../tools/sorting/TableDiagram'
    }
});

var DRAGGABLE_PREFIX = 'DRAGGABLE_';
var DROPZONE_PREFIX = 'DROPZONE_';

var DROPZONE_Z = 1;
var LABEL_Z = 2;
var DRAGGABLE_Z = 3;

var BAR_CHART = 'bar';
var VENN_DIAGRAM = 'venn';
var TABLE_DIAGRAM = 'table';
var BOXES_DIAGRAM = 'boxes';

define(['exports', 'cocos2d', 'qlayer', 'bldrawnode', 'toollayer', 'stackedsprite', 'dropzone', 'draggable', 'draggableLayer', 'circulardropzone', 'splitdropzone', 'blbutton', 'venndiagram', 'barchart', 'tablediagram'], function (exports, cc, QLayer, BLDrawNode, ToolLayer, StackedSprite, DropZone, Draggable, DraggableLayer, CircularDropZone, SplitDropZone, BlButton, VennDiagram, BarChart, TableDiagram) {
    'use strict';

    window.bl.toolTag = 'sorting';
    var Tool = ToolLayer.extend({

        init: function () {
            var self = this;

            this._super();

            this.setTouchEnabled(true);

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
                    draggable.returnToLastPosition(true);
                } else {
                    draggable.setTouchEnabled(false);
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
            dz.setTag('dz' + this._dropzoneCounter);
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
                self._question.symbols.lists.unclassified.mathml = self._question.symbols.lists.unclassified.mathml.replace('<csymbol definitionURL="' + dg.definitionURL + '" />', '');
            });

            _.each(exclusive, function (dz) {
                expression.push('<apply><notin />');
                expression.push('<csymbol definitionURL="' + dg.definitionURL + '" />');
                expression.push('<csymbol definitionURL="' + dz.definitionURL + '" />');
                expression.push('</apply>');
            });

            expression.push('</apply>');

            console.log({
                symbols: this._question.symbols,
                expression: expression.join('')
            });

            return window.bl.expressionService.evaluateExpression({
                symbols: this._question.symbols,
                expression: expression.join('')
            });

        },

        _setLength: undefined,
        getSetLength: function () {
            if (_.isUndefined(this._setLength)) {
                this._setLength = 0;
                for (var key in this._question.symbols.sets) {
                    if (this._question.symbols.sets.hasOwnProperty(key)) {
                        this._setLength++;
                    }
                }
            }
            return this._setLength;
        },

        _setMemberLength: undefined,
        getSetMemberLength: function () {
            if (_.isUndefined(this._setLength)) {
                this._setLength = 0;
                for (var key in this._question.symbols.set_members) {
                    if (this._question.symbols.set_members.hasOwnProperty(key)) {
                        this._setMemberLength++;
                    }
                }
            }
            return this._setMemberLength;
        },

        _barChartButton: undefined,
        _totalLabels: [],
        _subTotalLabels: [],
        setQuestion: function (question) {
            var self = this;

            this._super(question);

            this.setBackground(window.bl.getResource('deep_water_background'));
            this.addBackgroundComponent(window.bl.getResource('dock'), cc.p(this._windowSize.width / 2, 40));

            var members = $($.parseXML(question.symbols.lists.unclassified.mathml)).find('csymbol').toArray().map(function(csymbol) { var id = $(csymbol).attr('definitionURL').match(/[^/]+$/)[0]; return question.symbols.set_members[id]; });


            if (question.toolMode === BAR_CHART) {

                this.addBackgroundComponent(window.bl.getResource('x_axis'), cc.p(this._windowSize.width / 2, 145));
                
                var barChart = new BarChart(this, question, members);
                this.addChild(barChart);

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
                var table = new TableDiagram(this, question, members);
                this.addChild(table);


            } else if (question.toolMode === VENN_DIAGRAM) {

                this.addBackgroundComponent(window.bl.getResource('dock'), cc.p(this._windowSize.width / 2, 40));
                this.addBackgroundComponent(window.bl.getResource('venn_diagram_3_colour'), cc.p(this._windowSize.width / 2, (this._windowSize.height / 2) + 30));
                
                var venn = new VennDiagram(this, question, members);
                this.addChild(venn);

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
