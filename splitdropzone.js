require.config({
    paths: {}
});

define(['cocos2d', 'bldrawnode', 'underscore', 'dropzone'], function (cc, BLDrawNode, _, DropZone) {
    'use strict';

    var SplitDropZone = DropZone.extend({

        negationArea: undefined,
        _negationLabel: undefined,
        _stackDraggables: true,

        ctor: function() {
            this._super();
            this.negationArea = new BLDrawNode();
            this.negationArea.setZOrder(1);
            this.hideNegationArea();
            this.addChild(this.negationArea);
        },

        setNegationShape: function (shape) {
            var size = {};
            if (_.isArray(shape)) {
                this.negationArea.vertices = shape;
                this.negationArea.drawPoly(shape, cc.c4FFromccc4B(cc.c4b(35, 35, 35, 50)), 1, cc.c4FFromccc4B(cc.c4b(35,35,35,50)));
                size = this._getPolySize(shape);
                this.setContentSize(size);
            }

            if (cc.SPRITE_DEBUG_DRAW > 0) {
                this.negationArea.drawPoly([cc.p(0,0), cc.p(0, size.height), cc.p(size.width, size.height), cc.p(size.width, 0)], cc.c4f(0, 1, 0, 0), 1, cc.c4f(0,1,0,0.2));
            }
        },

        setLabel: function (text) {
            text = text || '';
            if (_.isUndefined(this._label)) {
                this._label = cc.LabelTTF.create(text, "mikadoBold", 30);
                this._label.setAnchorPoint(cc.p(1, 0.5));
                this.addChild(this._label);  
            }
            this._label.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));
        },

        setNegationLabel: function (text) {
            text = text || '';
            if (_.isUndefined(this._negationLabel)) {
                this._negationLabel = cc.LabelTTF.create(text, "mikadoBold", 30);
                this._negationLabel.setAnchorPoint(cc.p(1, 0.5));
                this.addChild(this._negationLabel);  
            }
            this._negationLabel.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));
        },

        isPointInsideArea: function (point) {
            return this._isPointInsideArea(point, this.area.vertices);
        },

        isPointInsideNegationArea: function (point) {
            return this._isPointInsideArea(point, this.negationArea.vertices);
        },

        findPositionFor: function (draggable) {
            throw {name : "NotImplementedError", message : "This doesn't exist for SplitDropZone"};
        },

        showNegationArea: function () {
            this.negationArea.setVisible(true);
        },

        hideNegationArea: function () {
            this.negationArea.setVisible(false);
        }

    });

    return SplitDropZone;

});
