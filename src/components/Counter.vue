<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
const add = () => (count.value = count.value + 1);
</script>

<template>
  <button @click="add()" class="w-40 bg-yellow-200">
    {{ count }}
  </button>
</template>
