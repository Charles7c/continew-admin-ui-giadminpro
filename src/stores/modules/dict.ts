import { defineStore } from 'pinia'
import type { LabelValueState } from '@/types/global'

const storeSetup = () => {
  const dictData = ref(new Map<string, LabelValueState[]>())

  // 设置字典
  const setDict = (code: string, items: Array<LabelValueState>) => {
    if (code) {
      dictData.value.set(code, items)
    }
  }

  // 获取字典
  const getDict = (code: string) => {
    if (!code) return null
    return dictData.value.get(code) || null
  }

  // 删除字典
  const deleteDict = (code: string) => {
    try {
      return dictData.value.delete(code)
    } catch (e) {
      return false
    }
  }

  // 清空字典
  const cleanDict = () => {
    dictData.value.clear()
  }

  return {
    setDict,
    getDict,
    deleteDict,
    cleanDict,
  }
}

export const useDictStore = defineStore('dict', storeSetup, { persist: true })
