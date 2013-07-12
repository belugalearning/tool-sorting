require.config({
    paths: {}
});

define(['cocos2d'], function (cc) {
    'use strict';

    var Draggable = cc.ControlButton.extend({

        tag: '',

        ctor:function() {
            this._super();
        },

        initWithFile: function (file) {
            var sprite = new cc.Sprite();
            sprite.initWithFile(file);
            var s = sprite.getBoundingBox().size;
            var label = new cc.LabelTTF();
            label.initWithString('');
            label.setOpacity(0);
            label.setDimensions(s);
            this.initWithLabelAndBackgroundSprite(label, sprite);
            this.setMargins(0, 0);
        },

        onTouchMoved: function (touch, event) {
            this._super(touch, event);
            this.setPosition(touch.getLocation());
            this._onMoved.apply(this, [touch.getLocation(), this]);
        },

        onTouchEnded: function (touch, event) {
            this._super(touch, event);
            this._onMoveEnded.apply(this, [touch.getLocation(), this]);
        },

        _onMoved: function () {},
        onMoved: function (cb) {
            this._onMoved = cb;
        },

        _onMoveEnded: function () {},
        onMoveEnded: function (cb) {
            this._onMoveEnded = cb;
        }

    });

    return Draggable;

});
