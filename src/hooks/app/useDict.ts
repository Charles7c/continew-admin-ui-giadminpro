import { ref, toRefs } from 'vue'
import { listCommonDict } from '@/apis'
import { useDictStore } from '@/stores'

const pendingRequests = new Map<string, Promise<any>>()

export function useDict(...codes: string[]) {
  const dictStore = useDictStore()
  const dictData = ref<Record<string, App.DictItem[]>>({})

  codes.forEach(async (code) => {
    dictData.value[code] = []

    const cached = dictStore.getDict(code)
    if (cached) {
      dictData.value[code] = cached
      return
    }

    if (!pendingRequests.has(code)) {
      const request = listCommonDict(code)
        .then(({ data }) => {
          dictStore.setDict(code, data)
          return data
        })
        .catch((error) => {
          console.error(`Failed to load dict: ${code}`, error)
          return []
        })
        .finally(() => {
          pendingRequests.delete(code)
        })

      pendingRequests.set(code, request)
    }

    pendingRequests.get(code)!.then((data) => {
      dictData.value[code] = data
    })
  })

  return toRefs(dictData.value)
}
