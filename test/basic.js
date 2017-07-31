import { wait, initArrays, flushAll, compareUsers, Y, garbageCollectUsers } from '../../yjs/tests-lib/helper.js'
import { test, proxyConsole } from 'cutest'

proxyConsole()

var database = { name: 'memory' }
var connector = { name: 'test', url: 'http://localhost:1234' }

test('basic map tests', async function map0 (t) {
  let { users, map0, map1, map2 } = await initArrays(t, { users: 3, connector: connector, db: database })
  users[2].disconnect()

  map0.set('number', 1)
  map0.set('string', 'hello Y')
  map0.set('object', { key: { key2: 'value' } })
  map0.set('y-map', Y.Map)
  let map = map0.get('y-map')
  map.set('y-array', Y.Array)
  let array = map.get('y-array')
  array.insert(0, [0])
  array.insert(0, [-1])

  t.assert(map0.get('number') === 1, 'client 0 computed the change (number)')
  t.assert(map0.get('string') === 'hello Y', 'client 0 computed the change (string)')
  t.compare(map0.get('object'), { key: { key2: 'value' } }, 'client 0 computed the change (object)')
  t.assert(map0.get('y-map').get('y-array').get(0) === -1, 'client 0 computed the change (type)')

  await users[2].reconnect()
  await flushAll(t, users)

  t.assert(map1.get('number') === 1, 'client 1 received the update (number)')
  t.assert(map1.get('string') === 'hello Y', 'client 1 received the update (string)')
  t.compare(map1.get('object'), { key: { key2: 'value' } }, 'client 1 received the update (object)')
  t.assert(map1.get('y-map').get('y-array').get(0) === -1, 'client 1 received the update (type)')

  // compare disconnected user
  t.assert(map2.get('number') === 1, 'client 2 received the update (number) - was disconnected')
  t.assert(map2.get('string') === 'hello Y', 'client 2 received the update (string) - was disconnected')
  t.compare(map2.get('object'), { key: { key2: 'value' } }, 'client 2 received the update (object) - was disconnected')
  t.assert(map2.get('y-map').get('y-array').get(0) === -1, 'client 2 received the update (type) - was disconnected')
  await compareUsers(t, users)
})

test('basic spec', async function basic0 (t) {
  let { users, array0 } = await initArrays(t, { users: 2, connector: connector, db: database })

  array0.delete(0, 0)
  t.assert(true, 'Does not throw when deleting zero elements with position 0')

  let throwInvalidPosition = false
  try {
    array0.delete(1, 0)
  } catch (e) {
    throwInvalidPosition = true
  }
  t.assert(throwInvalidPosition, 'Throws when deleting zero elements with an invalid position')

  array0.insert(0, ['A'])
  array0.delete(1, 0)
  t.assert(true, 'Does not throw when deleting zero elements with valid position 1')

  await compareUsers(t, users)
})

test('insert three elements, try re-get property', async function basic1 (t) {
  var { users, array0, array1 } = await initArrays(t, { users: 2, connector: connector, db: database })
  array0.insert(0, [1, 2, 3])
  t.compare(array0.toArray(), [1, 2, 3], '.toArray() works')
  await flushAll(t, users)
  t.compare(array1.toArray(), [1, 2, 3], '.toArray() works after sync')
  await compareUsers(t, users)
})

test('concurrent insert (handle three conflicts)', async function basic2 (t) {
  var { users, array0, array1, array2 } = await initArrays(t, { users: 3, connector: connector, db: database })
  array0.insert(0, [0])
  array1.insert(0, [1])
  array2.insert(0, [2])

  await compareUsers(t, users)
})

test('concurrent insert&delete (handle three conflicts)', async function basic3 (t) {
  var { users, array0, array1, array2 } = await initArrays(t, { users: 3, connector: connector, db: database })
  window.users = users // TODO: udtrian
  array0.insert(0, ['x', 'y', 'z'])
  await flushAll(t, users)
  array0.insert(1, [0])
  array1.delete(0)
  array1.delete(1, 1)
  array2.insert(1, [2])

  await compareUsers(t, users)
})

test('insertions work in late sync', async function basic4 (t) {
  var { users, array0, array1, array2 } = await initArrays(t, { users: 3, connector: connector, db: database })
  array0.insert(0, ['x', 'y'])
  await flushAll(t, users)
  users[1].disconnect()
  users[2].disconnect()
  array0.insert(1, ['user0'])
  array1.insert(1, ['user1'])
  array2.insert(1, ['user2'])
  await users[1].reconnect()
  await users[2].reconnect()
  await compareUsers(t, users)
})

test('disconnect really prevents sending messages', async function basic5 (t) {
  var { users, array0, array1 } = await initArrays(t, { users: 3, connector: connector, db: database })
  array0.insert(0, ['x', 'y'])
  await flushAll(t, users)
  users[1].disconnect()
  users[2].disconnect()
  array0.insert(1, ['user0'])
  array1.insert(1, ['user1'])
  await wait(1000)
  t.compare(array0.toArray(), ['x', 'user0', 'y'])
  t.compare(array1.toArray(), ['x', 'user1', 'y'])
  await users[1].reconnect()
  await users[2].reconnect()
  await compareUsers(t, users)
})

test('deletions in late sync', async function basic6 (t) {
  var { users, array0, array1 } = await initArrays(t, { users: 2, connector: connector, db: database })
  array0.insert(0, ['x', 'y'])
  await flushAll(t, users)
  await users[1].disconnect()
  array1.delete(1, 1)
  array0.delete(0, 2)
  await wait()
  await users[1].reconnect()
  await compareUsers(t, users)
})

test('insert, then marge delete on sync', async function basic7 (t) {
  var { users, array0, array1 } = await initArrays(t, { users: 2, connector: connector, db: database })
  array0.insert(0, ['x', 'y', 'z'])
  await flushAll(t, users)
  await wait()
  await users[0].disconnect()
  array1.delete(0, 3)
  await wait()
  await users[0].reconnect()
  await compareUsers(t, users)
})

function compareEvent (t, is, should) {
  for (var key in should) {
    t.assert(
      should[key] === is[key] ||
      JSON.stringify(should[key]) === JSON.stringify(is[key])
    , 'event works as expected'
    )
  }
}

test('insert & delete events', async function basic8 (t) {
  var { array0, users } = await initArrays(t, { users: 2, connector: connector, db: database })
  var event
  array0.observe(function (e) {
    event = e
  })
  array0.insert(0, [0, 1, 2])
  compareEvent(t, event, {
    type: 'insert',
    index: 0,
    values: [0, 1, 2],
    length: 3
  })
  array0.delete(0)
  compareEvent(t, event, {
    type: 'delete',
    index: 0,
    length: 1,
    values: [0]
  })
  array0.delete(0, 2)
  compareEvent(t, event, {
    type: 'delete',
    index: 0,
    length: 2,
    values: [1, 2]
  })
  await compareUsers(t, users)
})

test('insert & delete events for types', async function basic9 (t) {
  var { array0, users } = await initArrays(t, { users: 2, connector: connector, db: database })
  var event
  array0.observe(function (e) {
    event = e
  })
  array0.insert(0, [Y.Array])
  compareEvent(t, event, {
    type: 'insert',
    object: array0,
    index: 0,
    length: 1
  })
  var type = array0.get(0)
  t.assert(type._model != null, 'Model of type is defined')
  array0.delete(0)
  compareEvent(t, event, {
    type: 'delete',
    object: array0,
    index: 0,
    length: 1
  })
  await compareUsers(t, users)
})

test('insert & delete events for types (2)', async function basic10 (t) {
  var { array0, users } = await initArrays(t, { users: 2, connector: connector, db: database })
  var events = []
  array0.observe(function (e) {
    events.push(e)
  })
  array0.insert(0, ['hi', Y.Map])
  compareEvent(t, events[0], {
    type: 'insert',
    object: array0,
    index: 0,
    length: 1,
    values: ['hi']
  })
  compareEvent(t, events[1], {
    type: 'insert',
    object: array0,
    index: 1,
    length: 1
  })
  array0.delete(1)
  compareEvent(t, events[2], {
    type: 'delete',
    object: array0,
    index: 1,
    length: 1
  })
  await compareUsers(t, users)
})

test('garbage collector', async function gc1 (t) {
  var { users, array0 } = await initArrays(t, { users: 3, connector: connector, db: database })

  array0.insert(0, ['x', 'y', 'z'])
  await flushAll(t, users)
  users[0].disconnect()
  array0.delete(0, 3)
  await wait()
  await users[0].reconnect()
  await flushAll(t, users)
  await garbageCollectUsers(t, users)
  await compareUsers(t, users)
})

test('event has correct value when setting a primitive on a YArray (same user)', async function basic11 (t) {
  var { array0, users } = await initArrays(t, { users: 3, connector: connector, db: database })

  var event
  array0.observe(function (e) {
    event = e
  })
  array0.insert(0, ['stuff'])
  t.assert(event.values[0] === event.object.get(0), 'compare value with get method')
  t.assert(event.values[0] === 'stuff', 'check that value is actually present')
  t.assert(event.values[0] === array0.toArray()[0], '.toArray works as expected')
  await compareUsers(t, users)
})

test('event has correct value when setting a primitive on a YArray (received from another user)', async function basic12 (t) {
  var { users, array0, array1 } = await initArrays(t, { users: 3, connector: connector, db: database })

  var event
  array0.observe(function (e) {
    event = e
  })
  array1.insert(0, ['stuff'])
  await flushAll(t, users)
  t.assert(event.values[0] === event.object.get(0), 'compare value with get method')
  t.assert(event.values[0] === 'stuff', 'check that value is actually present')
  t.assert(event.values[0] === array0.toArray()[0], '.toArray works as expected')
  await compareUsers(t, users)
})

test('event has correct value when setting a type on a YArray (same user)', async function basic13 (t) {
  var { array0, users } = await initArrays(t, { users: 3, connector: connector, db: database })

  var event
  array0.observe(function (e) {
    event = e
  })
  array0.insert(0, [Y.Array])
  t.assert(event.values[0] === event.object.get(0), 'compare value with get method')
  t.assert(event.values[0] != null, 'event.value exists')
  t.assert(event.values[0] === array0.toArray()[0], '.toArray works as expected')
  await compareUsers(t, users)
})
test('event has correct value when setting a type on a YArray (ops received from another user)', async function basic14 (t) {
  var { users, array0, array1 } = await initArrays(t, { users: 3, connector: connector, db: database })

  var event
  array0.observe(function (e) {
    event = e
  })
  array1.insert(0, [Y.Array])
  await flushAll(t, users)
  t.assert(event.values[0] === event.object.get(0), 'compare value with get method')
  t.assert(event.values[0] != null, 'event.value exists')
  t.assert(event.values[0] === array0.toArray()[0], '.toArray works as expected')
  await compareUsers(t, users)
})
