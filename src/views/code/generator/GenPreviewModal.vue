<template>
  <a-modal v-model:visible="visible" width="90%" :footer="false">
    <template #title>
      {{ previewTableNames.length === 1 ? `生成 ${previewTableNames[0]} 表预览` : '批量生成预览' }}
      <a-link v-permission="['code:generator:generate']" style="margin-left: 10px" icon @click="onDownload">下载源码</a-link>
      <a-link v-permission="['code:generator:generate']" style="margin-left: 10px" icon @click="onGenerator">生成源码</a-link>
    </template>
    <div class="preview-content">
      <a-layout :has-sider="true">
        <a-layout-sider theme="dark" style="max-width:600px; height: 700px" :resize-directions="['right']" :width="370">
          <a-tree
            ref="treeRef"
            :data="treeData"
            show-line
            block-node
            :selected-keys="selectedKeys"
            class="selectPreview"
            @select="onSelectPreview"
          >
            <template #switcher-icon="node, { isLeaf }">
              <icon-caret-down v-if="!isLeaf" />
            </template>
            <template #icon="node">
              <GiSvgIcon v-if="!node.isLeaf && !node.expanded" :size="16" name="directory-blue" />
              <GiSvgIcon v-if="!node.isLeaf && node.expanded" :size="16" name="directory-open-blue" />
              <GiSvgIcon v-if="node.isLeaf && checkFileType(node.node.title, '.java')" :size="16" name="file-java" />
              <GiSvgIcon v-if="node.isLeaf && checkFileType(node.node.title, '.vue')" :size="16" name="file-vue" />
              <GiSvgIcon
                v-if="node.isLeaf && checkFileType(node.node.title, '.ts')" :size="16"
                name="file-typescript"
              />
              <GiSvgIcon
                v-if="node.isLeaf && checkFileType(node.node.title, '.js')" :size="16"
                name="file-javascript"
              />
              <GiSvgIcon v-if="node.isLeaf && checkFileType(node.node.title, '.json')" :size="16" name="file-json" />
              <GiSvgIcon v-if="node.isLeaf && checkFileType(node.node.title, 'pom.xml')" :size="16" name="file-maven" />
              <GiSvgIcon
                v-if="node.isLeaf && checkFileType(node.node.title, '.xml') && !checkFileType(node.node.title, 'pom.xml')"
                :size="16" name="file-xml"
              />
              <GiSvgIcon v-if="node.isLeaf && checkFileType(node.node.title, '.sql')" :size="16" name="file-sql" />
            </template>
          </a-tree>
        </a-layout-sider>
        <a-layout-content>
          <a-card>
            <template #title>
              <a-typography-title :heading="6" ellipsis>
                {{ currentPreview?.path }}{{ currentPreview?.path.indexOf('/') !== -1 ? '/' : '\\' }}{{ currentPreview?.fileName }}
              </a-typography-title>
            </template>
            <a-scrollbar style="height: 650px; overflow: auto">
              <a-link style="position: absolute; right: 20px; z-index: 999" title="复制" @click="onCopy">
                <template #icon><icon-copy size="large" /></template>
                <template #default>复制</template>
              </a-link>
              <GiCodeView
                :type="'vue' === currentPreview?.fileName.split('.')[1] ? 'vue' : 'javascript'"
                :code-json="currentPreview?.content"
              />
            </a-scrollbar>
          </a-card>
        </a-layout-content>
      </a-layout>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message, type TreeNodeData } from '@arco-design/web-vue'
import { useClipboard } from '@vueuse/core'
import { type GeneratePreviewResp, genPreview } from '@/apis/code/generator'

const emit = defineEmits([ 'download','generate'])
const { copy, copied } = useClipboard()

const genPreviewList = ref<GeneratePreviewResp[]>([])
const currentPreview = ref<GeneratePreviewResp>()
const visible = ref(false)
const previewTableNames = ref<string[]>([])
const treeRef = ref()
const treeData = ref<TreeNodeData[]>([])
// 合并目录
const mergeDir = (parent: TreeNodeData) => {
  // 合并目录
  if (parent.children?.length === 1 && typeof parent.children[0].key === 'number') {
    const mergeTitle = mergeDir(parent.children[0])
    if (mergeTitle !== '') {
      parent.title = `${parent.title}/${mergeTitle}`
    }
    parent.children = parent.children[0].children
    return parent.title
  }
  // 合并子目录
  if (parent?.children) {
    for (const child of parent.children) {
      mergeDir(child)
    }
  }
  return parent.title
}

const pushDir = (children: TreeNodeData[] | undefined, treeNode: TreeNodeData) => {
  if (children) {
    for (const child of children) {
      if (child.title === treeNode.title) {
        return child.children
      }
    }
  }
  children?.push(treeNode)
  return treeNode.children
}

// 自增的一个key 因为key相同的节点会出现一些问题
let autoIncrementKey = 0
// 将生成的目录组装成树结构
const assembleTree = (genPreview: GeneratePreviewResp) => {
  const separator = genPreview.path.includes('/') ? '/' : '\\'
  const paths: string[] = genPreview.path.split(separator)
  let tempChildren: TreeNodeData[] | undefined = treeData.value
  for (const path of paths) {
    // 向treeData中推送目录,如果该级目录有那么不推送进行下级的合并
    tempChildren = pushDir(tempChildren, { title: path, key: autoIncrementKey++, children: new Array<TreeNodeData>() })
  }
  tempChildren?.push({ title: genPreview.fileName, key: genPreview.fileName, children: new Array<TreeNodeData>() })
}

// 下载
const onDownload = () => {
  emit('download', [previewTableNames.value])
}

// 下载
const onGenerator = () => {
  emit('generate', [previewTableNames.value])
}
// 校验文件类型
const checkFileType = (title: string, type: string) => {
  return title.endsWith(type)
}

// 复制
const onCopy = () => {
  if (currentPreview.value) {
    copy(currentPreview.value?.content)
  }
}
watch(copied, () => {
  if (copied.value) {
    Message.success('复制成功')
  }
})

const selectedKeys = ref()
// 选择文件预览
const onSelectPreview = (keys: (string | number)[]) => {
  if (typeof keys[0] === 'string') {
    currentPreview.value = genPreviewList.value.filter((p) => p.fileName === keys[0])[0]
    selectedKeys.value = keys
  } else {
    const expandedKeys = treeRef.value.getExpandedNodes().map((node) => node.key)
    treeRef.value.expandNode(keys[0], !expandedKeys.includes(keys[0]))
  }
}

// 打开
const onOpen = async (tableNames: Array<string>) => {
  treeData.value = []
  previewTableNames.value = tableNames
  const { data } = await genPreview(tableNames)
  genPreviewList.value = data
  for (const genPreview of genPreviewList.value) {
    assembleTree(genPreview)
  }
  for (const valueElement of treeData.value) {
    mergeDir(valueElement)
  }
  selectedKeys.value = [genPreviewList.value[0].fileName]
  currentPreview.value = genPreviewList.value[0]
  await nextTick(() => {
    treeRef.value.expandAll(true)
  })
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
:deep(.arco-tree-show-line .arco-tree-node-is-leaf:not(.arco-tree-node-is-tail) .arco-tree-node-indent::after) {
  content: none;
}
.preview-content :deep(.arco-layout-sider) {
  min-width: 200px;
  white-space: nowrap;
}
</style>
