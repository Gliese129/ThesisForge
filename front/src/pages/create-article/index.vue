<template>
  <div class="container mx-auto mt-10">
    <v-stepper :items="steps" v-model="currentStep">
      <template v-slot:item.1>
        <v-card flat>
          <fill-info />
        </v-card>
      </template>

      <template v-slot:item.2>
        <v-card flat>
          <define-structure />
        </v-card>
      </template>

      <template v-slot:item.3>
        <v-card title="Step Three" flat>...</v-card>
      </template>
    </v-stepper>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import FillInfo from './FillInfo.vue'
import DefineStructure from './DefineStructure.vue'

const store = useStore(key)

onMounted(() => {
  store.dispatch('outline/restoreFromLocalStorage')
  store.dispatch('structure/restoreFromLocalStorage')
})

const steps = ['Fill Info', 'Define Structure', 'Complete Content', 'Review']
// const completed = ref({
//   0: false,
//   1: false,
//   2: false,
//   3: false
// })
// const latestStep = computed(() => {
//   return Object.keys(completed).reduce((max, key) => {
//     return completed[key as unknown as keyof typeof completed]
//       ? Math.max(max, Number(key) + 1)
//       : max
//   }, 0)
// })
const currentStep = ref(1)
</script>

<style scoped>
.container {
  max-width: 90%;
}
</style>
