require.config({
    paths: {}
});

define(['cocos2d'], function (cc) {
    'use strict';

    var DropZone = cc.Sprite.extend({

        area: undefined,

        ctor: function() {
            this._super();
            this.area = new cc.DrawNode();
            this.area.setZOrder(1);
            this.hideArea();
            this.addChild(this.area);
        },

        setPoints: function (points) {
            var vertices = [];
            _.each(points, function (point) {
                vertices.push(point);
            });
            this.area.vertices = vertices;
            this.area.drawPoly(vertices, cc.c4f(255, 0, 0, 0.2), 1, cc.c4f(255,0,0,0.2));
        },

        isPointInside:function (point) {
            var bBox = this.getBoundingBox();
            return cc.Rect.CCRectContainsPoint(bBox, point);
        },

        isPointInsideArea: function (point) {

            var nCross = 0;

            for (var i = 0; i < this.area.vertices.length; i++) {

                var p1 = this.area.vertices[i];
                p1 = {
                    x: p1.x + (this.getPosition().x - this.getBoundingBox().size.width * 0.5),
                    y: p1.y + (this.getPosition().y - this.getBoundingBox().size.height * 0.5)
                };
                var p2 = this.area.vertices[(i + 1) % this.area.vertices.length];
                p2 = {
                    x: p2.x + (this.getPosition().x - this.getBoundingBox().size.width * 0.5),
                    y: p2.y + (this.getPosition().y - this.getBoundingBox().size.height * 0.5)
                };

                if (p1.y == p2.y) {
                    continue;
                }

                if (point.y < Math.min(p1.y, p2.y)) {
                    continue;
                }

                if (point.y >= Math.max(p1.y, p2.y)) {
                    continue;
                }

                var x = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;

                if (x > point.x) {
                    nCross++;
                }
            }

            if (nCross % 2 == 1) {
                return true;
            }
            return false;
        },

        showArea: function () {
            this.area.setVisible(true);
        },

        hideArea: function () {
            this.area.setVisible(false);
        },

        findPositionFor: function (draggable) {

        }

    });

    return DropZone;

});
