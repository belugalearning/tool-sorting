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

        isPointInside: function (point) {
            var bBox = this.getBoundingBox();
            return cc.Rect.CCRectContainsPoint(bBox, point);
        },

        isPointInsideArea: function (point) {
            var self = this;

            var nCross = 0;

            _.each(this.area.vertices, function (p1, i) {
                p1 = {
                    x: p1.x + (self.getPosition().x - self.getBoundingBox().size.width * 0.5),
                    y: p1.y + (self.getPosition().y - self.getBoundingBox().size.height * 0.5)
                };
                var p2 = self.area.vertices[(i + 1) % self.area.vertices.length];
                p2 = {
                    x: p2.x + (self.getPosition().x - self.getBoundingBox().size.width * 0.5),
                    y: p2.y + (self.getPosition().y - self.getBoundingBox().size.height * 0.5)
                };

                if (p1.y == p2.y) {
                    return;
                }

                if (point.y < Math.min(p1.y, p2.y)) {
                    return;
                }

                if (point.y >= Math.max(p1.y, p2.y)) {
                    return;
                }

                var x = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;

                if (x > point.x) {
                    nCross++;
                }
            });

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
            // draggable.setPositionX(this.getPositionX() + 60);
        }

    });

    return DropZone;

});
