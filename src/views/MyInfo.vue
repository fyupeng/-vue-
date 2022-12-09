<template>
  <div class="myInfo">
    <div class="nav">
      <van-nav-bar
        title="个人详情"
        left-text="返回"
        left-arrow
        @click-left="goback"
      />
    </div>

    <div class="data-top">
      <img class="bgImg" src="../assets/icon/myInfo.jpg" alt="" />
    </div>

    <div class="data-detail">
      <div class="my-img-box">
        <div class="pro">头像</div>
        <van-uploader :after-read="uploadAvatar">
          <img v-show="avatar == ''" :src="defaultAvatar" alt="" />
          <img v-show="!(avatar == '')" :src="avatar" alt="" />
        </van-uploader>
      </div>

      <div class="other-box">
        <div class="other-pro">用户id</div>
        <div
          class="pro-normal"
          style="color: rgb(101, 101, 101, 0.5); !important;"
        >
          <input v-model="userId" readonly @change="updateInfo" />
        </div>
      </div>

      <div class="dividing-line"></div>

      <div class="other-box">
        <div class="other-pro">名称</div>
        <div class="pro-normal">
          <input v-model="nickname" :disabled="edit" @change="updateInfo" />
        </div>
      </div>

      <div class="dividing-line"></div>

      <div class="other-box">
        <div class="other-pro">性别</div>
        <div class="center"></div>

        <div class="pro-normal" @click="showMoveOutWindow = true">
          <input v-model="sex" readonly />
        </div>
      </div>

      <div class="pop-up-windows">
        <van-dialog
          v-model="showMoveOutWindow"
          show-cancel-button
          :before-close="certainSex"
          confirm-button-text="确认"
        >
          <div class="pick-box">
            <van-field
              readonly
              clickable
              label="选择性别"
              :value="chooseSex"
              placeholder="选择"
              @click="showPicker = true"
              style="
                padding-bottom: 50px;
                padding-top: 80px;
                margin-left: 20px;
                margin-right: 20px;
                width: 80%;
              "
            />
            <van-popup v-model="showPicker" round position="bottom">
              <van-picker
                show-toolbar
                :columns="sexNameList"
                @cancel="showPicker = false"
                @confirm="changeConfirm"
              />
            </van-popup>
          </div>
        </van-dialog>
      </div>

      <div class="dividing-line"></div>

      <div class="other-box">
        <div class="other-pro">邮箱</div>
        <div class="pro-normal">
          <input v-model="email" :disabled="edit" @change="updateInfo" />
        </div>
      </div>

      <div class="dividing-line"></div>

      <div class="other-box">
        <div class="other-pro">电话</div>
        <div class="pro-normal">
          <input v-model="tel" :disabled="edit" @change="updateInfo" />
        </div>
      </div>

      <div class="dividing-line"></div>

      <div class="desc-box">
        <div class="other-pro">简介</div>
        <div class="pro-desc">
          <textarea
            v-model="description"
            :disabled="edit"
            @change="updateInfo"
          />
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import "../assets/less/myInfo.less";
import { request } from "../util/request";
import $ from "jquery";
export default {
  data() {
    return {
      chooseIndex: "",
      chooseSex: "",
      sexNameList: ["女", "男"],
      showMoveOutWindow: false,
      showPicker: false,
      avatar: "",
      userId: "",
      nickname: "",
      email: "",
      tel: "",
      description: "这家伙很懒，什么也没有留下！",
      default: true,
      sexNum: "",
      sex: "",
      defaultAvatar: require("../assets/icon/default-avatar.png"),
      edit: true,
      showPopover: false,
      actions: [
        { text: "男", icon: "add-o" },
        { text: "女", icon: "music-o" },
      ],
    };
  },
  methods: {
    certainSex(action, done) {
      if (action == "confirm") {
        setTimeout(done, 100);
        this.sex = this.chooseSex;
        this.sexNum = this.chooseIndex;
        this.updateInfo();
      }
      if (action == "cancel") {
        setTimeout(done, 100);
      }
    },
    changeConfirm(val, index) {
      this.showPicker = false;
      this.chooseSex = val;
      this.chooseIndex = index;
      return;
    },
    uploadAvatar(files) {
      // 此时可以自行将文件上传至服务器
      this.$toast.loading("上传中....");

      var formData = new FormData(); //创建form对象

      formData.append("file", files.file); //通过append向form对象添加数据
      formData.append("userId", localStorage.getItem("userId"));

      // var formData = new FormData($("#uploadForm")[0]);
      var that = this;
      $.ajax({
        type: "post",
        url: "/blogApi/user/uploadFace",
        data: formData,
	beforeSend: function (XMLHttpRequest) {
          XMLHttpRequest.setRequestHeader("token", localStorage.getItem("token"));
        },
        cache: false,
        processData: false,
        contentType: false,
        success: function (data) {
          console.log(data);
          that.$toast.clear();
          that.$toast.success("更改成功");
          that.$router.push({name:"my"});
        },
        error: function (xhr, errorMessage, e) {
          console.log("系统异常！" + e);
        },
      });


      /**
       *  axios 对于 form 表单的 martipart-form 会出现 莫名其妙的 问题
       */
      // this.axios({
      //   method: "post",
      //   url: this.remoteUrl + "/user/uploadFace",
      //   data: {
      //     formdata,
      //   },
      // })
      //   .then((res) => {
      //     console.log(res);
      //   })
      //   .catch((err) => {
      //     this.$toast(err);
      //   });
    },
    updateInfo() {
      this.$toast.loading({
        message: "正在修改...",
        duration: 1000,
        forbidClick: true,
      });
      request({
        method: "post",
        url: "user/completeUserInfo",
        data: {
          userId: localStorage.getItem("userId"),
          nickname: this.nickname,
          sex: this.sexNum,
          email: this.email,
          tel: this.tel,
          description: this.description,
        },
      })
        .then((res) => {
          this.$toast.clear();
          if (res.status == 200) {
            this.$toast.success("修改成功");
          } else {
            this.$toast.fail("修改失败");
          }
        })
    },
    goback() {
      this.$router.push("my");
    },
    getMyInfo() {
      let userToken = localStorage.getItem("token");
      if (userToken == null) {
        this.$toast.fail("请登录");
        this.$router.push({ name: "login", query: { name: "myInfo" } });
        return;
      }

      request({
        method: "post",
        url: "user/query",
        params: {
          userId: localStorage.getItem("userId"),
        },
      })
        .then((res) => {
          if (res.status == 200) {
            this.edit = false;
            var data = res.data;
            this.userId = data.userId;
            if (data.nickname != null) {
              this.nickname = data.nickname;
            }
            if (data.avatar != null) {
              this.avatar = this.remoteUrl + this.remoteDataDir + data.avatar;
	      console.log(this.avatar);
            }
            if (data.description != null) {
              this.description = data.description;
            }
            if (data.email != null) {
              this.email = data.email;
            }
            if (data.tel != null) {
              this.tel = data.tel;
            }
            if (data.sex != null) {
              this.sexNum = data.sex;
              this.sex = this.sexNum == 0 ? "女" : "男";
              this.defaultAvatar =
                this.sexNum == 0
                  ? require("../assets/icon/female.png")
                  : require("../assets/icon/male.png");
            }
          }
        })
    },
  },
  created() {
    this.getMyInfo();
  },
};
</script>

<style lang="scss" scoped>
</style>
