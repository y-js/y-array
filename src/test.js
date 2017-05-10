import { wait, initArrays, flushAll, compareUsers } from './testHelper.js'
import test, { proxyConsole } from '../../../t--/src/t--.js'

proxyConsole()

var database = { name: 'memory' }
var connector = { name: 'websockets-client' }

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

test('getOperations ascending ids bug in late sync', async function basic4 (t) {
  var { users, array0, array1, array2 } = await initArrays(t, { users: 3, connector: connector, db: database })
  array0.insert(0, ['x', 'y'])
  await flushAll(t, users)
  users[1].disconnect()
  users[2].disconnect()
  await wait()
  array0.insert(1, ['user0'])
  array1.insert(1, ['user1'])
  array2.insert(1, ['user2'])
  await users[1].reconnect()
  await users[2].reconnect()
  await compareUsers(t, users)
})
