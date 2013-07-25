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

        _getPolySize: function (poly) {
            var min = cc.p(999999,999999);
            var max = cc.p(0,0);
            _.map(poly, function (p) {
                min.x = Math.min(min.x, p.x);
                min.y = Math.min(min.y, p.y);
                max.x = Math.max(max.x, p.x);
                max.y = Math.max(max.y, p.y);
            });
            return cc.SizeMake(max.x - min.x, max.y - min.y);
        },

        setShape: function (shape) {
            var size = {};

            if (_.isArray(shape)) {
                this.area.vertices = shape;
                this.area.drawPoly(shape, cc.c4FFromccc4B(cc.c4b(35, 35, 35, 50)), 1, cc.c4FFromccc4B(cc.c4b(35,35,35,50)));
                size = this._getPolySize(shape);
                this.setContentSize(size);
            }

            if (cc.SPRITE_DEBUG_DRAW > 0) {
                this.area.drawPoly([cc.p(0,0), cc.p(0, size.height), cc.p(size.width, size.height), cc.p(size.width, 0)], cc.c4f(0, 1, 0, 0), 1, cc.c4f(0,1,0,0.2));
            }

        },

        _label: undefined,
        setLabel: function (text) {
            text = text || '';
            if (_.isUndefined(this._label)) {
                this._label = cc.LabelTTF.create(text, "mikadoBold", 30);
                this.addChild(this._label);  
            }
            this._label.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));
        },

        isPointInsideArea: function (point) {
            return window.bl.isPointInsideArea(point, this.area.vertices, this.getPosition());
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
