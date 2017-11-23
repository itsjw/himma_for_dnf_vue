import fetch from '@/utils/fetch'

export function getHimmaTypeList() {
  return fetch({
    url: '/himma/getHimmaTypeList',
    method: 'get'
  })
}
export function createHimma(typeId, name) {
  const data = {
    typeId,
    name
  }
  return fetch({
    url: '/himma/createHimma',
    method: 'post',
    data
  })
}
export function getHimmaList() {
  return fetch({
    url: '/himma/getHimmaList',
    method: 'get'
  })
}
