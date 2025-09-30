<script setup lang="ts">
import SocMed from './SocMed.vue';
</script>
<template>
  <div
    class="flex justify-between mt-20 mb-44 flex-wrap flex-col-reverse md:flex-row"
  >
    <div class="text-center md:text-left self-center flex flex-col gap-4">
      <div class="text-xl md:text-4xl">Hi, I’m</div>
      <h1 class="text-4xl md:text-6xl font-bold">
        A<span class="text-primary">dePran</span>aya
      </h1>
      <div class="text-lg">Frontend Developer | Content Creator</div>
      <SocMed></SocMed>

      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          class="bg-primary text-white font-semibold py-2 px-4 border-2 border-transparent hover:bg-gray-900 hover:border-transparent rounded-full flex-1 uppercase sm:mb-0 sm:mr-2 text-center cursor-pointer"
          href="https://instagram.com/depran7"
          >contact me</a
        >
        <!-- href="mailto:adepranaya@gmail.com?subject=I want hire you!&body=Hello Ade!, my name is ..." -->
        <a
          href="#about"
          class="bg-transparent text-primary font-semibold border-2 border-primary hover:text-white hover:bg-gray-900 hover:border-transparent py-2 px-4 rounded-full sm:flex-1 uppercase text-center"
          >about</a
        >
        <a
          href="#positions"
          class="bg-transparent text-primary font-semibold border-2 border-primary hover:text-white hover:bg-gray-900 hover:border-transparent py-2 px-4 rounded-full sm:flex-1 uppercase text-center sm:col-span-2"
          >see my works</a
        >
      </div>
    </div>
    <div class="self-center mb-4">
      <picture>
        <source media="(max-width:465px)" srcset="/assets/profile-3.webp" class="rounded-full" />
        <img src="/assets/profile-3.webp" alt="profile ade pranaya" width="24rem" height="24rem" class="w-[30rem]" />
      </picture>
    </div>
  </div>
</template>
