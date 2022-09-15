<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{
  currentPath: string;
}>();
const isOpen = ref(false);
const toggleNav = () => (isOpen.value = !isOpen.value);

const navs = [
  {
    link: '/',
    title: 'home',
  },
  {
    link: '/blog',
    title: 'blog',
  },
  // {
  //   'link' : '/notes',
  //   'title' : 'notes'
  // }
];

const checkNav = (title: string) => {
  if (props.currentPath === '' && title === 'home') {
    return true;
  }
  const basePath = props.currentPath.split('/');
  return basePath[0] == title;
};
</script>

<template>
  <nav class="mx-6 lg:mx-auto lg:max-w-6xl py-6 relative">
    <button
      class="ml-auto flex self-end md:hidden"
      @click="toggleNav"
      aria-label="Toggle Nav"
    >
      <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
        <path
          fill-rule="evenodd"
          d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
        ></path>
      </svg>
    </button>
    <div
      :class="isOpen ? 'flex absolute w-full bg-white shadow p-2' : 'hidden'"
      class="flex items-start flex-col md:flex md:flex-row gap-2 uppercase md:justify-between md:items-center"
    >
      <ul class="md:flex flex-col md:flex-row md:gap-2 md:w-1/2">
        <li
          class="mr-6 pb-2 md:py-0"
          v-for="(item, index) in navs"
          :key="index"
        >
          <a
            :href="item.link"
            :class="
              checkNav(item.title)
                ? 'text-primary font-bold'
                : 'text-gray-900 hover:text-primary'
            "
            >{{ item.title }}</a
          >
        </li>
      </ul>

      <a
        class="md:flex hover:bg-gray-900-primary bg-primary text-white rounded-full py-2 px-4"
        href="mailto:adepranaya@gmail.com?subject=I want hire you!&body=Hello Ade!, my name is ..."
        >Contact Me</a
      >
    </div>
  </nav>
</template>
