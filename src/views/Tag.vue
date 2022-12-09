<template>
  <div class="tag">
    <div class="nav">
      <van-nav-bar
        title="标签管理"
        left-text="返回"
        left-arrow
        @click-left="goback"
      />
    </div>

    <div class="bg">
      <img class="bgImg" src="../assets/icon/myInfo.jpg" alt="" />
    </div>

    <div class="detail">
      <div class="tag-top">
        <div class="tag-num">全部 ( {{ tagList.length + 1 }} )</div>
        <div class="other">
          <button class="edit-tag" @click="editTag">{{editable ? '取消标签' : '编辑标签'}}</button>
          <button class="new-tag" @click="createTag">新建标签</button>
        </div>
      </div>

      <van-dialog
        v-model="showSaveWindow"
        title="新建标签"
        show-cancel-button
        :before-close="saveTag"
      >
        <div class="create-box">
          <div class="pro">标签名：</div>
          <input v-model="tagName" placeholder="新建标签名" class="pro-name" />
        </div>
      </van-dialog>

      <van-dialog
        v-model="showRemoveWindow"
        title="移除标签"
        show-cancel-button
        :before-close="removeTag"
      >
      </van-dialog>

      <div class="tag-intro">
        <div class="type">类别</div>
        <div class="num">文章数</div>
      </div>

      <div class="dividing"></div>

      <div class="tag-item" @click="goNoneTagDetail(noneTagList)">
        <div class="tag-img-box">
          <img src="../assets/icon/tag.jpg" class="tag-img" />
          <div class="tag-name">无状态</div>
        </div>
        <div class="article-num">{{noneTagList.length}}</div>
      </div>

      <div class="tag-item" v-for="item in tagList" :key="item.id">
        <div class="tag-img-box">
          <img
            v-show="showTrash"
            class="remove-img"
            src="../assets/icon/remove.png"
            @click="clickTrash(item.id)"
          />
          <img
            src="../assets/icon/tag.jpg"
            class="tag-img"
            @click="goTagDetail(item.id)"
          />
          <div
            v-show="!editable"
            class="tag-name"
            @click="goTagDetail(item.id)"
          >
            {{ item.name }}
          </div>
          <input
            v-show="editable"
            v-model="item.name"
            class="tag-name"
            @mouseleave="markArticleTag(item)"
          />
        </div>
        <div class="article-num" @click="goTagDetail(item.id)">
          {{ item.articleNum }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/less/tag.less";
import { request } from "../util/request";
export default {
  data() {
    return {
      tagList: [],
      noneTagList:[],
      showSaveWindow: false,
      showRemoveWindow: false,
      showTrash: false,
      editable: false,
      tagName: "",
      removeTagId: "",

    };
  },
  methods: {
    goNoneTagDetail(nonetagList) {
      this.$router.push({
        name: "tagDetail",
        params: { param: { tagId:"noneTag",tagList: nonetagList } },
      });
    },
    getArticleWithNoneTag() {
      request({
        method: "post",
        url: "user/tag/getArticleWithNoneTag",
        params: {
          userId: localStorage.getItem("userId")
        }
      }).then(res=>{
        if(res.status == 200) {
          this.noneTagList = res.data || [];
        }
      })
    },
    markArticleTag(item) {
      request({
        method: "post",
        url: "user/tag/updateTag",
        data: {
          id: item.id,
          name: item.name,
          userId: item.userId,
        },
      })
        .then((res) => {
          if (res.status == 200) {
            this.$toast.success("修改成功");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    goTagDetail(tid) {
      this.$router.push({
        name: "tagDetail",
        params: { param: { tagId: tid } },
      });
    },
    editTag() {
      this.showTrash = !this.showTrash;
      this.editable = !this.editable;
    },
    clickTrash(tagId) {
      this.showRemoveWindow = true;
      this.removeTagId = tagId;
    },
    createTag() {
      this.showSaveWindow = true;
    },
    removeTag(action, done) {
      if (action == "confirm") {
        setTimeout(done, 100);
        request({
          method: "post",
          url: "user/tag/removeTag",
          params: {
            tagId: this.removeTagId,
          },
        })
          .then((res) => {
            if (res.status == 200) {
              this.getAllTags();
              this.getArticleWithNoneTag();
            }
          })
      }
      if (action == "cancel") {
        setTimeout(done, 100);
      }
    },
    saveTag(action, done) {
      if (action == "confirm") {
        setTimeout(done, 100);
        let userToken = localStorage.getItem("token");
        if (userToken == null) {
          this.$toast.fail("请登录");
          this.$router.push({ name: "login", query: { name: "tag" } });
          return;
        }
        this.$toast.loading({
          message: "创建中...",
          duration: 1000,
          forbidClick: true,
        });
        request({
          method: "post",
          url: "user/tag/saveTag",
          data: {
            name: this.tagName,
            userId: localStorage.getItem("userId"),
          },
        })
          .then((res) => {
            console.log(1111)
            console.log(res)
            if (res.status == 200) {
              this.$toast.success("创建成功");
              this.getAllTags();
            } else {
              this.$toast(res.data.msg);
            }
          })
      }
      if (action == "cancel") {
        setTimeout(done, 100);
      }
    },
    goback() {
      this.$router.push("my");
    },
    getAllTags() {
      request({
        method: "post",
        url: "user/tag/getAllTags",
        params: {
          userId: localStorage.getItem("userId"),
        },
      })
        .then((res) => {
          this.tagList = res.data || [];
          // this.tagNum = this.tagList != null ? this.tagList.length : 1;
        })
    },
  },

  created() {
    var that = this;
    window.addEventListener("offline", function () {
      that.$router.push({ name: "netInterupt" });
      // 网络由正常常到异常时触发
    });
    let userToken = localStorage.getItem("token");
      if (userToken == null) {
        this.$toast.fail("请登录");
        this.$router.push({ name: "login", query: { name: "tag" } });
        return;
      }
    this.getAllTags();
    this.getArticleWithNoneTag();
  },
};
</script>

<style lang="scss" scoped>
</style>