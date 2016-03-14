/* global Y */
'use strict'

function extend (Y) {
  class YArray {
    constructor (os, _model, _content) {
      this.os = os
      this._model = _model
      // Array of all the neccessary content (includes id (string formatted, and element value))
      this._content = _content
      this.eventHandler = new Y.utils.EventHandler(ops => {
        var userEvents = []
        ops.forEach(op => {
          if (op.struct === 'Insert') {
            let pos
            // we check op.left only!,
            // because op.right might not be defined when this is called
            if (op.left === null) {
              pos = 0
            } else {
              let sid = JSON.stringify(op.left)
              pos = 1 + this._content.findIndex(function (c) {
                return c.id === sid
              })
              if (pos <= 0) {
                throw new Error('Unexpected operation!')
              }
            }
            var value
            var valueId = JSON.stringify(op.id)
            if (op.hasOwnProperty('opContent')) {
              this._content.splice(pos, 0, {
                id: valueId,
                type: op.opContent
              })
              let opContent = op.opContent
              if (opContent == null) {
                debugger // TODO!! 
              }
              value = () => {
                return new Promise(resolve => {
                  this.os.requestTransaction(function *() {
                    var type = yield* this.getType(opContent)
                    resolve(type)
                  })
                })
              }
            } else {
              this._content.splice(pos, 0, {
                id: valueId,
                val: op.content
              })
              value = op.content
            }
            userEvents.push({
              type: 'insert',
              object: this,
              index: pos,
              value: value,
              valueId: valueId,
              length: 1
            })
          } else if (op.struct === 'Delete') {
            let sid = JSON.stringify(op.target)
            let pos = this._content.findIndex(function (c) {
              return c.id === sid
            })
            if (pos >= 0) {
              let content = this._content[pos]
              this._content.splice(pos, 1)
              let value
              if (content.hasOwnProperty('val')) {
                value = content.val
              } else {
                value = () => {
                  return new Promise(resolve => {
                    this.os.requestTransaction(function *() {
                      var type = yield* this.getType(content.type)
                      resolve(type)
                    })
                  })
                }
              }
              userEvents.push({
                type: 'delete',
                object: this,
                index: pos,
                value: value,
                _content: content,
                length: 1
              })
            }
          } else {
            throw new Error('Unexpected struct!')
          }
        })
        this.eventHandler.callEventListeners(userEvents)
      })
    }
    _destroy () {
      this.eventHandler.destroy()
      this.eventHandler = null
      this._content = null
      this._model = null
      this.os = null
    }
    get length () {
      return this._content.length
    }
    get (pos) {
      if (pos == null || typeof pos !== 'number') {
        throw new Error('pos must be a number!')
      }
      if (pos >= this._content.length) {
        return undefined
      }
      if (this._content[pos].type == null) {
        return this._content[pos].val
      } else {
        var oid = this._content[pos].type
        return new Promise((resolve) => {
          this.os.requestTransaction(function *() {
            var type = yield* this.getType(oid)
            resolve(type)
          })
        })
      }
    }
    // only returns primitive values
    toArray () {
      return this._content.map(function (x, i) {
        return x.val
      })
    }
    push (contents) {
      this.insert(this._content.length, contents)
    }
    insert (pos, contents) {
      if (typeof pos !== 'number') {
        throw new Error('pos must be a number!')
      }
      if (!(contents instanceof Array)) {
        throw new Error('contents must be an Array of objects!')
      }
      if (contents.length === 0) {
        return
      }
      if (pos > this._content.length || pos < 0) {
        throw new Error('This position exceeds the range of the array!')
      }
      var mostLeft = pos === 0 ? null : JSON.parse(this._content[pos - 1].id)

      var ops = []
      var newTypes = []
      var prevId = mostLeft
      for (var i = 0; i < contents.length; i++) {
        var op = {
          left: prevId,
          origin: prevId,
          // right: mostRight,
          // NOTE: I intentionally do not define right here, because it could be deleted
          // at the time of inserting this operation (when we get the transaction),
          // and would therefore not defined in this._content
          parent: this._model,
          struct: 'Insert',
          id: this.os.getNextOpId()
        }
        var val = contents[i]
        var typeDefinition = Y.utils.isTypeDefinition(val)
        if (!typeDefinition) {
          op.content = val
        } else {
          var typeid = this.os.getNextOpId()
          newTypes.push([typeDefinition, typeid])
          op.opContent = typeid
        }
        ops.push(op)
        prevId = op.id
      }
      var eventHandler = this.eventHandler
      this.os.requestTransaction(function *() {
        // now we can set the right reference.
        var mostRight
        if (mostLeft != null) {
          mostRight = (yield* this.getOperation(mostLeft)).right
        } else {
          mostRight = (yield* this.getOperation(ops[0].parent)).start
        }
        for (var i = 0; i < newTypes.length; i++) {
          yield* this.createType.apply(this, newTypes[i])
        }
        for (var j = 0; j < ops.length; j++) {
          var op = ops[j]
          op.right = mostRight
        }
        yield* this.applyCreatedOperations(ops)
        eventHandler.awaitedInserts(ops.length)
      })
      eventHandler.awaitAndPrematurelyCall(ops)
    }
    delete (pos, length) {
      if (length == null) { length = 1 }
      if (typeof length !== 'number') {
        throw new Error('length must be a number!')
      }
      if (typeof pos !== 'number') {
        throw new Error('pos must be a number!')
      }
      if (pos + length > this._content.length || pos < 0 || length < 0) {
        throw new Error('The deletion range exceeds the range of the array!')
      }
      if (length === 0) {
        return
      }
      var eventHandler = this.eventHandler
      var newLeft = pos > 0 ? JSON.parse(this._content[pos - 1].id) : null
      var dels = []
      for (var i = 0; i < length; i++) {
        dels.push({
          target: JSON.parse(this._content[pos + i].id),
          struct: 'Delete'
        })
      }
      eventHandler.awaitAndPrematurelyCall(dels)
      this.os.requestTransaction(function *() {
        yield* this.applyCreatedOperations(dels)
        eventHandler.awaitedDeletes(dels.length, newLeft)
      })
    }
    observe (f) {
      this.eventHandler.addEventListener(f)
    }
    unobserve (f) {
      this.eventHandler.removeEventListener(f)
    }
    * _changed (transaction, op) {
      if (!op.deleted) {
        if (op.struct === 'Insert') {
          var l = op.left
          var left
          while (l != null) {
            left = yield* transaction.getOperation(l)
            if (!left.deleted) {
              break
            }
            l = left.left
          }
          op.left = l
        }
        this.eventHandler.receivedOp(op)
      }
    }
  }

  Y.extend('Array', new Y.utils.CustomType({
    name: 'Array', // TODO: copy the name when extending the object.. (see one line above)
    class: YArray,
    struct: 'List',
    initType: function * YArrayInitializer (os, model) {
      var _content = yield* Y.Struct.List.map.call(this, model, function (op) {
        var c = {
          id: JSON.stringify(op.id)
        }
        if (op.hasOwnProperty('opContent')) {
          c.type = op.opContent
        } else {
          c.val = op.content
        }
        return c
      })
      return new YArray(os, model.id, _content)
    }
  }))
}

module.exports = extend
if (typeof Y !== 'undefined') {
  extend(Y)
}
