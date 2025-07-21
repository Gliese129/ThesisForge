<template>
  <v-dialog max-width="500" v-model="show">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn color="secondary" v-bind="activatorProps"> Paste Response </v-btn>
    </template>

    <template v-slot:default>
      <v-card title="Please Paste Response From AI">
        <v-card-text>
          <v-textarea
            v-model="response"
            label="Response from AI"
            rows="10"
            auto-grow
            outlined
            clearable
            max-rows="10"
            class="mt-2"
          >
          </v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text="Paste From Clipboard"
            @click="pasteTextFromClipboard"
          ></v-btn>
          <v-btn text="Send" @click="send"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useStore } from 'vuex'
import { key } from '@/store'

const store = useStore(key)

const response = defineModel<string>({
  default: '',
  type: String
})

const emits = defineEmits<{
  (e: 'send', text: string): void
}>()

const show = ref(false)

const pasteTextFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    response.value = text
    store.commit('message/success', 'Response pasted from clipboard')
  } catch (error) {
    store.commit('message/error', 'Failed to paste response')
  }
}
const send = () => {
  if (!response.value || response.value.trim() === '') {
    store.commit('message/error', 'Response cannot be empty')
    return
  }
  emits('send', response.value)
  response.value = ''
  show.value = false
}
</script>
