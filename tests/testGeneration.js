
import { wait, initArrays, compareUsers, Y, flushAll, flushSome } from '../../yjs/tests-lib/helper.js'
import { test, proxyConsole } from '../../../cutest/cutest.mjs'
import Chance from 'chance'

proxyConsole()

var database = { name: 'memory' }
var connector = { name: 'test', url: 'http://localhost:1234' }

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
  const chance = new Chance(t.getSeed() * 1000000000)
  var { users } = await initArrays(t, { users: 5, connector: connector, db: database, chance: chance })
  for (var i = 0; i < iterations; i++) {
    if (chance.bool({likelihood: 10})) {
      // 10% chance to disconnect/reconnect a user
      let user = chance.pickone(users)
      if (user.connector.isSynced) {
        if (users.filter(u => u.connector.isSynced).length > 1) {
          // make sure that at least one user remains in the room
          await user.disconnect()
          if (users[0].connector.testRoom == null) {
            await wait(100)
          }
        }
      } else {
        await user.reconnect()
        if (users[0].connector.testRoom == null) {
          await wait(100)
        }
        await new Promise(function (resolve) {
          user.connector.whenSynced(resolve)
        })
      }
    } else if (chance.bool({likelihood: 20})) {
      // 20%*!prev chance to flush all
      await flushAll(t, users)
    } else if (chance.bool({likelihood: 20})) {
      // 20%*!prev chance to flush some operations
      await flushSome(t, users)
    }
    let user = chance.pickone(users)
    var test = chance.pickone(arrayTransactions)
    test(t, user, chance)
  }
  await compareUsers(t, users)
}

test('y-array: Random tests (42)', async function random42 (t) {
  await applyRandomTests(t, 42)
})

test('y-array: Random tests (43)', async function random43 (t) {
  await applyRandomTests(t, 43)
})

test('y-array: Random tests (44)', async function random44 (t) {
  await applyRandomTests(t, 44)
})

test('y-array: Random tests (45)', async function random45 (t) {
  await applyRandomTests(t, 45)
})

test('y-array: Random tests (46)', async function random46 (t) {
  await applyRandomTests(t, 46)
})

test('y-array: Random tests (47)', async function random47 (t) {
  await applyRandomTests(t, 47)
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
