<script setup lang="ts">
import SocMed from './SocMed.vue';
const currentDate = new Date().getFullYear().toString();
const name = 'Ade Pranaya';
</script>
<template>
  <div class="mx-6 lg:mx-auto lg:max-w-6xl py-6">
    <div class="mt-4 flex items-center mb-4 flex-wrap justify-center">
      <SocMed></SocMed>
      <span>copyright &copy; {{ currentDate }}. {{ name }}</span>
    </div>
  </div>
</template>
