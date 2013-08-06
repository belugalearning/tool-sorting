require.config({
    paths: {}
});

define(['cocos2d', 'bldrawnode', 'underscore', 'dropzone', 'polygon', 'stackedsprite'], function (cc, BLDrawNode, _, DropZone, Polygon, StackedSprite) {
    'use strict';

    var VennDiagram = cc.Layer.extend({

        ctor: function (parent, question, members) {
            this._super();

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
                    p: cc.p(parent._windowSize.width / 2 - (radius + 2), (parent._windowSize.height / 2) - 78),
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
                var dz = parent.addCircularDropZone(c1.p, path, c1.label, c1.definitionURL);

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
                parent.addDraggable({x:parent._windowSize.width / 2, y:60}, sprite, creature.definitionURL);
            });
        }

    });

    return VennDiagram;

});
