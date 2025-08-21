<template>
  <milkdown-provider>
    <prosemirror-adapter-provider>
      <milkdown-editor
        v-model="doc"
        ref="editorRef"
        :config="config"
        @save="emit('save')"
        :uploader="uploader"
      />
    </prosemirror-adapter-provider>
  </milkdown-provider>
</template>

<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
import MilkdownEditor from './CrepeEditor.vue'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import { ref } from 'vue'
const doc = defineModel({ type: String })
const { config, uploader } = defineProps({
  config: {
    type: Object,
    default: () => ({
      readonly: false,
      menu: true,
      theme: 'auto'
    })
  },
  uploader: {
    type: Function,
    default: () => () => Promise.resolve('')
  }
})
const emit = defineEmits(['save'])

const editorRef = ref<InstanceType<typeof MilkdownEditor>>(null!)


defineExpose({
  setValue: (md: string) => editorRef.value.setValue(md),
  getHtml: () => editorRef.value.getHtml(),
  getOutline: () => editorRef.value.getOutline(),
  crepe: editorRef.value?.crepe
})
</script>

<style lang="sass"></style>
