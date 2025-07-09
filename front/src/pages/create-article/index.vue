<template>
  <div class="container mx-auto mt-10">
    <v-stepper :items="steps" :model-value="currentStep">
      <template v-slot:item.1 :editable="latestStep >= 0">
        <v-card flat>
          <CreateOutline :completed="completed[0]" />
        </v-card>
      </template>

      <template v-slot:item.2 :editable="latestStep >= 1">
        <v-card title="Step Two" flat>...</v-card>
      </template>

      <template v-slot:item.3>
        <v-card title="Step Three" flat>...</v-card>
      </template>
    </v-stepper>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import CreateOutline from './CreateOutline.vue'
const steps = ['Fill Info', 'Define Structure', 'Complete Content', 'Review']
const completed = ref({
  0: false,
  1: false,
  2: false,
  3: false
})
const latestStep = computed(() => {
  return Object.keys(completed).reduce((max, key) => {
    return completed[key as unknown as keyof typeof completed]
      ? Math.max(max, Number(key) + 1)
      : max
  }, 0)
})
const currentStep = ref(1)
</script>

<style scoped>
.container {
  max-width: 80%;
}
</style>
