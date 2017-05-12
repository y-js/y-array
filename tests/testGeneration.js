
import { initArrays, compareUsers, Y } from './helper.js'
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

test('Array test generation', async function random1 (t) {
  const chance = new Chance(t.getSeed())
  var { users } = await initArrays(t, { users: 5, connector: connector, db: database })
  for (var i = 0; i < 50; i++) {
    var user = chance.pickone(users)
    var test = chance.pickone(arrayTransactions)
    test(t, user, chance)
  }
  await compareUsers(t, users)
})
