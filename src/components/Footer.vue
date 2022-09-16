<script setup lang="ts">
import SocMed from './SocMed.vue';
const currentDate = new Date().getFullYear().toString();
const name = 'Ade Pranaya';
</script>
<template>
  <div class="mx-6 lg:mx-auto lg:max-w-5xl py-6">
    <div class="mt-4 flex items-center mb-4 flex-wrap justify-center gap-4">
      <SocMed></SocMed>
    </div>
    <div class="text-center">&copy; {{ currentDate }}. Builth with 💖 by: {{ name }}</div>
  </div>
</template>
