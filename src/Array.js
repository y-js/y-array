/* global Y */
'use strict'

function extend (Y) {
  class YArray {
    constructor (os, _model, _content) {
      this.os = os
      this._model = _model
      // Array of all the neccessary content
      this._content = _content
      this.eventHandler = new Y.utils.EventHandler(op => {
        if (op.struct === 'Insert') {
          let pos
          // we check op.left only!,
          // because op.right might not be defined when this is called
          if (op.left === null) {
            pos = 0
          } else {
            pos = 1 + this._content.findIndex(function (c) {
              return Y.utils.compareIds(c.id, op.left)
            })
            if (pos <= 0) {
              throw new Error('Unexpected operation!')
            }
          }
          var values
          var length
          if (op.hasOwnProperty('opContent')) {
            this._content.splice(pos, 0, {
              id: op.id,
              type: op.opContent
            })
            let opContent = op.opContent
            length = 1
            values = () => {
              return new Promise(resolve => {
                this.os.requestTransaction(function *() {
                  var type = yield* this.getType(opContent)
                  resolve([type])
                })
              })
            }
          } else {
            var contents = op.content.map(function (c, i) {
              return {
                id: [op.id[0], op.id[1] + i],
                val: c
              }
            })
            // insert value in _content
            this._content.splice.apply(this._content, [pos, 0].concat(contents))
            values = op.content
            length = op.content.length
          }
          this.eventHandler.callEventListeners({
            type: 'insert',
            object: this,
            index: pos,
            values: values,
            // valueId: valueId, // TODO: does this still work as expected?
            length: length
          })
        } else if (op.struct === 'Delete') {
          let pos = this._content.findIndex(function (c) {
            return Y.utils.compareIds(c.id, op.target)
          })
          if (pos >= 0) {
            let content = this._content.splice(pos, op.length || 1)
            let values = content.map((c) => {
              return c.val
            })
            this.eventHandler.callEventListeners({
              type: 'delete',
              object: this,
              index: pos,
              values: values,
              _content: content,
              length: op.length || 1
            })
          }
        } else {
          throw new Error('Unexpected struct!')
        }
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
      return this.insert(this._content.length, contents)
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
      var mostLeft = pos === 0 ? null : this._content[pos - 1].id

      var ops = []
      var newTypes = []
      var prevId = mostLeft
      // TODOː use new content_s_ feature. don't iterate
      for (var i = 0; i < contents.length;) {
        var op = {
          left: prevId,
          origin: prevId,
          // right: mostRight,
          // NOTE: I intentionally do not define right here, because it could be deleted
          // at the time of inserting this operation (when we get the transaction),
          // and would therefore not defined in this._content
          parent: this._model,
          struct: 'Insert'
        }
        var _content = []
        var typeDefinition
        while (i < contents.length) {
          var val = contents[i++]
          typeDefinition = Y.utils.isTypeDefinition(val)
          if (!typeDefinition) {
            _content.push(val)
          } else if (_content.length > 0) {
            i-- // come back again later
            break
          } else {
            break
          }
        }
        if (_content.length > 0) {
          // content is defined
          op.content = _content
          op.id = this.os.getNextOpId(_content.length)
        } else {
          // otherwise its a type
          var typeid = this.os.getNextOpId(1)
          newTypes.push([typeDefinition, typeid])
          op.opContent = typeid
          op.id = this.os.getNextOpId(1)
        }
        ops.push(op)
        prevId = op.id
      }
      var eventHandler = this.eventHandler
      this.os.requestTransaction(function *() {
        // now we can set the right reference.
        var mostRight
        if (mostLeft != null) {
          var ml = yield* this.getInsertionCleanEnd(mostLeft)
          mostRight = ml.right
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
      var newLeft = pos > 0 ? this._content[pos - 1].id : null
      var dels = []
      for (var i = 0; i < length; i = i + delLength) {
        var targetId = this._content[pos + i].id
        var delLength
        // how many insertions can we delete in one deletion?
        for (delLength = 1; i + delLength < length; delLength++) {
          if (!Y.utils.compareIds(this._content[pos + i + delLength].id, [targetId[0], targetId[1] + delLength])) {
            break
          }
        }
        dels.push({
          target: targetId,
          struct: 'Delete',
          length: delLength
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
            left = yield* transaction.getInsertion(l)
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
    name: 'Array',
    class: YArray,
    struct: 'List',
    initType: function * YArrayInitializer (os, model) {
      var _content = []
      yield* Y.Struct.List.map.call(this, model, function (op) {
        if (op.hasOwnProperty('opContent')) {
          _content.push({
            id: op.id,
            type: op.opContent
          })
        } else {
          op.content.forEach(function (c, i) {
            _content.push({
              id: [op.id[0], op.id[1] + i],
              val: op.content[i]
            })
          })
        }
      })
      return new YArray(os, model.id, _content)
    }
  }))
}

module.exports = extend
if (typeof Y !== 'undefined') {
  extend(Y)
}
