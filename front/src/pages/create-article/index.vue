<template>
  <div class="container mx-auto mt-10">
    <v-stepper editable :items="steps">
      <template v-slot:item.1>
        <v-card flat>
          <CreateOutline />
        </v-card>
      </template>

      <template v-slot:item.2>
        <v-card title="Step Two" flat>...</v-card>
      </template>

      <template v-slot:item.3>
        <v-card title="Step Three" flat>...</v-card>
      </template>
    </v-stepper>
  </div>
</template>

<script setup lang="ts">
import CreateOutline from './CreateOutline.vue'
const steps = ['Create Outline', 'Complete Content', 'Review']
</script>

<style scoped>
.container {
  max-width: 80%;
}
</style>
