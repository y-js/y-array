
import { wait, initArrays, compareUsers, Y, flushAll, flushSome } from './helper.js'
import test, { proxyConsole } from '../../../cutest/src/cutest.js'
import Chance from 'chance'

proxyConsole()

var database = { name: 'memory' }
var connector = { name: 'websockets-client', url: 'http://localhost:1234' }

var _uniqueNumber = 0
function getUniqueNumber () {
  return _uniqueNumber++
}

var arrayTransactions = [
  function insert (t, user, chance) {
    var uniqueNumber = getUniqueNumber()
    var content = []
    var len = chance.integer({ min: 1, max: 4 })
    for (var i = 0; i < len; i++) {
      content.push(uniqueNumber)
    }
    var pos = chance.integer({ min: 0, max: user.share.array.length })
    user.share.array.insert(pos, content)
  },
  /*
  function insertTypeArray (t, user, chance) {
    var pos = chance.integer({ min: 0, max: user.share.array.length })
    user.share.array.insert(pos, [Y.Array])
    var array2 = user.share.array.get(pos)
    array2.insert(0, [1, 2, 3, 4])
  },
  */
  function insertTypeMap (t, user, chance) {
    var pos = chance.integer({ min: 0, max: user.share.array.length })
    user.share.array.insert(pos, [Y.Map])
    var map = user.share.array.get(pos)
    map.set('someprop', 42)
    map.set('someprop', 43)
    map.set('someprop', 44)
  },
  function _delete (t, user, chance) {
    var length = user.share.array._content.length
    if (length > 0) {
      var pos = chance.integer({ min: 0, max: length - 1 })
      var delLength = chance.integer({ min: 1, max: Math.min(2, length - pos) })
      if (user.share.array._content[pos].type != null) {
        if (chance.bool()) {
          var type = user.share.array.get(pos)
          if (type instanceof Y.Array.typeDefinition.class) {
            if (type._content.length > 0) {
              pos = chance.integer({ min: 0, max: type._content.length - 1 })
              delLength = chance.integer({ min: 0, max: Math.min(2, type._content.length - pos) })
              type.delete(pos, delLength)
            }
          } else {
            type.delete('someprop')
          }
        } else {
          user.share.array.delete(pos, delLength)
        }
      } else {
        user.share.array.delete(pos, delLength)
      }
    }
  }
]

async function applyRandomTests (t, iterations) {
  const chance = new Chance(t.getSeed())
  var { users } = await initArrays(t, { users: 5, connector: connector, db: database })
  for (var i = 0; i < iterations; i++) {
    if (chance.integer({min: 0, max: 39}) === 0) {
      // 1/40 chance to disconnect/reconnect a user
      let user = chance.pickone(users)
      if (user.connector.isSynced) {
        await user.disconnect()
        await wait(100)
      } else {
        await user.reconnect()
        await wait(100)
        await new Promise(function (resolve) {
          user.connector.whenSynced(resolve)
        })
      }
    } else if (chance.integer({min: 0, max: 19}) === 0) {
    // 1/20 chance to flush all
      await flushAll(t, users)
    } else if (chance.integer({min: 0, max: 6}) === 0) {
      // 1/7 chance to flush some operations
      await flushSome(t, users)
    }
    let user = chance.pickone(users)
    var test = chance.pickone(arrayTransactions)
    test(t, user, chance)
  }
  await compareUsers(t, users)
}

test('y-array: Random tests (50)', async function random50 (t) {
  await applyRandomTests(t, 50)
})

test('y-array: Random tests (100)', async function random100 (t) {
  await applyRandomTests(t, 100)
})

test('y-array: Random tests (200)', async function random200 (t) {
  await applyRandomTests(t, 200)
})

test('y-array: Random tests (300)', async function random300 (t) {
  await applyRandomTests(t, 300)
})

test('y-array: Random tests (400)', async function random400 (t) {
  await applyRandomTests(t, 400)
})

test('y-array: Random tests (500)', async function random500 (t) {
  await applyRandomTests(t, 500)
})

test('y-array: Random tests (1000)', async function random1000 (t) {
  await applyRandomTests(t, 1000)
})
