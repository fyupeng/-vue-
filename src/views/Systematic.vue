<template>
  <div class="systematic">
    <div class="nav">
      <van-nav-bar
        title="分类管理"
        left-text="返回"
        left-arrow
        @click-left="goback"
      />
    </div>

    <div class="bg">
      <img class="bgImg" src="../assets/icon/myInfo.jpg" alt="" />
    </div>

    <div class="detail">
      <div class="systematic-top">
        <div class="systematic-num">全部 ( {{systematicList.length}} )</div>
        <div class="other">
          <button class="edit-systematic" @click="editSystematic">编辑分类</button>
          <button class="new-systematic" @click="showSaveWindow = true">新建分类</button>
        </div>
      </div>

      <van-dialog
        v-model="showSaveWindow"
        title="新建类别"
        show-cancel-button
        :before-close="saveSystematic"
      >
        <div class="create-box">
          <div class="pro">类别名：</div>
          <input
            v-model="classficationName"
            placeholder="新建分类名"
            class="pro-name"
          />
        </div>
      </van-dialog>

      <div
        class="systematic-item"
        v-for="item in systematicList"
        :key="item.id"
      >
      <img class="item-img" src="../assets/icon/systematic.jpg" alt="">
        <div class="item-id">{{item.id}}</div>
        <input @change="updateSystematicName(item)" :disabled="!edit" v-model="item.name" :class="edit ? 'item-name active-name' : 'item-name' "/>
        <img class="edit-img" :src="eidtImg" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/less/systematic.less";
import { request } from "../util/request";
export default {
  data() {
    return {
      edit: false,
      showSaveWindow: false,
      systematicList: "",
      classficationName: "",
      eidtImg: require("../assets/icon/disable-edit.png"),
    };
  },
  methods: {
    editSystematic() {
      this.edit = !this.edit,
      this.eidtImg = this.edit ? require("../assets/icon/editable.png") : require("../assets/icon/disable-edit.png")
    },
    updateSystematicName(item) {
      this.$toast.loading({
        message: "正在修改中....",
        duration: 1000,
        forbidClick: true
      })
      request({
        method: "post",
        url: "admin/article/updateClassfication",
        data: {
          id: item.id,
          name: item.name
        },
        params: {
          userId: localStorage.getItem("userId")
        }
      }).then(res=>{
        if(res.status == 200) {
          this.$toast.clear();
          this.$toast.success("修改成功");
        } else {
          this.$toast(res.data.msg);
        }
      })
    },
    
    saveSystematic(action, done) {
      console.log(this.classficationName);
      if (action == "confirm") {
        setTimeout(done, 100);
        this.$toast.loading({
          message: "正在创建...",
          duration: 1000,
          forbidClick: true,
        });
        request({
          method: "post",
          url: "admin/article/saveClassfication",
          params: {
            classficationName: this.classficationName,
            userId: localStorage.getItem("userId"),
          },
        })
          .then((res) => {
            if(res.status == 200) {
              this.$toast.clear();
              this.$toast.success("创建成功");
              this.getAllSystematics();
            } else {
              this.$toast(res.data.msg);
            }
          })
      }
      if(action == "cancel") {
        setTimeout(done, 100);
      }
    },
    goback() {
      this.$router.push("my");
    },
    getAllSystematics() {
      request({
        method: "post",
        url: "user/article/getAllClassfications",
      })
        .then((res) => {
          if (res.status == 200) {
            this.systematicList = res.data;
          }
        })
    },
  },

  created() {
    let userToken = localStorage.getItem("token");
    if (userToken == null) {
      this.$toast.fail("请登录");
      this.$router.push({ name: "login", query: { name: "systematic" } });
      return;
    }
    this.getAllSystematics();
  },
};
</script>

<style lang="scss" scoped>
</style>