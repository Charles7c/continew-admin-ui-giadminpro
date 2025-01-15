import type * as T from './type'
import http from '@/utils/http'
import type { LabelValueState } from '@/types/global'

export type * from './type'

const BASE_URL = '/code/generator'

/** @desc 查询代码生成列表 */
export function listGenConfig(query: T.GenConfigPageQuery) {
  return http.get<PageRes<T.GenConfigResp[]>>(`${BASE_URL}/config`, query)
}

/** @desc 查询生成配置信息 */
export function getGenConfig(tableName: string) {
  return http.get<T.GenConfigResp>(`${BASE_URL}/config/${tableName}`)
}

/** @desc 查询字段配置列表 */
export function listFieldConfig(tableName: string, requireSync: boolean) {
  return http.get<T.FieldConfigResp[]>(`${BASE_URL}/field/${tableName}?requireSync=${requireSync}`)
}

/** @desc 保存配置信息 */
export function saveGenConfig(tableName: string, req: T.GeneratorConfigResp) {
  return http.post(`${BASE_URL}/config/${tableName}`, req)
}

/** @desc 生成预览 */
export function genPreview(tableNames: Array<string>) {
  return http.get<T.GeneratePreviewResp[]>(`${BASE_URL}/preview/${tableNames}`)
}

/** @desc 生成代码 */
export function downloadCode(tableNames: Array<string>) {
  return http.requestNative({
    url: `${BASE_URL}/${tableNames}/download`,
    method: 'post',
    responseType: 'blob',
  })
}

/** @desc 生成代码 */
export function generateCode(tableNames: Array<string>) {
  return http.requestNative({
    url: `${BASE_URL}/${tableNames}`,
    method: 'post',
  })
}

/** @desc 查询字典列表 */
export function listFieldConfigDict() {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict`)
}
