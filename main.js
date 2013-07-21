require.config({
    paths: {
        'dropzone': '../../tools/sorting/dropzone',
        'draggable': '../../tools/sorting/draggable',
        'draggableLayer': '../../tools/sorting/draggableLayer'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'polygonclip', 'toollayer', 'stackedsprite', 'dropzone', 'draggable', 'draggableLayer'], function (exports, cc, QLayer, Polygon, ToolLayer, StackedSprite, DropZone, Draggable, DraggableLayer) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var BACKGROUND_Z = 0;
    var DROPZONE_Z = 1;
    var DRAGGABLE_Z = 2;

    var BAR_CHART = 'BAR_CHART';
    var VENN_DIAGRAM = 'venn';
    var TABLE_DIAGRAM = 'table';

    window.toolTag = 'sorting';
    var Tool = ToolLayer.extend({

        _windowSize: undefined,
        _background: undefined,
        _backgroundLayer: undefined,

        init: function () {
            var self = this;

            this._super();

            this.setTouchEnabled(true);

            this._windowSize = cc.Director.getInstance().getWinSize();

            cc.Director.getInstance().setDisplayStats(false);

            this.setQuestion({
              'tool': 'sorting',
              'toolMode': 'table',
              'setCategory': 'creature',
              'numSets': 3,
              'autoreject': true,
              'symbols': {
                'sets': {
                  'set0': {
                    'definitionURL': 'local://symbols/sets/set0',
                    'mathml': '<set><bvar><ci>x</ci></bvar><condition><apply><eq/><apply><property/><ci>x</ci><key>legs</key></apply><string>4</string></eq></apply></condition></set>',
                    'label': 'Has 4 legs',
                    'negationLabel': 'Does not have 4 legs'
                  },
                  'set1': {
                    'definitionURL': 'local://symbols/sets/set1',
                    'mathml': '<set><bvar><ci>x</ci></bvar><condition><apply><eq/><apply><property/><ci>x</ci><key>eyes</key></apply><string>2</string></eq></apply></condition></set>',
                    'label': 'Has 2eyes',
                    'negationLabel': 'Does not have 2 eyes'
                  },
                  'set2': {
                    'definitionURL': 'local://symbols/sets/set2',
                    'mathml': '<set><bvar><ci>x</ci></bvar><condition><apply><eq/><apply><property/><ci>x</ci><key>horn</key></apply><string>false</string></eq></apply></condition></set>',
                    'label': 'Does not have horns',
                    'negationLabel': 'Has horns'
                  }
                },
                'set_members': {
                  'creature0': {
                    'definitionURL': 'local://symbols/set_members/creature0',
                    'eyes': 2,
                    'legs': 4,
                    'colour': 'yellow',
                    'horn': false,
                    'sprite': [
                      {
                        'color': {
                          'r': 247,
                          'g': 204,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_4',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature1': {
                    'definitionURL': 'local://symbols/set_members/creature1',
                    'eyes': 2,
                    'legs': 4,
                    'colour': 'green',
                    'horn': false,
                    'sprite': [
                      {
                        'color': {
                          'r': 0,
                          'g': 183,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_4',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature2': {
                    'definitionURL': 'local://symbols/set_members/creature2',
                    'eyes': 2,
                    'legs': 4,
                    'colour': 'red',
                    'horn': true,
                    'sprite': [
                      {
                        'color': {
                          'r': 231,
                          'g': 0,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_4',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'horns',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature3': {
                    'definitionURL': 'local://symbols/set_members/creature3',
                    'eyes': 2,
                    'legs': 4,
                    'colour': 'blue',
                    'horn': true,
                    'sprite': [
                      {
                        'color': {
                          'r': 0,
                          'g': 170,
                          'b': 234,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_4',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'horns',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature4': {
                    'definitionURL': 'local://symbols/set_members/creature4',
                    'eyes': 3,
                    'legs': 4,
                    'colour': 'blue',
                    'horn': false,
                    'sprite': [
                      {
                        'color': {
                          'r': 0,
                          'g': 170,
                          'b': 234,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_4',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_3',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature5': {
                    'definitionURL': 'local://symbols/set_members/creature5',
                    'eyes': 3,
                    'legs': 4,
                    'colour': 'pink',
                    'horn': false,
                    'sprite': [
                      {
                        'color': {
                          'r': 225,
                          'g': 116,
                          'b': 172,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_4',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_3',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature6': {
                    'definitionURL': 'local://symbols/set_members/creature6',
                    'eyes': 3,
                    'legs': 4,
                    'colour': 'green',
                    'horn': true,
                    'sprite': [
                      {
                        'color': {
                          'r': 0,
                          'g': 183,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_4',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_3',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'horns',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature7': {
                    'definitionURL': 'local://symbols/set_members/creature7',
                    'eyes': 1,
                    'legs': 4,
                    'colour': 'red',
                    'horn': true,
                    'sprite': [
                      {
                        'color': {
                          'r': 231,
                          'g': 0,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_4',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_1',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'horns',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature8': {
                    'definitionURL': 'local://symbols/set_members/creature8',
                    'eyes': 2,
                    'legs': 3,
                    'colour': 'red',
                    'horn': false,
                    'sprite': [
                      {
                        'color': {
                          'r': 231,
                          'g': 0,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_3',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature9': {
                    'definitionURL': 'local://symbols/set_members/creature9',
                    'eyes': 2,
                    'legs': 2,
                    'colour': 'yellow',
                    'horn': false,
                    'sprite': [
                      {
                        'color': {
                          'r': 247,
                          'g': 204,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature10': {
                    'definitionURL': 'local://symbols/set_members/creature10',
                    'eyes': 2,
                    'legs': 3,
                    'colour': 'blue',
                    'horn': true,
                    'sprite': [
                      {
                        'color': {
                          'r': 0,
                          'g': 170,
                          'b': 234,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_3',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'horns',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature11': {
                    'definitionURL': 'local://symbols/set_members/creature11',
                    'eyes': 2,
                    'legs': 2,
                    'colour': 'green',
                    'horn': true,
                    'sprite': [
                      {
                        'color': {
                          'r': 0,
                          'g': 183,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_2',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'horns',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature12': {
                    'definitionURL': 'local://symbols/set_members/creature12',
                    'eyes': 3,
                    'legs': 3,
                    'colour': 'red',
                    'horn': false,
                    'sprite': [
                      {
                        'color': {
                          'r': 231,
                          'g': 0,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_3',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_3',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  },
                  'creature13': {
                    'definitionURL': 'local://symbols/set_members/creature13',
                    'eyes': 1,
                    'legs': 3,
                    'colour': 'red',
                    'horn': false,
                    'sprite': [
                      {
                        'color': {
                          'r': 231,
                          'g': 0,
                          'b': 0,
                          'a': 255
                        },
                        'width': 60,
                        'height': 70,
                        'position': {
                          'x': 10,
                          'y': 10
                        }
                      },
                      {
                        'filename': 'mask_legs_3',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      },
                      {
                        'filename': 'eyes_1',
                        'width': 86,
                        'height': 83,
                        'position': {
                          'x': 42,
                          'y': 42
                        }
                      }
                    ]
                  }
                },
                'lists': {
                  'unclassified': {
                    'definitionURL': 'local://symbols/lists/unclassified',
                    'mathml': '<list><members><csymbol definitionURL="local://symbols/set_members/creature10" /><csymbol definitionURL="local://symbols/set_members/creature11" /><csymbol definitionURL="local://symbols/set_members/creature7" /><csymbol definitionURL="local://symbols/set_members/creature4" /><csymbol definitionURL="local://symbols/set_members/creature2" /><csymbol definitionURL="local://symbols/set_members/creature1" /><csymbol definitionURL="local://symbols/set_members/creature9" /><csymbol definitionURL="local://symbols/set_members/creature3" /><csymbol definitionURL="local://symbols/set_members/creature5" /><csymbol definitionURL="local://symbols/set_members/creature13" /><csymbol definitionURL="local://symbols/set_members/creature12" /><csymbol definitionURL="local://symbols/set_members/creature0" /><csymbol definitionURL="local://symbols/set_members/creature8" /><csymbol definitionURL="local://symbols/set_members/creature6" /></members></list>'
                  }
                }
              },
              'completionEvaluation': '<apply><cardinality/><csymbol definitionURL="local://sets/unclassified"/><cn>0</cn></apply>',
              'state': '<state><csymbol definitionURL="local://symbols/lists/unclassified" /><csymbol definitionURL="local://symbols/sets/set0" /><csymbol definitionURL="local://symbols/sets/set1" /><csymbol definitionURL="local://symbols/sets/set2" /></state>'
            });

            return this;
        },

        setBackground: function (resource) {
            if (_.isUndefined(this._background)) {
                this._backgroundLayer = cc.Layer.create();
                this.addChild(this._backgroundLayer, BACKGROUND_Z);
                this._background = new cc.Sprite();
            }
            this._background.initWithFile(resource);
            this._background.setPosition(this._windowSize.width/2, this._windowSize.height/2);
            this._backgroundLayer.addChild(this._background);
        },

        _draggableCounter: 0,
        _draggableLayer: undefined,
        _prevDraggable: undefined,
        addDraggable: function (position, resource, definitionURL) {
            var self = this;
            if (_.isUndefined(this._draggableLayer)) {
                this._draggableLayer = DraggableLayer.create();
                this.addChild(this._draggableLayer, DRAGGABLE_Z);
            }
            var dg = new Draggable();
            dg.definitionURL = definitionURL;
            dg.tag = 'dg-' + this._draggableCounter;
            if (typeof resource === 'object') {
                dg.initWithSprite(resource);
            } else {
                dg.initWithFile(resource);
            }
            dg.setPosition(position.x, position.y);
            dg.onMoved(function (position, draggable) {
                var dzs = self.getControls(DROPZONE_PREFIX);
                self._draggableLayer.reorderChild(draggable, self._draggableCounter);
                self._draggableLayer.sortAllChildren();
                self._draggableLayer.reshuffleTouchHandlers();

                _.each(dzs, function(dz) {
                    // todo check center point of draggable, not touch point
                    //
                    if (dz.isPointInsideArea(position)) {
                        dz.showArea();
                    } else {
                        dz.hideArea();
                    }
                });
                if (self._prevDraggable !== draggable.tag) {
                    self._draggableCounter++;
                }
                self._prevDraggable = draggable.tag;
            });
            dg.onMoveEnded(function (position, draggable) {
                var dzs = self.getControls(DROPZONE_PREFIX);
                var inclusive = [];
                var exclusive = [];
                _.each(dzs, function(dz) {
                    if (dz.isPointInsideArea(position)) {
                        dz.findPositionFor(draggable);
                        inclusive.push(dz);
                    } else {
                        exclusive.push(dz);
                    }
                    dz.hideArea();
                });
                if (!self.checkValid(dg, inclusive, exclusive)) {
                    dg.returnToLastPosition();
                }
            });
            this._draggableLayer.addChild(dg);
            this.registerControl(DRAGGABLE_PREFIX + this._draggableCounter, dg);
            this._draggableCounter++;
        },

        _dropzoneCounter: 0,
        addDropZone: function (position, shape, label, definitionURL, bgResource) {
            var clc = cc.Layer.create();
            var dz = new DropZone();
            dz.definitionURL = definitionURL;
            if (_.isUndefined(bgResource)) {
                dz.init();
            } else {
                dz.initWithFile(bgResource);
            }
            dz.setPosition(position.x, position.y);
            dz.setShape(shape);
            dz.setLabel(label);
            clc.addChild(dz);
            this.registerControl(DROPZONE_PREFIX + this._dropzoneCounter, dz);
            this.addChild(clc, DROPZONE_Z);
            this._dropzoneCounter++;
        },

        getState: function () {
            throw {name : "NotImplementedError", message : "This needs implementing"};
        },

        checkValid: function (dg, inclusive, exclusive) {

            if (inclusive.length + exclusive.length <= 0) return false;

            var expression = ['<apply>'];

            expression.push('<and />');

            _.each(inclusive, function (dz) {
                expression.push('<apply><in />');
                expression.push('<csymbol definitionURL="' + dg.definitionURL + '" />');
                expression.push('<csymbol definitionURL="' + dz.definitionURL + '" />');
                expression.push('</apply>');
            });

            _.each(exclusive, function (dz) {
                expression.push('<apply><notin />');
                expression.push('<csymbol definitionURL="' + dg.definitionURL + '" />');
                expression.push('<csymbol definitionURL="' + dz.definitionURL + '" />');
                expression.push('</apply>');
            });

            expression.push('</apply>');

            console.log({
                symbols: this.question.symbols,
                expression: expression.join('')
            })


            return Math.random() > 0.5;

        },

        addSortables: function (question) {
            var self = this;
            _.each(question.symbols.set_members, function (creature, k) {
                var sprite = new StackedSprite();

                sprite.setup({ layers: creature.sprite });
                self.addDraggable({x:510, y:60}, sprite, creature.definitionURL);
            });
        },

        setQuestion: function (question) {
            var self = this;

            this._super(question);

            if (question.toolMode === BAR_CHART) {

                this.setBackground(window.bl.getResource('barchart_base'));
                
                for (var i = 4; i >= 0; i--) {
                    this.addDropZone({x:140 + (i * 155), y:145}, [{x:0, y:0}, {x:0, y:600}, {x:120, y:600}, {x:120, y:0}]);
                }

            } else if (question.toolMode === TABLE_DIAGRAM) {

                this.setBackground(window.bl.getResource('table_base'));
                
                var x_start = 370;
                var y_start = 205;

                var x_offset = 0;
                var y_offset = 0;
                this.addDropZone({x:x_start + x_offset, y:y_start + y_offset}, [{x:0, y:0}, {x:0, y:125}, {x:138, y:125}, {x:138, y:0}]);
                x_offset += 145;
                this.addDropZone({x:x_start + x_offset, y:y_start + y_offset}, [{x:0, y:0}, {x:0, y:125}, {x:138, y:125}, {x:138, y:0}]);
                y_offset += 130;
                this.addDropZone({x:x_start + x_offset, y:y_start + y_offset}, [{x:0, y:0}, {x:0, y:125}, {x:138, y:125}, {x:138, y:0}]);
                x_offset -= 145;
                this.addDropZone({x:x_start + x_offset, y:y_start + y_offset}, [{x:0, y:0}, {x:0, y:125}, {x:138, y:125}, {x:138, y:0}]);

            } else if (question.toolMode === VENN_DIAGRAM) {

                this.setBackground(window.bl.getResource('venn_base'));
                
                var circles = [
                    {
                        r: 175,
                        p: cc.p(245, 110),
                        label: question.symbols.sets.set0.label,
                        definitionURL: question.symbols.sets.set0.definitionURL
                    },
                    {
                        r: 175,
                        p: cc.p(428, 110),
                        label: question.symbols.sets.set1.label,
                        definitionURL: question.symbols.sets.set1.definitionURL
                    },
                    {
                        r: 175,
                        p: cc.p(335, 265),
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
                    self.addDropZone(c1.p, path, c1.label, c1.definitionURL);

                });
            }

            this.addSortables(question);

        }
    });

    ToolLayer.create = function () {
        var sg = new ToolLayer();
        if (sg && sg.init(cc.c4b(255, 255, 255, 255))) {
            return sg;
        }
        return null;
    };

    ToolLayer.scene = function () {
        var scene = cc.Scene.create();
        var layer = ToolLayer.create();
        scene.addChild(layer);

        scene.layer=layer;

        scene.ql = new QLayer();
        scene.ql.init();
        layer.addChild(scene.ql, 99);

        scene.update = function(dt) {
            this.layer.update(dt);
            this.ql.update(dt);
        };
        scene.scheduleUpdate();


        return scene;
    };

    exports.ToolLayer = Tool;

});
