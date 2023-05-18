<template>
  <ThemeProvider :color="{ middle: { 'bg-base': '#f9e9f9' } }">
    <div ref="demo" class="demo p-8 mb-4">demo</div>
  </ThemeProvider>
</template>

<script setup>
  import { ThemeProvider } from 'stepin';
</script>
