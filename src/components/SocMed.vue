<script setup lang="ts">
const socialMedias = [
  {
    title: 'Linkedin',
    link: 'https://www.linkedin.com/in/ade-pranaya-567733113/',
    icon: 'fa-brands fa-linkedin',
  },
  {
    title: 'Instagram',
    link: 'https://instagram.com/depran7',
    icon: 'fa-brands fa-instagram',
  },
  {
    title: 'Youtube',
    link: 'https://www.youtube.com/channel/UCNEqtGZAM-LiBeSATMrOvVQ?sub_confirmation=1',
    icon: 'fa-brands fa-youtube',
  },
  {
    title: 'Github',
    link: 'https://www.github.com/adepranaya',
    icon: 'fa-brands fa-github',
  },
  {
    title: 'Github',
    link: 'https://www.github.com/depran7',
    icon: 'fa-brands fa-github',
  },
  {
    title: 'Github',
    link: 'https://www.gitlab.com/ade.pranaya',
    icon: 'fa-brands fa-gitlab',
  },
];
</script>

<template>
  <div class="flex items-center flex-wrap justify-center md:justify-start">
    <a v-for="(item, index) in socialMedias" :key="index" :href="item.link" target="_blank" class="mr-5">
      <i class="text-4xl text-primary" :class="item.icon"></i>
    </a>
  </div>
</template>
