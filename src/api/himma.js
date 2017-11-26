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
export function startHimma(himmaId) {
  return fetch({
    url: '/himma/startHimma',
    method: 'get',
    params: { himmaId }
  })
}
export function endHimma(himmaInfo, himmaId) {
  const data = {
    himmaInfo,
    himmaId
  }
  return fetch({
    url: '/himma/endHimma',
    method: 'post',
    data
  })
}
