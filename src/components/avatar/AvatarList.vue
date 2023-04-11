<script setup>
  defineProps({
    source: Array,
    size: {
      type: Number,
      default: 22,
      required: false,
    },
  });
</script>
<template>
  <div class="avatar-list">
    <a-avatar
      :style="`margin-left: -${size / 2}px`"
      v-for="(item, i) in source"
      :size="size"
      :key="i"
      :src="item.avatar"
    />
  </div>
</template>
<style lang="less" scoped>
  .avatar-list {
    :deep(.ant-avatar) {
      @apply outline-1 outline-white outline;
    }
  }
</style>
