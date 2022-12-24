<template>
  <div class="appraisal">
    <van-nav-bar
      fixed
      title="植物鉴别"
      left-text="返回"
      left-arrow
      @click-left="goback"
    />

    <div class="video-box">
      <video id="myVideo" class="video-js bg-video">
        <source src="../assets/videos/sky.mp4" type="video/mp4" />
      </video>
      <!-- <video class="bg-video" src="../assets/videos/plant.mp4"></video> -->
    </div>
    <div class="appraisal-top">
      <div class="image-spot-box">
        <div
          @click="mouseAction"
          :class="!mouseenter ? 'spot-box' : 'spot-box active-spot-box'"
        >
          <van-uploader :after-read="upload">
            <img class="spot-img" src="../assets/icon/spot-2.png" alt="" />
          </van-uploader>
        </div>
      </div>
      <div class="upload-intro">图片上传</div>
    </div>

    <div class="detail">
      <div class="detail-top">
        <van-divider
          :style="{
            color: '#49b349',
            borderColor: '#49b349',
            padding: '0 16px',
          }"
        >
          <div>
            {{ useDefault ? "示例结果" : "识别结果" }}
          </div>
        </van-divider>
        <div class="progress-item" v-for="item in result" :key="item.key">
          <div class="progress-intro">识别度</div>
          <van-progress
            class="progress"
            :pivot-text="item.name"
            :percentage="item.score * 100"
            stroke-width="8"
            pivot-color="#49b349"
            color="linear-gradient(to right, #98d498, #49b349)"
          />
          <img
            class="item-img"
            :src="item.baike_info.image_url"
            @click="goUrl(item.baike_info.baike_url)"
            alt=""
          />
          <!-- <img class="" src="https://bkimg.cdn.bcebos.com/pic/94cad1c8a786c9179314ab54ca3d70cf3bc7574c" @click="goUrl(item.baike_info.baike_url)" alt="" /> -->
          <div class="info">{{ item.baike_info.description }}</div>
        </div>
        <!-- <img src="" alt=""> -->
      </div>
    </div>

    <div class="footer">
      <a href="mailto:fyp010311@163.com"
            >产品反馈请联系开发者:@fyp</a>
    </div>
  </div>
</template>

<script>
// import { Base64 } from 'js-base64';
import $ from "jquery";
import "../assets/less/appraisal.less";
import { request } from "../util/js/request";
const Base64 = require("js-base64").Base64;
export default {
  data() {
    return {
      fmg: "",
      mouseenter: false,
      useDefault: true,
      result: [
        {
          name: "建兰",
          score: 0.3,
          baike_info: {
            baike_url: "http://baike.baidu.com/item/%E5%BB%BA%E5%85%B0/1068570",
            image_url:
              "https://bkimg.cdn.bcebos.com/pic/94cad1c8a786c9179314ab54ca3d70cf3bc7574c",
            description:
              "生于疏林下、灌丛中、山谷旁或草丛中,海拔600-1800米。产中国多地,广泛分布于东南亚和南亚各国，北至日本。此花有栽培,具有较高的园艺和草药价值。",
          },
        },
        {
          name: "墨兰",
          score: 0.5,
          baike_info: {
            baike_url: "http://baike.baidu.com/item/%E5%A2%A8%E5%85%B0/770508",
            image_url:
              "https://bkimg.cdn.bcebos.com/pic/95eef01f3a292df54f8a7aa1b9315c6034a8733d",
            description:
              "生于林下、灌木林中或溪谷旁湿润但排水良好的荫蔽处,海拔300-2000米。分布于中国、印度、缅甸、越南、泰国、琉球群岛等。",
          },
        },
        {
          name: "春兰",
          score: 0.2,
          baike_info: {
            baike_url: "https://baike.baidu.com/item/%E5%A2%A8%E5%85%B0/770508",
            image_url:
              "https://bkimg.cdn.bcebos.com/pic/fc1f4134970a304e6766f3c7dfc8a786c9175c42?x-bce-process=image/resize,m_lfit,w_536,limit_1/format,f_jpg",
            description:
              "分布于日本、朝鲜半岛南端、中国和印度东北部(待证实）;在中国分布于陕西南部、甘肃南部、江苏、安徽、浙江、江西、福建、台湾、河南南部、湖北、湖南、广东、广西、四川、贵州和云南。生长于海拔300-2200米(在中国台湾可上升到3000米)的多石山坡、林缘、林中透光处。",
          },
        },
      ],
    };
  },
  mounted() {
    this.initVideo();
  },
  methods: {
    goUrl(url) {
      window.location.href = url;
    },
    sleep(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, ms);
      });
    },

    async mouseAction() {
      this.mouseenter = true;
      await this.sleep(200);
      this.mouseenter = false;     
    },
    initVideo() {
      //初始化视频方法
      let myPlayer = this.$video(myVideo, {
        //确定播放器是否具有用户可以与之交互的控件。没有控件，启动视频播放的唯一方法是使用autoplay属性或通过Player API。
        controls: false,
        // 封面
        poster: require("../assets/img/sky.png"),
        //自动播放属性,muted:静音播放
        // autoplay: "muted",
        autoplay: "muted",
        loop: "loop",
        //建议浏览器是否应在<video>加载元素后立即开始下载视频数据。
        preload: "auto",
        //设置视频播放器的显示宽度（以像素为单位）
        // width: "100%",
        //设置视频播放器的显示高度（以像素为单位）
        // height: "200px",
      });
    },

    goback() {
      this.$router.push({ name: "home" });
    },
    upload(files) {
      let userToken = localStorage.getItem("token");
      let userId = localStorage.getItem("userId");
      if (userToken == null || userId == null) {
        this.$toast.fail("请登录");
        this.$router.push({ name: "login", query: { name: "home" } });
        return;
      }
      this.$toast.loading({
        message: "正在获取....",
        duration: 1000,
        forbidClick: false
      });
      var content = files.content;
      this.fmg = content.replace(/^data:image\/\w+;base64,/, "");


      this.loading = true;

      // const bodyFormdata = new FormData();

      // var pictureBOs = [
      //                       {
      //                           "pictureDesc": "图片描述1",
      //                           "pictureWidth": "100",
      //                           "pictureHeight": "120"
      //                       },
      //                       {
      //                           "pictureDesc": "图片描述2",
      //                           "pictureWidth": "100",
      //                           "pictureHeight": "120"
      //                       }
      //                  ]

      // bodyFormdata.append("file", files.file);
      // bodyFormdata.append("file", files.file);
      // bodyFormdata.append("userId", '221028ATNA3G1T7C');

      // console.log(bodyFormdata)

      // bodyFormdata.append("pictureBOs", JSON.stringify(pictureBOs));
      // request({
      //   method: "post",
      //   url:
      //     "user/picture/upload",
      //   data: bodyFormdata,
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // })
      //   .then((res) => {
      //     if (res.status == 200) {
      //       this.$toast.clear();
      //       this.$toast.success("处理成功");
      //       this.useDefault = false;
      //       this.result = res.data.result;
      //     }
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });

      request({
        method: "get",
        url: "user/plantIdentification",
      }).then((res) => {
          console.log(res)
          // 获取access_token
          if (res.status === 200) {
            this.$toast.clear();
            this.$dialog.alert({
                message: '获取成功',
            }).then(() => {
            });
            this.$toast.loading({
              message: "正在处理....",
              duration: 3000,
            });
            // 地址识别接口
            const bodyFormdata = new FormData();
            bodyFormdata.append("image", this.fmg);
            bodyFormdata.append("num", 3);
            request({
              method: "post",
              url:
                "user/plantIdentification",
              data: bodyFormdata,
              headers: {
                "Content-Type": "content-type=multipart/form-data",
              },
            })
              .then((res) => {
                if (res.status == 200) {
                  this.$toast.clear();
                  this.$toast.success("处理成功");
                  this.useDefault = false;
                  console.log(JSON.parse(res.data));
                  this.result = JSON.parse(res.data).result;
                  console.log(this.result)

                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
  created() {},
};
</script>

<style lang="scss" scoped>
</style>