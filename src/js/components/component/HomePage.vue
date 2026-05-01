
<template>
 
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {api} from "@api/api";
import {app} from "@core/app";
import {fileAPI, libraryAPI, userDataAPI} from "@js/api";

defineProps<{ msg: string }>()

const count = ref(0)
</script>


<style scoped>

</style>
