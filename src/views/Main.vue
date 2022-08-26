<template>
  <div class="main">
    <router-view />
    <van-tabbar route>
      <van-tabbar-item replace to="/home" icon="">
        <span>主页</span>
        <template #icon="">
          <img :src="home"/>
        </template>
      </van-tabbar-item>
      <van-tabbar-item replace to="/classfication" icon="">
        <span>分类</span>
        <template #icon="">
          <img :src="classfication"/>
        </template>
      </van-tabbar-item>
      <van-tabbar-item replace to="/edit" icon="">
        <span>issue</span>
        <template #icon="">
          <img :src="issue"/>
        </template>
      </van-tabbar-item>
      <van-tabbar-item replace to="/appraisal" icon="">
        <span>鉴别</span>
        <template #icon="">
          <img :src="identify"/>
        </template>
      </van-tabbar-item>
      <van-tabbar-item replace to="/my" icon="">
        <span>我的</span>
        <template #icon="">
          <img :src="my"/>
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      home: require("../assets/icon/home.png"),
      issue: require("../assets/icon/issue.png"),
      classfication: require("../assets/icon/classfication-1.png"),
      identify: require("../assets/icon/identify.png"),
      my: require("../assets/icon/my.png"),
    }
  },
};
</script>

<style lang="scss" scoped>
</style>