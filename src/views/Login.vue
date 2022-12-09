<template>
  <div class="login">
    <div class="logo">
      <img src="../assets/icon/leaf-logo.png" alt="" />
    </div>

    <div class="login-box">
      <van-form class="login-form">
        <van-field
          v-model="userInfo.username"
          name="username"
          label="用户名"
          placeholder="用户名"
          style="
            background: rgba(255, 255, 255, 0.6);
            border-radius: 10px 10px 10px 10px;
            margin-bottom: 10px;
          "
        />
        <van-field
          v-model="userInfo.password"
          :type="showPassword ? 'password' : 'text'"
          name="密码"
          label="密码"
          placeholder="密码"
          :right-icon="showPassword ? 'closed-eye' : 'eye-o'"
          @click-right-icon="showPassword = !showPassword"
          style="
            background: rgba(255, 255, 255, 0.6);
            border-radius: 10px 10px 10px 10px;
            margin-bottom: 10px;
          "
        />

        <div class="option-box">
          <div class="pro">登录选项：</div>
          <van-radio-group v-model="radio" class="options-radio">
            <van-radio name="1" style="padding: 10px">普通用户</van-radio>
            <van-radio name="2" style="padding: 10px">管理员</van-radio>
          </van-radio-group>
        </div>

        <div style="margin: 16px">
          <van-button
            style="background: #70db70; color: black; border: 1px solid #70db70"
            round
            block
            type="info"
            native-type="button"
            @click="login"
            >登录</van-button
          >
        </div>
        <div style="margin: 16px">
          <van-button
            style="background: #70db70; color: black; border: 1px solid #70db70"
            round
            block
            type="info"
            native-type="button"
            @click="showPopup"
          >
            前往注册</van-button
          >
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
            <h1>注册信息</h1>
            <div class="register">
              <van-field
                v-model="registerInfo.username"
                name="phone"
                label="用户名"
                placeholder="用户名"
                style="padding-inline: 10%; background: rgba(255, 255, 255, 0)"
              />
              <van-field
                v-model="registerInfo.password"
                :type="showPassword ? 'password' : 'text'"
                name="password "
                label="密码"
                placeholder="密码"
                :right-icon="showPassword ? 'closed-eye' : 'eye-o'"
                @click-right-icon="showPassword = !showPassword"
                style="padding-inline: 10%; background: rgba(255, 255, 255, 0)"
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
                @click="register"
                >注册</van-button
              >
            </div>
          </div>
        </van-popup>
      </van-form>
    </div>
  </div>
</template>

<script>
import "../assets/less/login.less";
import { validForm } from "../assets/validForm.js";

export default {
  data() {
    return {
      radio: "1",

      showPassword: true,
      show: false,
      active: false,

      userInfo: {
        username: "",
        password: "",
      },

      registerInfo: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    login() {
      let o = {
        username: {
          value: this.userInfo.username,
          errorMsg: "用户名只允许带特殊符号@.的6-18位字母数字组合",
          reg: /^[A-Za-z0-9@.]{6,18}$/,
        },
        password: {
          value: this.userInfo.password,
          errorMsg: "密码只允许带下划线的6-18位数字字母组合",
          reg: /^[A-Za-z0-9_]{6,18}$/,
        },
      };
      let isPass = validForm.valid(o);

      if (!isPass) {
        return;
      }
      this.$toast.loading({
        message: "正在登录中...",
        duration: 10000,
        forbidClick: true,
      });

      if(this.radio == 1) {
        this.axios({
          method: "post",
          url: "/blogApi/user/login",
          data: {
            username: this.userInfo.username,
            password: this.userInfo.password,
          },
      })
        .then((res) => {
          if (res.data.status == 200) {
            this.$toast.clear();
            this.$toast.success("欢迎登录");
            localStorage.setItem("token", res.data.data.userToken);
            localStorage.setItem("userId", res.data.data.id);
            localStorage.setItem("timestamp", new Date().getTime());
            /**
             * 实现带参，可以巧妙利用 其他页 把 路由名称通过参数传过来
             */
            let query = this.$route.query;
            let param = query.param;

            let routeName = query.name;


            // 没有转发
            if (routeName == undefined) {

              this.$router.push({ name: "home" }, (onComplete) => {
              },(onAbort) => {
                this.$router.push({ name: "home" }).catch(() => true);
              });

            }
            
            // 触发登录转发带参数
            if (param != undefined) {

              this.$router.push({ name: routeName, params: { param } }, (onComplete) => {
              },(onAbort) => {
                this.$router.push({ name: routeName, params: { param } }).catch(() => true);
              });
              
            }
            
            // 触发登录转发不带参数
            this.$router.push({ name: routeName }, (onComplete) => {
            },(onAbort) => {
              this.$router.push({ name: routeName }).catch(() => true);
            });


          } else {
            this.$toast(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      } else {
        this.axios({
          method: "post",
          url: "/blogApi/admin/login",
          data: {
            username: this.userInfo.username,
            password: this.userInfo.password,
          },
        })
        .then((res) => {
          if (res.data.status == 200) {
            this.$toast.clear();
            this.$toast.success("尊贵的管理员");
            localStorage.setItem("token", res.data.data.userToken);
            localStorage.setItem("userId", res.data.data.id);
            localStorage.setItem("timestamp", new Date().getTime());
            /**
             * 实现带参，可以巧妙利用 其他页 把 路由名称通过参数传过来
             */
            let query = this.$route.query;
            let param = query.param;

            let routeName = query.name;


            
            // 没有转发
            if (routeName == undefined) {

              this.$router.push({ name: "home" }, (onComplete) => {
              },(onAbort) => {
                this.$router.push({ name: "home" }).catch(() => true);
              });

            }

            // 触发登录转发带参数
            if (param != undefined) {

              this.$router.push({ name: routeName, params: { param } }, (onComplete) => {
              },(onAbort) => {
                this.$router.push({ name: routeName, params: { param } }).catch(() => true);
              });

            }

            // 触发登录转发不带参数
            this.$router.push({ name: routeName }, (onComplete) => {
              },(onAbort) => {
                this.$router.push({ name: routeName }).catch(() => true);
              });


          } else {
            this.$toast(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      }

      


    },

    register() {
      let o = {
        username: {
          value: this.registerInfo.username,
          errorMsg: "用户名只允许带@.的6-18数字字母",
          reg: /^[A-Za-z0-9@.]{6,18}$/,
        },
        password: {
          value: this.registerInfo.password,
          errorMsg: "密码只允许带下划线的6-18位数字字母组合",
          reg: /^[A-Za-z0-9_]{6,18}$/,
        },
      };
      let isPass = validForm.valid(o);

      if (!isPass) {
        return;
      }
      this.$toast.loading({
        message: "注册中...",
        duration: 1000,
        forbidClick: true,
      });
      this.axios({
        method: "post",
        url: "/blogApi/user/regist",
        data: {
          username: this.registerInfo.username,
          password: this.registerInfo.password,
        },
      })
        .then((res) => {
          if (res.data.status == 200) {
            this.$toast.success("恭喜你已注册成功!");
            this.userInfo.username = this.registerInfo.username;
            this.userInfo.password = this.registerInfo.password;
            this.show = false;
          } else {
            this.$toast(res.data.data.msg);
          }
        })
    },
    showPopup() {
      this.show = true;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>