<template>
  <div class="h-full flex">
    <div class="w-full relative px-10 md:p-0">
      <div
        class="flex flex-col overflow-auto relative z-10 min-h-full"
      >
        <!-- <back-button></back-button> -->
        <h1 class="text-4xl md:text-6xl font-bold lg:-my-3">Notes</h1>
        <div class="flex-1 flex-wrap max-h-full">
          <div class="grid grid-cols-1 gap-4 mt-6">
            <div
              class="p-4 border border-l-4 border-gray-400 bg-white"
              v-for="(el, index) in portfolios"
              :key="index"
            >
              <h2 class="font-bold text-xl">{{ el.sebagai }}</h2>
              <p class="text-gray-600">{{ el.tanggal }}</p>
              <ul
                v-if="typeof el.deskripsi === 'object'"
                class="list-disc ml-4"
              >
                <li v-for="(desc, iD) in el.deskripsi" :key="iD" class="mb-2">
                  {{ desc }}
                </li>
              </ul>
              <p v-else v-html="el.deskripsi" class="whitespace-pre-wrap"></p>
              <ul>
                <li
                  v-for="(tech, iT) in el.teknologi"
                  :key="iT"
                  class="inline-block bg-primary text-white mr-4 mt-4 p-1 rounded-sm text-sm"
                >
                  {{ tech }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import BackButton from "~/components/BackButton";
export default {
  // components: {
  //   BackButton,
  // },
  data: () => {
    return {
      portfolios: [
        {
          sebagai: 'Specified input file /src/inpus.css does not exist.',
          deskripsi:
            "Getting error when i trying Start the Tailwind CLI build process like the <a href='https://tailwindcss.com/docs/installation' class='text-primary'>docs</a> , <pre class='whitespace-pre-wrap'>npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch</pre> <br> so the solution is just remove the first slash from the path like this <pre class='whitespace-pre-wrap'>npx tailwindcss -i src/inpus.css -o dist/output.css --watch</pre>",
          teknologi: ['Tailwind CSS v3.1.2'],
          tanggal: '15 Juni 2022',
        },
      ],
    };
  },
};
</script>

<style></style>
