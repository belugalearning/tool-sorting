require.config({
    paths: {}
});

define(['cocos2d', 'bldrawnode', 'underscore'], function (cc, BLDrawNode, _) {
    'use strict';

    var DropZone = cc.Layer.extend({

        area: undefined,
        _stackDraggables: false,

        ctor: function() {
            this._super();
            this.area = new BLDrawNode();
            this.area.setZOrder(1);
            this.hideArea();
            this.addChild(this.area);

            // Set the default anchor point
            this.ignoreAnchorPointForPosition(false);
            this.setAnchorPoint(cc.p(0.5, 0.5));
        },

        setShape: function (shape) {

            if (_.isArray(shape)) {
                this.area.vertices = shape;
                this.area.drawPoly(shape, cc.c4f(255, 0, 0, 0.2), 1, cc.c4f(255,0,0,0.2));
            } else {
                this.setContentSize(cc.SizeMake(shape * 2, shape * 2));
                this.area.drawCircle(cc.p(shape,shape), shape, 2 * Math.PI, 2, false, cc.c4f(1, 0, 0, 0.2), 1, cc.c4f(1,0,0,0.2));  
            }

            if (cc.SPRITE_DEBUG_DRAW > 0) {
                var maxRect = this.area.getBoundingBoxToWorld();
                this.area.drawPoly([cc.p(0,0), cc.p(0, maxRect.size.height), cc.p(maxRect.size.width, maxRect.size.height), cc.p(maxRect.size.width, 0)], cc.c4f(0, 1, 0, 0), 1, cc.c4f(0,1,0,0.2));
            }

        },

        isPointInside: function (point) {
            var bBox = this.area.getBoundingBoxToWorld();
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
            if (this._stackDraggables) {
                // set it's position
                // rotate an angle
                // update label count
            }
        }

    });

    return DropZone;

});
