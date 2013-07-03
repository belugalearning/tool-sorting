require.config({
    paths: {}
});

define(['cocos2d'], function (cc) {
    'use strict';

    var Draggable = cc.ControlButton.extend({

        ctor:function() {
            this._super();
        },

        initWithFile: function (file) {
            var sprite = new cc.Sprite();
            sprite.initWithFile(file);
            var label = new cc.LabelTTF();
            label.initWithString('');
            label.setOpacity(0);
            this.initWithLabelAndBackgroundSprite(label, sprite);
        },

        onTouchMoved: function (touch, event) {
            this._super(touch, event);
            this.setPosition(touch.getLocation());
            this._onMoved.call(this, touch.getLocation());
        },

        onTouchEnded: function (touch, event) {
            this._super(touch, event);
            this._onMoveEnded.call(this, touch.getLocation());
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
