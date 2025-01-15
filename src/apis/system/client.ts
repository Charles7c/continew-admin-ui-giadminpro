import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

const BASE_URL = '/system/client'

/** @desc 查询客户端列表 */
export function listClient(query: T.ClientPageQuery) {
  return http.get<PageRes<T.ClientResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询客户端详情 */
export function getClient(id: string) {
  return http.get<T.ClientDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增客户端 */
export function addClient(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改客户端 */
export function updateClient(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除客户端 */
export function deleteClient(ids: string | Array<string>) {
  return http.del(`${BASE_URL}/${ids}`)
}
