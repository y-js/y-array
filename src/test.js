import { initArrays, flushAll, compareUsers } from './test-helper.js'
import test from '../../../t--/src/t--.js'

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

test('handle three conflicts', async function basic23 (t) {
  var { users, array0, array1, array2 } = await initArrays(t, { users: 3, connector: connector, db: database })
  array0.insert(0, [0])
  array1.insert(0, [1])
  array2.insert(0, [2])

  await flushAll(t, users)
  t.compare(array0.toArray(), array1.toArray(), 'Compare array0 with array1')
  t.compare(array1.toArray(), array2.toArray(), 'Compare array1 with array2')
  await compareUsers(t, users)
})
