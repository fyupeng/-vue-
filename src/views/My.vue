<template>
  <div class="my">
    <div class="img-box">
      <img class="my-img" src="../assets/icon/userBg.jpg" alt="加载失败" />
    </div>

    <div class="my-detail">
      <div class="my-top">
        <img :src="avatar" />
        <div class="my-desc">
          <div v-show="nickname == ''" class="name">未登录</div>
          <div v-show="!nickname == ''" class="name">{{ nickname }}</div>
          <div class="desc">{{ description }}</div>
        </div>
      </div>

      <div class="item-box">
        <div class="item">
          <div class="item-name" @click="goMyInfo">个人详情</div>
          <img class="into" src="../assets/icon/into-2.png" @click="goMyInfo" />
        </div>

        <div class="dividing-line"></div>

        <div class="item">
          <div class="item-name" @click="goMyTag">标签管理</div>
          <img class="into" src="../assets/icon/into-2.png" @click="goMyTag" />
        </div>

        <div class="dividing-line"></div>

        <div class="item">
          <div class="item-name" @click="goMyLike">我的收藏</div>
          <img class="into" src="../assets/icon/into-2.png" @click="goMyLike" />
        </div>

        <div v-show="permission == 3" class="dividing-line"></div>

        <div v-show="permission == 3" class="item">
          <div class="item-name" @click="goSystematic">分类管理</div>
          <img
            class="into"
            src="../assets/icon/into-2.png"
            @click="goSystematic"
          />
        </div>

        <div v-show="permission == 3" class="dividing-line"></div>

        <div v-show="permission == 3" class="item">
          <div class="item-name" @click="goComment">评论管理</div>
          <img
            class="into"
            src="../assets/icon/into-2.png"
            @click="goComment"
          />
        </div>

        <div class="dividing-line"></div>

        <div class="item">
          <div class="item-name" @click="goAccount">账户管理</div>
          <img
            class="into"
            src="../assets/icon/into-2.png"
            @click="goAccount"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/less/my.less";
import { request } from "../util/request";
export default {
  data() {
    return {
      description: "这家伙很懒，什么也没有留下！",
      nickname: "",
      avatar: require("../assets/icon/default-avatar.png"),
      permission: ""
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    goComment() {
      this.$router.push({ name: "comment" });
    },
    getUserInfo() {
      request({
        method: "post",
        url: "user/query",
        params: {
          userId: localStorage.getItem("userId"),
        },
      })
        .then((res) => {
          console.log(res)
          if (res.status == 200) {
            var data = res.data;
            if (data.nickname != null) {
              this.nickname = data.nickname;
            } else {
              this.nickname = "未命名";
            }
            if (data.avatar != null) {
              this.avatar = this.remoteUrl + "/distributed-blog-data/"  + data.avatar;
            }
            if (data.description != null) {
              this.description = data.description;
            }
            if(data.permission != null) {
              this.permission = data.permission;
            }
          }
        })
    },
    goMyInfo() {
      this.$router.push({ name: "myInfo" });
    },
    goMyTag() {
      this.$router.push({ name: "tag" });
    },
    goMyLike() {
      // this.$router.push({ name: "" });
    },
    goSystematic() {
      this.$router.push({ name: "systematic" });
    },
    goAccount() {
      this.$router.push({ name: "account" });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>


