import { wait, initArrays, flushAll, compareUsers } from './testHelper.js'
import test, { proxyConsole } from '../../../cutest/src/cutest.js'

proxyConsole()

var database = { name: 'memory' }
var connector = { name: 'websockets-client', url: 'http://localhost:1234' }

test(`insert three elements, try re-get property`, async function basic1 (t) {
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
  await users[1].reconnect()
  await compareUsers(t, users)
})
