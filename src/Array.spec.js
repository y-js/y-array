/* global createUsers, databases, wait, compareAllUsers, getRandomNumber, applyRandomTransactionsNoGCNoDisconnect, applyRandomTransactionsAllRejoinNoGC, applyRandomTransactionsWithGC, async, garbageCollectAllUsers, describeManyTimes */
/* eslint-env browser,jasmine */
'use strict'

var Y = require('../../yjs/src/SpecHelper.js')

function compareEvent (is, should) {
  expect(is.length).toEqual(should.length)
  for (var i = 0; i < is.length; i++) {
    for (var key in should[i]) {
      expect(should[i][key]).toEqual(is[i][key])
    }
  }
}

var numberOfYArrayTests = 1000
var repeatArrayTests = 10

for (let database of databases) {
  describe(`Array Type (DB: ${database})`, function () {
    var y1, y2, y3, yconfig1, yconfig2, yconfig3, flushAll

    beforeEach(async(function * (done) {
      yield createUsers(this, 3, database)
      y1 = (yconfig1 = this.users[0]).share.root
      y2 = (yconfig2 = this.users[1]).share.root
      y3 = (yconfig3 = this.users[2]).share.root
      flushAll = Y.utils.globalRoom.flushAll
      yield wait(10)
      done()
    }))
    afterEach(async(function * (done) {
      yield compareAllUsers(this.users)
      done()
    }))

    describe('Basic tests', function () {
      it('insert three elements, try re-get property', async(function * (done) {
        var array = yield y1.set('Array', Y.Array)
        array.insert(0, [1, 2, 3])
        array = yield y1.get('Array') // re-get property
        expect(array.toArray()).toEqual([1, 2, 3])
        done()
      }))
      it('Basic insert in array (handle three conflicts)', async(function * (done) {
        yield y1.set('Array', Y.Array)
        yield flushAll()
        var l1 = yield y1.get('Array')
        l1.insert(0, [0])
        var l2 = yield y2.get('Array')
        l2.insert(0, [1])
        var l3 = yield y3.get('Array')
        l3.insert(0, [2])
        yield flushAll()
        expect(l1.toArray()).toEqual(l2.toArray())
        expect(l2.toArray()).toEqual(l3.toArray())
        done()
      }))
      it('Basic insert&delete in array (handle three conflicts)', async(function * (done) {
        var l1, l2, l3
        l1 = yield y1.set('Array', Y.Array)
        l1.insert(0, ['x', 'y', 'z'])
        yield flushAll()
        l1.insert(1, [0])
        l2 = yield y2.get('Array')
        l2.delete(0)
        l2.delete(1)
        l3 = yield y3.get('Array')
        l3.insert(1, [2])
        yield flushAll()
        expect(l1.toArray()).toEqual(l2.toArray())
        expect(l2.toArray()).toEqual(l3.toArray())
        expect(l2.toArray()).toEqual([0, 2, 'y'])
        done()
      }))
      it('Handles getOperations ascending ids bug in late sync', async(function * (done) {
        var l1, l2
        l1 = yield y1.set('Array', Y.Array)
        l1.insert(0, ['x', 'y'])
        yield flushAll()
        yconfig3.disconnect()
        yconfig2.disconnect()
        yield wait()
        l2 = yield y2.get('Array')
        l2.insert(1, [2])
        l2.insert(1, [3])
        yield yconfig2.reconnect()
        yield yconfig3.reconnect()
        expect(l1.toArray()).toEqual(l2.toArray())
        done()
      }))
      it('Handles deletions in late sync', async(function * (done) {
        var l1, l2
        l1 = yield y1.set('Array', Y.Array)
        l1.insert(0, ['x', 'y'])
        yield flushAll()
        yield yconfig2.disconnect()
        yield wait()
        l2 = yield y2.get('Array')
        l2.delete(1, 1)
        l1.delete(0, 2)
        yield yconfig2.reconnect()
        expect(l1.toArray()).toEqual(l2.toArray())
        done()
      }))
      it('Handles deletions in late sync (2)', async(function * (done) {
        var l1, l2
        l1 = yield y1.set('Array', Y.Array)
        yield flushAll()
        l2 = yield y2.get('Array')
        l1.insert(0, ['x', 'y'])
        l1.delete(0, 2)
        yield flushAll()
        expect(l1.toArray()).toEqual(l2.toArray())
        done()
      }))
      it('Basic insert. Then delete the whole array', async(function * (done) {
        var l1, l2, l3
        l1 = yield y1.set('Array', Y.Array)
        l1.insert(0, ['x', 'y', 'z'])
        yield flushAll()
        l1.delete(0, 3)
        l2 = yield y2.get('Array')
        l3 = yield y3.get('Array')
        yield flushAll()
        expect(l1.toArray()).toEqual(l2.toArray())
        expect(l2.toArray()).toEqual(l3.toArray())
        expect(l2.toArray()).toEqual([])
        done()
      }))
      it('Basic insert. Then delete the whole array (merge listeners on late sync)', async(function * (done) {
        var l1, l2, l3
        l1 = yield y1.set('Array', Y.Array)
        l1.insert(0, ['x', 'y', 'z'])
        yield flushAll()
        yield yconfig2.disconnect()
        l1.delete(0, 3)
        l2 = yield y2.get('Array')
        yield wait()
        yield yconfig2.reconnect()
        yield wait()
        l3 = yield y3.get('Array')
        yield flushAll()
        expect(l1.toArray()).toEqual(l2.toArray())
        expect(l2.toArray()).toEqual(l3.toArray())
        expect(l2.toArray()).toEqual([])
        done()
      }))
      // TODO?
      /* it('Basic insert. Then delete the whole array (merge deleter on late sync)', async(function * (done) {
        var l1, l2, l3
        l1 = yield y1.set('Array', Y.Array)
        l1.insert(0, ['x', 'y', 'z'])
        yield flushAll()
        yconfig1.disconnect()
        l1.delete(0, 3)
        l2 = yield y2.get('Array')
        yield yconfig1.reconnect()
        l3 = yield y3.get('Array')
        yield flushAll()
        expect(l1.toArray()).toEqual(l2.toArray())
        expect(l2.toArray()).toEqual(l3.toArray())
        expect(l2.toArray()).toEqual([])
        done()
      })) */
      it('throw insert & delete events', async(function * (done) {
        var array = yield this.users[0].share.root.set('array', Y.Array)
        var event
        array.observe(function (e) {
          event = e
        })
        array.insert(0, [0])
        compareEvent(event, [{
          type: 'insert',
          index: 0,
          value: 0,
          length: 1
        }])
        array.delete(0)
        compareEvent(event, [{
          type: 'delete',
          index: 0,
          length: 1,
          value: 0
        }])
        yield wait(50)
        done()
      }))
      it('throw insert & delete events for types', async(function * (done) {
        var array = yield this.users[0].share.root.set('array', Y.Array)
        var event
        array.observe(function (e) {
          event = e
        })
        array.insert(0, [Y.Array])
        delete event[0].value
        compareEvent(event, [{
          type: 'insert',
          object: array,
          index: 0,
          length: 1
        }])
        var type = yield array.get(0)
        expect(type._model).toBeTruthy()
        array.delete(0)
        delete event[0].value
        compareEvent(event, [{
          type: 'delete',
          object: array,
          index: 0,
          length: 1
        }])
        yield wait(50)
        yield garbageCollectAllUsers(this.users)
        // expect(type._content == null).toBeTruthy() TODO: make sure everything is cleaned up!
        done()
      }))
      it('throw insert & delete events for types (2)', async(function * (done) {
        var array = yield this.users[0].share.root.set('array', Y.Array)
        var event
        array.observe(function (e) {
          event = e
        })
        array.insert(0, ['hi', Y.Map])
        delete event[1].value
        compareEvent(event, [{
          type: 'insert',
          object: array,
          index: 0,
          length: 1,
          value: 'hi'
        },
        {
          type: 'insert',
          object: array,
          index: 1,
          length: 1
        }])
        array.delete(1)
        delete event[0].value
        compareEvent(event, [{
          type: 'delete',
          object: array,
          index: 1,
          length: 1
        }])
        yield wait(50)
        done()
      }))
      it('garbage collects', async(function * (done) {
        var l1, l2, l3
        l1 = yield y1.set('Array', Y.Array)
        l1.insert(0, ['x', 'y', 'z'])
        yield flushAll()
        yconfig1.disconnect()
        l1.delete(0, 3)
        l2 = yield y2.get('Array')
        yield wait()
        yield yconfig1.reconnect()
        yield wait()
        l3 = yield y3.get('Array')
        yield flushAll()
        yield garbageCollectAllUsers(this.users)
        expect(l1.toArray()).toEqual(l2.toArray())
        expect(l2.toArray()).toEqual(l3.toArray())
        expect(l2.toArray()).toEqual([])
        done()
      }))
      /* ** not compatible with new gc algorithm **
      it('debug right not existend in Insert.execute', async(function * (done) {
        yconfig1.db.requestTransaction(function * () {
          var ops = [
            {'struct': 'Map', 'type': 'Map', 'id': ['130', 0],'map': {}},
            {'id': ['130', 1], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_root'], 'struct': 'Insert', 'parentSub': 'Map', 'opContent': ['130', 0]},
            {'struct': 'Map', 'type': 'Map', 'id': ['130', 0], 'map': {}},
            {'id': ['130', 1], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_root'], 'struct': 'Insert', 'parentSub': 'Map', 'opContent': ['130', 0]},
            {'struct': 'Map', 'type': 'Map', 'id': ['130', 0], 'map': {}},
            {'id': ['130', 1], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_root'], 'struct': 'Insert', 'parentSub': 'Map', 'opContent': ['130', 0]},
            {'left': null, 'right': null, 'origin': null, 'parent': ['130', 0], 'parentSub': 'somekey', 'struct': 'Insert', 'content': 512, 'id': ['133', 0]},
            {'id': ['130', 2], 'left': null, 'right': null, 'origin': null, 'parent': ['130', 0], 'struct': 'Insert', 'parentSub': 'somekey', 'content': 1131},
            {'id': ['130', 3], 'left': null, 'right': ['130', 2], 'origin': null, 'parent': ['130', 0], 'struct': 'Insert', 'parentSub': 'somekey', 'content': 4196},
            {'id': ['131', 3], 'left': null, 'right': null, 'origin': null, 'parent': ['130', 0], 'struct': 'Insert', 'parentSub': 'somekey', 'content': 5022}
          ] // eslint-disable-line

          for (var o of ops) {
            yield* this.store.tryExecute.call(this, o)
          }
        })
        yield wait()
        yield yconfig3.disconnect()
        yield yconfig2.disconnect()
        yield flushAll()
        wait()
        yield yconfig3.reconnect()
        yield yconfig2.reconnect()
        yield wait()
        yield flushAll()
        done()
      }))
      it('debug right not existend in Insert.execute (2)', async(function * (done) {
        yconfig1.db.requestTransaction(function * () {
          yield* this.store.tryExecute.call(this, {'struct': 'Map', 'type': 'Map', 'id': ['153', 0], 'map': {}})
          yield* this.store.tryExecute.call(this, {'id': ['153', 1], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_root'], 'struct': 'Insert', 'parentSub': 'Map', 'opContent': ['153', 0]})
          yield* this.store.tryExecute.call(this, {'struct': 'Map', 'type': 'Map', 'id': ['153', 0], 'map': {}})
          yield* this.store.tryExecute.call(this, {'id': ['153', 1], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_root'], 'struct': 'Insert', 'parentSub': 'Map', 'opContent': ['153', 0]})
          yield* this.store.tryExecute.call(this, {'struct': 'Map', 'type': 'Map', 'id': ['153', 0], 'map': {}})
          yield* this.store.tryExecute.call(this, {'id': ['153', 1], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_root'], 'struct': 'Insert', 'parentSub': 'Map', 'opContent': ['153', 0]})
          yield* this.store.tryExecute.call(this, {'left': null, 'right': null, 'origin': null, 'parent': ['153', 0], 'parentSub': 'somekey', 'struct': 'Insert', 'content': 3784, 'id': ['154', 0]})
          yield* this.store.tryExecute.call(this, {'left': null, 'right': ['154', 0], 'origin': null, 'parent': ['153', 0], 'parentSub': 'somekey', 'struct': 'Insert', 'content': 8217, 'id': ['154', 1]})
          yield* this.store.tryExecute.call(this, {'left': null, 'right': ['154', 1], 'origin': null, 'parent': ['153', 0], 'parentSub': 'somekey', 'struct': 'Insert', 'content': 5036, 'id': ['154', 2]})
          yield* this.store.tryExecute.call(this, {'id': ['153', 2], 'left': null, 'right': null, 'origin': null, 'parent': ['153', 0], 'struct': 'Insert', 'parentSub': 'somekey', 'content': 417})
          yield* this.store.tryExecute.call(this, {'id': ['155', 0], 'left': null, 'right': null, 'origin': null, 'parent': ['153', 0], 'struct': 'Insert', 'parentSub': 'somekey', 'content': 2202})
          yield* this.garbageCollectOperation(['153', 2])
          yield* this.garbageCollectOperation(['154', 0])
          yield* this.garbageCollectOperation(['154', 1])
          yield* this.garbageCollectOperation(['154', 2])
          yield* this.garbageCollectOperation(['155', 0])
          yield* this.garbageCollectOperation(['156', 0])
          yield* this.garbageCollectOperation(['157', 0])
          yield* this.garbageCollectOperation(['157', 1])
          yield* this.store.tryExecute.call(this, {'id': ['153', 3], 'left': null, 'right': null, 'origin': null, 'parent': ['153', 0], 'struct': 'Insert', 'parentSub': 'somekey', 'content': 4372})
        })
        yield wait()
        yield yconfig3.disconnect()
        yield yconfig2.disconnect()
        yield flushAll()
        yield wait()
        yield yconfig3.reconnect()
        yield yconfig2.reconnect()
        yield wait()
        yield flushAll()
        done()
      }))*/
    })
    describeManyTimes(repeatArrayTests, `Random tests`, function () {
      var randomArrayTransactions = [
        function insert (array) {
          array.insert(getRandomNumber(array.toArray().length), [getRandomNumber()])
        },
        function insertTypeArray (array) {
          var pos = getRandomNumber(array.toArray().length)
          array.insert(pos, [Y.Array])
          array.get(pos).then(function (array) {
            array.insert(0, [1, 2, 3, 4])
          })
        },
        function insertTypeMap (array) {
          var pos = getRandomNumber(array.toArray().length)
          array.insert(pos, [Y.Map])
          array.get(pos).then(function (map) {
            map.set('someprop', 42)
            map.set('someprop', 43)
            map.set('someprop', 44)
          })
        },
        function _delete (array) {
          var length = array.toArray().length
          if (length > 0) {
            var pos = getRandomNumber(length - 1)
            if (array._content[pos].type != null) {
              if (getRandomNumber(1) === 1) {
                array.get(pos).then(function (map) {
                  map.delete('someprop')
                })
              } else {
                array.delete(pos)
              }
            } else {
              array.delete(pos)
            }
          }
        }
      ]
      function compareArrayValues (arrays) {
        var firstArray
        for (var l of arrays) {
          var val = l.toArray()
          if (firstArray == null) {
            firstArray = val
          } else {
            expect(val).toEqual(firstArray)
          }
        }
      }
      beforeEach(async(function * (done) {
        yield this.users[0].share.root.set('Array', Y.Array)
        yield flushAll()

        var promises = []
        for (var u = 0; u < this.users.length; u++) {
          promises.push(this.users[u].share.root.get('Array'))
        }
        this.arrays = yield Promise.all(promises)
        done()
      }))
      it('arrays.length equals users.length', async(function * (done) {
        expect(this.arrays.length).toEqual(this.users.length)
        done()
      }))
      it(`succeed after ${numberOfYArrayTests} actions, no GC, no disconnect`, async(function * (done) {
        yield applyRandomTransactionsNoGCNoDisconnect(this.users, this.arrays, randomArrayTransactions, numberOfYArrayTests)
        // yield flushAll()
        // yield compareArrayValues(this.arrays)
        // yield compareAllUsers(this.users)
        done()
      }))
      it(`succeed after ${numberOfYArrayTests} actions, no GC, all users disconnecting/reconnecting`, async(function * (done) {
        yield applyRandomTransactionsAllRejoinNoGC(this.users, this.arrays, randomArrayTransactions, numberOfYArrayTests)
        yield flushAll()
        yield compareArrayValues(this.arrays)
        yield compareAllUsers(this.users)
        done()
      }))
      it(`succeed after ${numberOfYArrayTests} actions, GC, user[0] is not disconnecting`, async(function * (done) {
        yield applyRandomTransactionsWithGC(this.users, this.arrays, randomArrayTransactions, numberOfYArrayTests)
        yield flushAll()
        yield compareArrayValues(this.arrays)
        yield compareAllUsers(this.users)
        done()
      }))
    })
  })
}
