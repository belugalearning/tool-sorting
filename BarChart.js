require.config({
    paths: {}
});

define(['cocos2d', 'bldrawnode', 'underscore', 'dropzone', 'stackedsprite'], function (cc, BLDrawNode, _, DropZone, StackedSprite) {
    'use strict';

    var BarChart = cc.Layer.extend({

        ctor: function (parent, question, members) {

            this._super();
            for (var i = 0; i < parent.getSetLength(); i++) {
                var dz = parent.addDropZone({
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
                parent.addDraggable({x:510, y:60}, sprite, creature.definitionURL, undefined, function (position, draggable) {
                    var dzs = parent.getControls(DROPZONE_PREFIX);
                    var inclusive = [];
                    var exclusive = [];
                    _.each(dzs, function(dz, i) {
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
                    if (!parent.checkValid(draggable, inclusive, exclusive)) {
                        draggable.returnToLastPosition(true);
                        _.each(inclusive, function (dz) {
                            dz.placed--;
                        });
                    } else {
                        placed++;
                        draggable.setTouchEnabled(false);

                        var action = bl.animation.moveAndRotateTo(0.2, cc.p(inclusive[0].getPosition().x + 60, inclusive[0].getPosition().y + (inclusive[0].placed * 100) - 50), _.random(-10, 10));
                        draggable.runAction(action);

                        if (placed >= parent.getSetMemberLength()) {
                            action = bl.animation.popIn();

                            // show bar chart button
                            this._barChartButton = new BlButton.create(bl.getResource('barchart_button'));
                            this._barChartButton.setPosition(cc.p(100, 70));
                            this._barChartButton.onTouchUp(function (postion, btn) {

                                btn.setOpacity(255/2);
                                btn.setEnabled(false);
                                
                                var dgs = parent.getControls(DRAGGABLE_PREFIX);
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
                                parent.yAxis = new BLDrawNode();
                                parent.yAxis.setZOrder(1);
                                parent.addChild(parent.yAxis);
                                parent.yAxis.drawPoly(bl.PolyRectMake(115, 145, 0, 610), cc.c4f(1,1,1,1), 3, cc.c4f(1,1,1,1));

                                _.times(maxCards + 1, function (i) {
                                    parent.yAxis.drawPoly(bl.PolyRectMake(95, 148 + i * spaceHeight, 20, 0), cc.c4f(1,1,1,1), 3, cc.c4f(1,1,1,1));
                                    var label = cc.LabelTTF.create(i, "mikadoBold", 20);
                                    label.setColor(cc.c3b(255,255,255));
                                    parent.addChild(label);
                                    label.setPosition(cc.p(75, 148 + i * spaceHeight));
                                });
                            });

                            this._barChartButton.runAction(action);
                            parent.addChild(this._barChartButton, 10);

                        }

                    }
                });
            });
        }

    });

    return BarChart;

});
