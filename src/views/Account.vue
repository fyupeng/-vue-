<template>
  <div class="account">
    <div class="nav">
      <van-nav-bar
        title="账户管理"
        left-text="返回"
        left-arrow
        @click-left="goback"
      />
    </div>

    <div class="bg-top">
      <img class="bgImg" src="../assets/icon/myInfo.jpg" alt="" />
    </div>

    <div class="account-detail">

      <div class="item-box" v-show="!userIsExist" @click="goLogin">
          <div class="item-pro">未登录</div>
          <img class="into" src="../assets/icon/into-2.png">
      </div>

      <div class="dividing-line" v-show="!userIsExist"></div>

      <div class="item-box" v-show="userIsExist" @click="goOut">
        <div class="item-pro">注销</div>
          <img class="into" src="../assets/icon/into-2.png">
      </div>

      <div class="dividing-line" v-show="userIsExist"></div>

      <div class="item-box" v-show="userIsExist" @click="show = true">
          <div class="item-pro">修改密码</div>
          <img class="into" src="../assets/icon/into-2.png">
      </div>

      <div class="dividing-line" v-show="userIsExist"></div>

      <div class="item-box" @click="goRegistry">
          <div class="item-pro">注册</div>
          <img class="into" src="../assets/icon/into-2.png">
      </div>

      <van-popup
          v-model="show"
          closeable
          position="bottom"
          style="
            background: rgba(255, 255, 255, 0.8);
            height: 50%;
            border-radius: 15px 15px 0 0;
            width: 96%;
            margin-left: 2%;
          "
        >
          <div class="register-box">
            <h1>修改密码</h1>
            <div class="register">
              <van-field
                v-model="updateInfo.username"
                name="phone"
                label="用户名"
                placeholder="用户名"
                style="padding-inline:10%;
                background: rgba(255, 255, 255, 0);"
              />
              <van-field
                v-model="updateInfo.oldPassword"
                :type="showOldPassword ? 'password' : 'text'"
                name="password "
                label="原密码"
                placeholder="密码"
                :right-icon="showOldPassword ? 'closed-eye' : 'eye-o'"
                @click-right-icon="showOldPassword = !showOldPassword"
                style="padding-inline:10%;
                background: rgba(255, 255, 255, 0);"
              />
              <van-field
                v-model="updateInfo.newPassword"
                :type="showNewPassword ? 'password' : 'text'"
                name="password "
                label="新密码"
                placeholder="密码"
                :right-icon="showNewPassword ? 'closed-eye' : 'eye-o'"
                @click-right-icon="showNewPassword = !showNewPassword"
                style="padding-inline:10%;
                background: rgba(255, 255, 255, 0);"
              />
              <van-button
                style="
                  background: #70db70;
                  color: black;
                  border: 1px solid #70db70;
                  margin-top: 10px;
                  width: 86%;
                  margin-left: 7%;
                "
                round
                block
                type="info"
                native-type="button"
                @click="updatePwd"
                >确认修改</van-button
              >
            </div>
          </div>
        </van-popup>
      

    </div>
  </div>
</template>

<script>
import { Dialog } from 'vant';

import "../assets/less/account.less";
import { validForm } from "../util/js/validForm.js";
import { request } from "../util/js/request"
export default {
  data() {
    return {
      updateInfo: {
        username: "",
        oldPassword:"",
        newPassword:""
      },
      showOldPassword:true,
      showNewPassword:true,
      show: false,
      userIsExist: false
    };
  },
  methods: {

    goLogin() {
      let userToken = localStorage.getItem("token");
      let userId = localStorage.getItem("userId");
      if (userToken == null || userId == null) {
        this.$toast.fail("请登录");
        this.$router.push({ name: "login", query: { name: "home" } });
        return;
      }
    },
    updatePwd() {
      let o = {
        username: {
          value: this.updateInfo.username,
          errorMsg: "用户名只允许带特殊符号@.的6-18位字母数字组合",
          reg: /^[A-Za-z0-9@.]{6,18}$/,
        },
        oldPassword: {
          value: this.updateInfo.oldPassword,
          errorMsg: "密码只允许带下划线的6-18位数字字母组合",
          reg: /^[A-Za-z0-9_]{6,18}$/,
        },
        newPassword: {
          value: this.updateInfo.newPassword,
          errorMsg: "密码只允许带下划线的6-18位数字字母组合",
          reg: /^[A-Za-z0-9_]{6,18}$/,
        },
      };
      let isPass = validForm.valid(o);

      if (!isPass) {
        return;
      }
      this.$toast.loading({
          message: "正在更改...",
          duration: 1000,
          forbidClick: true,
        });
        request({
          method: "post",
          url: "user/updatePassword",
          data: {
            username: this.updateInfo.username,
            oldPassword: this.updateInfo.oldPassword,
            newPassword: this.updateInfo.newPassword
          }
        }).then(res=>{
          if(res.status == 200) {
            this.$toast.clear();
            this.$toast.success("更改成功");
            this.updateInfo.username = "";
            this.updateInfo.oldPassword = "";
            this.updateInfo.newPassword = "";
            this.show = false;
          }
        }).catch(err=>{
          console.log(err);
        })

    },
    goOut() {
      this.$toast.loading({
          message: "注销中...",
          duration: 1000,
          forbidClick: true,
        });
      request({
        method: "post",
        url: "/user/logout",
        params: {
          userId: localStorage.getItem("userId")
        }
      }).then(res=>{
        console.log(res);
        if(res.data.status == 200)
        this.$toast.clear();
        localStorage.clear("token");
        localStorage.clear("userId");

        this.$dialog.alert({
            message: '注销成功...',
        }).then(() => {
            this.$router.push('/login');
        });
        this.$router.push({name:"login",query:{name:'home'}});
      })
      
    },
    goRegistry() {
      this.$router.push({name:"login",query:{name:'home'}});
    },
    goback() {
      this.$router.push("my");
    }

  },
  created() {
    let userId = localStorage.getItem("userId");
    if(userId != null) {
      this.userIsExist = true;
    }
  },
};
</script>

<style lang="scss" scoped>
</style>