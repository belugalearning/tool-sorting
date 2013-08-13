require.config({
    paths: {}
});

define(['cocos2d', 'bldrawnode', 'underscore', 'dropzone', 'stackedsprite'], function (cc, BLDrawNode, _, DropZone, StackedSprite) {
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
                var path = cc.DrawNode.generateCircle(cc.p(c1.r, c1.r), c1.r);
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
                parent.addDraggable({x:parent._windowSize.width / 2, y:60}, sprite, creature.definitionURL, undefined,
                    function onMoveEnded (position, draggable) {
                        var dzs = parent.getControls(DROPZONE_PREFIX);
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
                        if (!parent.checkValid(draggable, inclusive, exclusive)) {
                            draggable.returnToLastPosition(true);
                        } else {
                            // this is the start of working out all the segments
                            var path;
                            _.each(inclusive, function (dz, i) {
                                var pos = dz.getPosition();
                                var vertices = Polygon.fromCCPoints(_.map(dz.area.vertices, function(p) {
                                    return cc.p(p.x + pos.x, p.y + pos.y);
                                }));
                                if (_.isUndefined(path)) {
                                    path = vertices;
                                    return;
                                }
                                var path2 = vertices;

                                path = path2.clip(path, 'union');
                                path = path[0];
                                
                            });

                            // path = Polygon.fromCCPoints(Polygon.toCCPoints(path.points));

                            var negativePath;
                            if (exclusive.length > 0) {
                                _.each(exclusive, function (dz, i) {
                                    var pos = dz.getPosition();
                                    var vertices = Polygon.fromCCPoints(_.map(dz.area.vertices, function(p) {
                                        return cc.p(p.x + pos.x, p.y + pos.y);
                                    }));
                                    if (_.isUndefined(negativePath)) {
                                        negativePath = vertices;
                                        return;
                                    }
                                    var path2 = vertices;
                                    negativePath = path2.clip(negativePath, 'union')[0];
                                });

                                // path = negativePath.clip(path, 'difference')[0];
                            }

                            path = Polygon.toCCPoints(path.points);


                            var area = new BLDrawNode();
                            area.setZOrder(100);
                            area.drawPoly(path, cc.c4FFromccc4B(cc.c4b(0, 255, 0, 50)), 1, cc.c4FFromccc4B(cc.c4b(0, 255, 0,255)));
                            if (!_.isUndefined(negativePath)) {
                                negativePath = Polygon.toCCPoints(negativePath.points);
                                area.drawPoly(negativePath, cc.c4FFromccc4B(cc.c4b(255, 0, 0, 50)), 1, cc.c4FFromccc4B(cc.c4b(255, 0, 0,255)));
                            }
                            parent.addChild(area);

                            draggable.setTouchEnabled(false);
                            draggable.setRotation(_.random(-10, 10));
                        }

                    }
                );
            });
        },

        generateIntersection: function (inc, exc) {
            var dzs = parent.getControls(DROPZONE_PREFIX);

            var shapeSides = [];

            inc = [dzs[0], dzs[2]];
            exc = [dzs[1]];

            _.each(dzs, function (dz1, i) {

                var position = dz1.getPosition();
                var points = _.map(dz1.area.vertices, function(p) {
                    return cc.p(p.x + position.x, p.y + position.y);
                });
                var radius = 198;

                // if the point is in an inc and not in a exc add it
                var arcSections = [];
                var section;
                _.each(points, function (point) {

                    var count = 0;
                    _.each(inc, function (curr) {
                        var position2 = curr.getPosition();

                        if (Math.pow(point.x - (position2.x + radius), 2) + Math.pow(point.y - (position2.y + radius), 2) < Math.pow(radius, 2)) {
                            count += 1;
                            return;
                        }
                    });
                    if (count != inc.length) {
                        section = null;
                        return;
                    }


                    count = 0;
                    _.each(exc, function (curr) {
                        var position2 = curr.getPosition();
                        if (Math.pow(point.x - (position2.x + radius), 2) + Math.pow(point.y - (position2.y + radius), 2) < Math.pow(radius, 2)) {
                            count += 1;
                            return;
                        }
                    });
                    if (count > 0) {
                        section = null;
                        return;
                    }


                    if (!section) {
                        section = [];
                        arcSections.unshift(section);
                    }

                    section.push(point);

                });
                
                var side = _.flatten(arcSections);

                shapeSides.push(side)

            });


            var shape = shapeSides.splice(0, 1)[0];

            while (shapeSides.length) {
                var joinPoint = shape.slice(-1)[0];
                var nearest = {
                    sideIndex: null,
                    first:false,
                    distance: Infinity
                };
                var numRemainingSides = shapeSides.length;
                for (var i = 0; i < numRemainingSides; i++) {
                    var side = shapeSides[i];
                    var firstPointDistance = window.bl.getDistanceBetweenPoints(joinPoint, side[0]);
                    var lastPointDistance = window.bl.getDistanceBetweenPoints(joinPoint, side.slice(-1)[0]);

                    if (Math.min(firstPointDistance, lastPointDistance) < nearest.distance) {
                        nearest.sideIndex = i;
                        nearest.first = firstPointDistance < lastPointDistance;
                        nearest.distance = Math.min(firstPointDistance, lastPointDistance);
                    }
                }

                var nextSide = shapeSides.splice(nearest.sideIndex, 1)[0];
                if (!nearest.first) {
                    nextSide.reverse();
                }
                shape = shape.concat(nextSide);
            }
            shape = _.flatten(shape);

        }

    });

    return VennDiagram;

});
