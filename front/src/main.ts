import { createApp } from 'vue'


import router from './router'
import { store, key } from './store'

// Vuetify
// @ts-ignore-next-line
import 'vuetify/styles' 
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'

const vuetify = createVuetify({
components,
directives,
})

const app = createApp(App)

app.use(router).use(store, key).use(vuetify)

app.mount('#app')
