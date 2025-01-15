import type { TableData, TableInstance } from '@arco-design/web-vue'
import { Message, Modal } from '@arco-design/web-vue'
import type { Options as paginationOptions } from './usePagination'
import { useBreakpoint, usePagination } from '@/hooks'

interface Options<T, U> {
  formatResult?: (data: T[]) => U[]
  onSuccess?: () => void
  immediate?: boolean
  rowKey?: keyof T
  paginationOption?: paginationOptions
}

interface PaginationParams { page: number, size: number }
type Api<T> = (params: PaginationParams) => Promise<ApiRes<PageRes<T[]>>> | Promise<ApiRes<T[]>>

export function useTable<T extends U, U = T>(api: Api<T>, options?: Options<T, U>) {
  const { formatResult, onSuccess, immediate, rowKey } = options || {}
  const { pagination, setTotal } = usePagination(() => getTableData(), options?.paginationOption)
  const loading = ref(false)
  const tableData: Ref<U[]> = ref([])

  async function getTableData() {
    try {
      loading.value = true
      const res = await api({ page: pagination.current, size: pagination.pageSize })
      const data = !Array.isArray(res.data) ? res.data.list : res.data
      tableData.value = formatResult ? formatResult(data) : data
      const total = !Array.isArray(res.data) ? res.data.total : data.length
      setTotal(total)
      onSuccess && onSuccess()
    } finally {
      loading.value = false
    }
  }

  // 是否立即触发
  const isImmediate = immediate ?? true
  isImmediate && getTableData()

  // 多选
  const selectedKeys = ref<(string | number)[]>([])
  const select: TableInstance['onSelect'] = (rowKeys) => {
    selectedKeys.value = rowKeys
  }

  // 全选
  const selectAll: TableInstance['onSelectAll'] = (checked) => {
    const key = rowKey ?? 'id'
    const arr = (tableData.value as TableData[]).filter((i) => !(i?.disabled ?? false))
    selectedKeys.value = checked ? arr.map((i) => i[key as string]) : []
  }

  // 查询
  const search = () => {
    selectedKeys.value = []
    pagination.onChange(1)
  }

  // 刷新
  const refresh = () => {
    getTableData()
  }

  // 删除
  const handleDelete = async <T>(
    deleteApi: () => Promise<ApiRes<T>>,
    options?: { title?: string, content?: string, successTip?: string, showModal?: boolean },
  ): Promise<boolean | undefined> => {
    const onDelete = async () => {
      try {
        const res = await deleteApi()
        if (res.success) {
          Message.success(options?.successTip || '删除成功')
          selectedKeys.value = []
          await getTableData()
        }
        return res.success
      } catch (error) {
        return false
      }
    }
    const flag = options?.showModal ?? true // 是否显示对话框
    if (!flag) {
      return onDelete()
    }
    Modal.warning({
      title: options?.title || '提示',
      content: options?.content || '是否确定删除该条数据？',
      okButtonProps: { status: 'danger' },
      hideCancel: false,
      maskClosable: false,
      onBeforeOk: onDelete,
    })
  }

  const { breakpoint } = useBreakpoint()
  // 表格操作列在小屏下不固定在右侧
  const fixed = computed(() => !['xs', 'sm'].includes(breakpoint.value) ? 'right' : undefined)

  return {
    /** 表格加载状态 */
    loading,
    /** 表格数据 */
    tableData,
    /** 获取表格数据 */
    getTableData,
    /** 搜索，页码会重置为1 */
    search,
    /** 分页的传参 */
    pagination,
    /** 选择的行keys */
    selectedKeys,
    /** 选择行 */
    select,
    /** 全选行 */
    selectAll,
    /** 处理删除、批量删除 */
    handleDelete,
    /** 刷新表格数据，页码会缓存 */
    refresh,
    /** 操作列在小屏场景下不固定在右侧 */
    fixed,
  }
}
