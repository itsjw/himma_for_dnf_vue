import fetch from '@/utils/fetch'
import Qs from 'qs'
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
    transformRequest: [function() {
      return Qs.stringify(data)
    }]
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
    transformRequest: [function() {
      return Qs.stringify(data)
    }]
  })
}
export function getMaterialInfo() {
  return fetch({
    url: '/himma/getMaterialInfo',
    method: 'get'
  })
}
export function changeMaterialPrice(materialVOList) {
  return fetch({
    url: '/himma/changeMaterialPrice',
    method: 'post',
    data: materialVOList,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

