import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useSettingStore = defineStore('setting', () => {
  const navigation = ref('side');
  const useTabs = ref(true);
  const theme = ref('side-dark');
  const contentClass = ref('common');
  const filterMenu = ref(false);
  function setNavigation(nav) {
    navigation.value = nav;
  }
  function setTheme(value) {
    theme.value = value;
  }
  function setContentClass(className) {
    contentClass.value = className;
  }
  function setFilterMenu(filter) {
    filterMenu.value = filter;
  }
  return {
    navigation,
    useTabs,
    theme,
    contentClass,
    filterMenu,
    setNavigation,
    setTheme,
    setContentClass,
    setFilterMenu,
  };
});
