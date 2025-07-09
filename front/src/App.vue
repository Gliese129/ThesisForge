<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'

const store = useStore(key)

const drawer = ref(false)
const messages = computed({
  get: () => store.state.message.data,
  set: (value) => {
    store.commit('message/setMessages', value)
  }
})
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>

      <v-toolbar-title>ThesisForge</v-toolbar-title>
    </v-app-bar>

    <!-- <v-navigation-drawer
        v-model="drawer"
        :location="$vuetify.display.mobile ? 'bottom' : undefined"
        temporary
      >
        <v-list
          :items="items"
        ></v-list>
      </v-navigation-drawer> -->

    <v-main>
      <router-view />
    </v-main>
    <v-snackbar-queue v-model="messages"></v-snackbar-queue>
  </v-app>
</template>

<style></style>
