require.config({
    paths: {}
});

define(['cocos2d', 'bldrawnode', 'underscore', 'dropzone', 'stackedsprite'], function (cc, BLDrawNode, _, DropZone, StackedSprite) {
    'use strict';

    var TableDiagram = cc.Layer.extend({

        ctor: function (parent, question, members) {
            var slef = this;

            this._super();

            var table_pos = cc.p(344, 260);

            var area_side = 164;
            var bar_width = 5;
            var label_gap = 20;

            var rect_h_width = area_side * 2 + bar_width;
            var rect_h_height = area_side;

            var dz = parent.addSplitDropZone(table_pos, bl.PolyRectMake(0, rect_h_height, rect_h_width, rect_h_height), bl.PolyRectMake(0, 0, rect_h_width, rect_h_height), question.symbols.sets.set0.label, question.symbols.sets.set0.negationLabel, question.symbols.sets.set0.definitionURL);
            dz._label.setPosition(-label_gap, 1.5 * (area_side + bar_width));
            dz._label.setFontSize(20);
            dz._negationLabel.setPosition(-label_gap, 0.5 * (area_side));
            dz._negationLabel.setFontSize(20);

            dz = parent.addSplitDropZone(table_pos, bl.PolyRectMake(0, 0, rect_h_height, rect_h_width), bl.PolyRectMake(rect_h_height, 0, rect_h_height, rect_h_width), question.symbols.sets.set1.label, question.symbols.sets.set1.negationLabel, question.symbols.sets.set1.definitionURL);
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
            parent.addChild(total_left);

            var total_top = cc.LabelTTF.create('TOTAL', "mikadoBold", 20);
            total_top.setPosition(cc.p(table_pos.x + (2.5 * (area_side + bar_width)), table_pos.y + (area_side * 2.5 + bar_width) - label_gap));
            total_top.setZOrder(LABEL_Z);
            total_top.setAnchorPoint(cc.p(0.5, 0.5));
            parent.addChild(total_top);

            // add totals
            parent._totalLabels[0] = cc.LabelTTF.create('0', "mikadoBold", 30);
            parent._totalLabels[0].setPosition(cc.p(table_pos.x + (2.5 * (area_side + bar_width)), table_pos.y + (area_side * 1.5 + bar_width)));
            parent._totalLabels[0].setZOrder(LABEL_Z);
            parent._totalLabels[0].setAnchorPoint(cc.p(0.5, 0.5));
            parent.addChild(parent._totalLabels[0]);

            parent._totalLabels[1] = cc.LabelTTF.create('0', "mikadoBold", 30);
            parent._totalLabels[1].setPosition(cc.p(table_pos.x + (2.5 * (area_side + bar_width)), table_pos.y + (area_side * 0.5 + bar_width)));
            parent._totalLabels[1].setZOrder(LABEL_Z);
            parent._totalLabels[1].setAnchorPoint(cc.p(0.5, 0.5));
            parent.addChild(parent._totalLabels[1]);

            parent._totalLabels[2] = cc.LabelTTF.create('0', "mikadoBold", 30);
            parent._totalLabels[2].setPosition(cc.p(table_pos.x + 0.5 * area_side, table_pos.y - 0.5 * area_side));
            parent._totalLabels[2].setZOrder(LABEL_Z);
            parent._totalLabels[2].setAnchorPoint(cc.p(0.5, 0.5));
            parent.addChild(parent._totalLabels[2]);

            parent._totalLabels[3] = cc.LabelTTF.create('0', "mikadoBold", 30);
            parent._totalLabels[3].setPosition(cc.p(580, table_pos.y - 0.5 * area_side));
            parent._totalLabels[3].setZOrder(LABEL_Z);
            parent._totalLabels[3].setAnchorPoint(cc.p(0.5, 0.5));
            parent.addChild(parent._totalLabels[3]);

            parent._totalLabels[4] = cc.LabelTTF.create('0', "mikadoBold", 30);
            parent._totalLabels[4].setPosition(cc.p(table_pos.x + (2.5 * (area_side + bar_width)), table_pos.y - 0.5 * area_side));
            parent._totalLabels[4].setZOrder(LABEL_Z);
            parent._totalLabels[4].setAnchorPoint(cc.p(0.5, 0.5));
            parent.addChild(parent._totalLabels[4]);


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
                    
                    parent.addChild(a);

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
                parent.addDraggable({x:510, y:60}, sprite, creature.definitionURL,
                    function onMoved (position, draggable) {
                        draggable.setRotation(0);
                        var dzs = parent.getControls(DROPZONE_PREFIX);
                        parent._draggableLayer.reorderChild(draggable, parent._draggableCounter);
                        parent._draggableLayer.sortAllChildren();
                        parent._draggableLayer.reshuffleTouchHandlers();

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

                        if (parent._prevDraggable !== draggable.tag) {
                            parent._draggableCounter++;
                        }
                        parent._prevDraggable = draggable.tag;
                    },
                    function onMoveEnded (position, draggable) {
                        var dzs = parent.getControls(DROPZONE_PREFIX);
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

                        if (inclusive.length + exclusive.length < 2 || !parent.checkValid(draggable, inclusive, exclusive)) {
                            draggable.returnToLastPosition(true);
                        } else {
                            var nearest_spot = window.bl.getClosestPoint(position, drop_spots);

                            var rotation = _.random(-10, 10);

                            var action = bl.animation.moveAndRotateTo(0.2, nearest_spot, rotation, function () {

                                var sub_totals = [0,0,0,0];
                                var dgs = parent.getControls(DRAGGABLE_PREFIX);
                                var totals = {};

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
                                    if (_.isUndefined(parent._subTotalLabels[i])) {
                                        parent._subTotalLabels[i] = cc.LabelTTF.create(str, "mikadoBold", 12);
                                        parent._subTotalLabels[i].setPosition(cc.p(drop_spots[i].x + 15, drop_spots[i].y + 20));
                                        parent._subTotalLabels[i].setZOrder(500);
                                        parent._subTotalLabels[i].setColor(cc.c3b(224,161,40));
                                        parent._subTotalLabels[i].setAnchorPoint(cc.p(0, 0));
                                        parent.addChild(parent._subTotalLabels[i]);
                                    }
                                    parent._subTotalLabels[i].setVisible(v > 0);
                                    if (i == updated_sub_total_index) {
                                        parent._subTotalLabels[i].setRotation(rotation);
                                    }
                                    parent._subTotalLabels[i].setString(str);
                                });

                                parent._totalLabels[0].setString(sub_totals[1] + sub_totals[3]);
                                parent._totalLabels[1].setString(sub_totals[0] + sub_totals[2]);
                                parent._totalLabels[2].setString(sub_totals[1] + sub_totals[0]);
                                parent._totalLabels[3].setString(sub_totals[3] + sub_totals[2]);
                                var cumulative = 0;
                                var sums = _.map(sub_totals,function(num) {
                                    cumulative += num;
                                    return cumulative;
                                });
                                parent._totalLabels[4].setString(sums[sums.length - 1]);

                            });

                            draggable.runAction(action);

                        }
                    }
                );
            });
        }

    });

    return TableDiagram;

});
