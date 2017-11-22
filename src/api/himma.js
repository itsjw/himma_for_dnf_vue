import fetch from '@/utils/fetch'

export function getWorkTypeList() {
  return fetch({
    url: '/himma/getWorkTypeList',
    method: 'get'
  })
}
export function createWorker(workerType, workerName, token) {
  const data = {
    workerType,
    workerName,
    token
  }
  return fetch({
    url: '/himma/createWorker',
    method: 'post',
    data
  })
}
export function getWorkerList() {
  return fetch({
    url: '/himma/getWorkerList',
    method: 'get'
  })
}
