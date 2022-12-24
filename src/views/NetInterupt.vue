<template>
  <div class="errPage-container">
    <div class="intro-top">
      <h1>无网络</h1>
      <h3>导致该原因是网络连接问题</h3>
    </div>
    <div class="bottom-box">
      <img class="err-image" :src="errImage" alt="" />
    </div>
  </div>
</template>

<script>
import "../assets/less/netInterupt.less";
import { request } from "../util/js/request";
export default {
  data() {
    return {
      errImage: require("../assets/icon/404.png"),
    };
  },
  methods: {},
  created() {
    let that = this;
    let toast = this.$toast;

    window.addEventListener("offline", function () {
      this.$toast.loading({
        message: "网络中断...",
        duration: 200,
      });
    });

    window.addEventListener("online", function () {
      toast.loading({
        message: "网络正在自动重连...",
        duration: 10000,
        forbidClick: true,
      });
      request("user/pingNetWork").then((res) => {
        if (res.status == 200) {
          toast.clear();
          toast.success({
            message: "网络连接成功",
            duration: 500,
          });
          that.$router.push({ name: "home" });
        }
      });
    });
    // this.$toast("重连失败，请稍后刷新....");
  },
};
</script>

<style lang="scss" scoped>
</style>