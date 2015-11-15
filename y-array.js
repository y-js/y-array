(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global Y */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function extend(Y) {
  var YArray = (function () {
    function YArray(os, _model, idArray, valArray) {
      var _this = this;

      _classCallCheck(this, YArray);

      this.os = os;
      this._model = _model;
      // Array of all the operation id's
      this.idArray = idArray;
      // Array of all the values
      this.valArray = valArray;
      this.eventHandler = new Y.utils.EventHandler(function (ops) {
        var userEvents = [];
        for (var i in ops) {
          var op = ops[i];
          if (op.struct === 'Insert') {
            var pos = undefined;
            // we check op.left only!,
            // because op.right might not be defined when this is called
            if (op.left === null) {
              pos = 0;
            } else {
              var sid = JSON.stringify(op.left);
              pos = _this.idArray.indexOf(sid) + 1;
              if (pos <= 0) {
                throw new Error('Unexpected operation!');
              }
            }
            _this.idArray.splice(pos, 0, JSON.stringify(op.id));
            _this.valArray.splice(pos, 0, op.content);
            userEvents.push({
              type: 'insert',
              object: _this,
              index: pos,
              length: 1
            });
          } else if (op.struct === 'Delete') {
            var pos = _this.idArray.indexOf(JSON.stringify(op.target));
            if (pos >= 0) {
              _this.idArray.splice(pos, 1);
              _this.valArray.splice(pos, 1);
              userEvents.push({
                type: 'delete',
                object: _this,
                index: pos,
                length: 1
              });
            }
          } else {
            throw new Error('Unexpected struct!');
          }
        }
        _this.eventHandler.callEventListeners(userEvents);
      });
    }

    _createClass(YArray, [{
      key: 'get',
      value: function get(pos) {
        if (pos == null || typeof pos !== 'number') {
          throw new Error('pos must be a number!');
        }
        return this.valArray[pos];
      }
    }, {
      key: 'toArray',
      value: function toArray() {
        return this.valArray.slice();
      }
    }, {
      key: 'insert',
      value: function insert(pos, contents) {
        if (typeof pos !== 'number') {
          throw new Error('pos must be a number!');
        }
        if (!(contents instanceof Array)) {
          throw new Error('contents must be an Array of objects!');
        }
        if (contents.length === 0) {
          return;
        }
        if (pos > this.idArray.length || pos < 0) {
          throw new Error('This position exceeds the range of the array!');
        }
        var mostLeft = pos === 0 ? null : JSON.parse(this.idArray[pos - 1]);

        var ops = [];
        var prevId = mostLeft;
        for (var i = 0; i < contents.length; i++) {
          var op = {
            left: prevId,
            origin: prevId,
            // right: mostRight,
            // NOTE: I intentionally do not define right here, because it could be deleted
            // at the time of creating this operation, and is therefore not defined in idArray
            parent: this._model,
            content: contents[i],
            struct: 'Insert',
            id: this.os.getNextOpId()
          };
          ops.push(op);
          prevId = op.id;
        }
        var eventHandler = this.eventHandler;
        eventHandler.awaitAndPrematurelyCall(ops);
        this.os.requestTransaction(regeneratorRuntime.mark(function _callee() {
          var mostRight, j;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!(mostLeft != null)) {
                    _context.next = 5;
                    break;
                  }

                  return _context.delegateYield(this.getOperation(mostLeft), 't0', 2);

                case 2:
                  mostRight = _context.t0.right;
                  _context.next = 7;
                  break;

                case 5:
                  return _context.delegateYield(this.getOperation(ops[0].parent), 't1', 6);

                case 6:
                  mostRight = _context.t1.start;

                case 7:
                  for (j in ops) {
                    ops[j].right = mostRight;
                  }
                  return _context.delegateYield(this.applyCreatedOperations(ops), 't2', 9);

                case 9:
                  eventHandler.awaitedInserts(ops.length);

                case 10:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));
      }
    }, {
      key: 'delete',
      value: function _delete(pos, length) {
        if (length == null) {
          length = 1;
        }
        if (typeof length !== 'number') {
          throw new Error('pos must be a number!');
        }
        if (typeof pos !== 'number') {
          throw new Error('pos must be a number!');
        }
        if (pos + length > this.idArray.length || pos < 0 || length < 0) {
          throw new Error('The deletion range exceeds the range of the array!');
        }
        if (length === 0) {
          return;
        }
        var eventHandler = this.eventHandler;
        var newLeft = pos > 0 ? JSON.parse(this.idArray[pos - 1]) : null;
        var dels = [];
        for (var i = 0; i < length; i++) {
          dels.push({
            target: JSON.parse(this.idArray[pos + i]),
            struct: 'Delete'
          });
        }
        eventHandler.awaitAndPrematurelyCall(dels);
        this.os.requestTransaction(regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  return _context2.delegateYield(this.applyCreatedOperations(dels), 't0', 1);

                case 1:
                  eventHandler.awaitedDeletes(dels.length, newLeft);

                case 2:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));
      }
    }, {
      key: 'observe',
      value: function observe(f) {
        this.eventHandler.addEventListener(f);
      }
    }, {
      key: '_changed',
      value: regeneratorRuntime.mark(function _changed(transaction, op) {
        var l, left;
        return regeneratorRuntime.wrap(function _changed$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (op.deleted) {
                  _context3.next = 13;
                  break;
                }

                if (!(op.struct === 'Insert')) {
                  _context3.next = 12;
                  break;
                }

                l = op.left;

              case 3:
                if (!(l != null)) {
                  _context3.next = 11;
                  break;
                }

                return _context3.delegateYield(transaction.getOperation(l), 't0', 5);

              case 5:
                left = _context3.t0;

                if (left.deleted) {
                  _context3.next = 8;
                  break;
                }

                return _context3.abrupt('break', 11);

              case 8:
                l = left.left;
                _context3.next = 3;
                break;

              case 11:
                op.left = l;

              case 12:
                this.eventHandler.receivedOp(op);

              case 13:
              case 'end':
                return _context3.stop();
            }
          }
        }, _changed, this);
      })
    }, {
      key: 'length',
      get: function get() {
        return this.idArray.length;
      }
    }]);

    return YArray;
  })();

  Y.extend('Array', new Y.utils.CustomType({
    class: YArray,
    createType: regeneratorRuntime.mark(function YArrayCreator() {
      var modelid, model;
      return regeneratorRuntime.wrap(function YArrayCreator$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              modelid = this.store.getNextOpId();
              model = {
                struct: 'List',
                type: 'Array',
                start: null,
                end: null,
                id: modelid
              };
              return _context4.delegateYield(this.applyCreatedOperations([model]), 't0', 3);

            case 3:
              return _context4.abrupt('return', modelid);

            case 4:
            case 'end':
              return _context4.stop();
          }
        }
      }, YArrayCreator, this);
    }),
    initType: regeneratorRuntime.mark(function YArrayInitializer(os, model) {
      var valArray, idArray;
      return regeneratorRuntime.wrap(function YArrayInitializer$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              valArray = [];
              return _context5.delegateYield(Y.Struct.List.map.call(this, model, function (c) {
                valArray.push(c.content);
                return JSON.stringify(c.id);
              }), 't0', 2);

            case 2:
              idArray = _context5.t0;
              return _context5.abrupt('return', new YArray(os, model.id, idArray, valArray));

            case 4:
            case 'end':
              return _context5.stop();
          }
        }
      }, YArrayInitializer, this);
    })
  }));
}

module.exports = extend;
if (typeof Y !== 'undefined') {
  extend(Y);
}

},{}]},{},[1])

