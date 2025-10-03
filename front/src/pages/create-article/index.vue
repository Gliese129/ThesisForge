<template>
  <v-card class="container mx-auto mt-8">
    <v-stepper v-model="currentStep" class="elevation-0">
      <v-stepper-header>
        <template v-for="(step, index) in steps" :key="index">
          <v-stepper-item
            :title="step"
            :value="index + 1"
            :complete="currentStep > index + 1"
            :editable="true"
            :color="currentStep > index + 1 ? 'success' : 'primary'"
          ></v-stepper-item>
          <v-divider v-if="index < steps.length - 1"></v-divider>
        </template>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <fill-info @completed="() => handleCompletion(1)" />
        </v-stepper-window-item>

        <v-stepper-window-item :value="2">
          <define-structure @completed="() => handleCompletion(2)" />
        </v-stepper-window-item>

        <v-stepper-window-item :value="3">
          <complete-content @completed="() => handleCompletion(3)" />
        </v-stepper-window-item>

        <v-stepper-window-item :value="4">
          <review-article />
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions>
        <v-btn :disabled="currentStep === 1" @click="currentStep--">
          Previous
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="currentStep === steps.length"
          @click="currentStep++"
          color="primary"
        >
          Next
        </v-btn>
      </v-stepper-actions>
    </v-stepper>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import FillInfo from './FillInfo.vue'
import DefineStructure from './DefineStructure.vue'
import CompleteContent from './CompleteContent.vue'
import ReviewArticle from './ReviewArticle.vue'

const store = useStore(key)

// 步骤标题
const steps = ['Fill Info', 'Define Structure', 'Complete Content', 'Review']
// 当前步骤（1-based）
const currentStep = ref(1)

/**
 * 子组件完成时自动推进到下一步
 */
const handleCompletion = (completedStep: number) => {
  if (completedStep < steps.length) {
    currentStep.value = completedStep + 1
  }
}

// 监听 currentStep 的变化，并将其保存到 localStorage
watch(currentStep, (newStep) => {
  localStorage.setItem('stepperCurrentStep', JSON.stringify(newStep))
})

onMounted(() => {
  // 1. 页面加载时，尝试从 localStorage 恢复上一次的步骤
  const savedStep = localStorage.getItem('stepperCurrentStep')
  if (savedStep) {
    currentStep.value = JSON.parse(savedStep)
  }

  // 2. 恢复文章数据
  store.dispatch('article/restoreFromLocalStorage')
})
</script>

<style scoped>
.container {
  max-width: 95%;
}
</style>
