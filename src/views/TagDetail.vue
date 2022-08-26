<template>
  <div class="tagDetail">
    <div class="nav">
      <van-nav-bar
        title="标签内容"
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
        <div class="article-num">全部 ( {{ articleList.length }} )</div>
        <div class="other">
          <button class="edit-article" @click="editable = !editable">
            {{ editable ? "取消编辑" : "编辑" }}
          </button>
          <button
            v-show="editable"
            class="move-out"
            @click="showMoveOutWindow = true"
          >
            移出到
          </button>
          <button
            v-show="editable"
            class="move-out"
            @click="showRemoveWindow = true"
          >
            删除
          </button>
        </div>
      </div>

      <div class="pop-up-windows">
        <van-dialog
          v-model="showRemoveWindow"
          title="删除文章"
          show-cancel-button
          :before-close="removeArticle"
          confirm-button-text="确认"
        >
          <div style="color: red; padding-top: 25px; padding-bottom: 25px">
            {{ message }}
          </div>
        </van-dialog>

        <van-dialog
          v-model="showMoveOutWindow"
          title="移出文章"
          show-cancel-button
          :before-close="reMarkArticleTag"
          confirm-button-text="确认"
        >
          <div class="pick-box">
            <van-field
              readonly
              clickable
              label="标签:"
              :value="chooseTagName"
              placeholder="选择标签"
              @click="showPicker = true"
              style="margin-left: 10px; width: 90%; font-size: 16px"
            />
            <van-popup v-model="showPicker" round position="bottom">
              <van-picker
                title="标签分类"
                show-toolbar
                :columns="tagNameList"
                @cancel="showPicker = false"
                @confirm="changeConfirm"
              />
            </van-popup>
          </div>
        </van-dialog>
      </div>

      <van-radio-group
        v-model="radio"
        class="article-item"
        v-for="(item, index) in articleList"
        :key="index"
      >
        <van-radio
          class="select-radio"
          v-show="editable"
          :name="index"
        ></van-radio>

        <img
          class="item-img"
          src="../assets/icon/article.jpg"
          alt=""
          @click="goDetail(item.articleId)"
        />
        <div class="other-info">
          <div class="title">{{ item.title.substr(0,35)+(item.title.substr(35,36)==0 ? '' : '…') }}</div>
          <div class="else">
            <div class="time-box">
              <div class="time-ago">{{ item.createTimeAgoStr }}</div>
            </div>
            <div class="readCounts">
              <img
                class="icon"
                @click="goUpdate(item.articleId)"
                src="../assets/icon/edit-1.png"
              />
            </div>
            <div class="readCounts">
              <img class="icon" src="../assets/icon/readCount.png" />
              <div class="num">{{ item.readCounts }}</div>
            </div>
          </div>
        </div>
      </van-radio-group>
    </div>
  </div>
</template>

<script>
import "../assets/less/tagDetail.less";
import { request } from "../util/request";
export default {
  data() {
    return {
      radio: "-1",
      editable: false,
      showMoveOutWindow: false,
      showPicker: false,
      tagId: "",
      chooseTagName: "",
      articleList: "",
      tagNameList: [],
      tagList: [],
      chooseTagId: "",
      chooseArticleId: "",
      chooseArticles2TagsId: "",
      showRemoveWindow: false,
      message: "注意：删除后不可恢复！",
    };
  },
  methods: {
    goUpdate(articleId) {
      this.$router.push({
        name: "update",
        query: { name: "tagDetail", articleId: articleId },
      });
    },
    changeConfirm(val, index) {
      this.showPicker = false;
      this.chooseTagName = val; //传值

      this.tagList.map((o) => {
        if (o.name == this.chooseTagName) {
          this.chooseTagId = o.id;
        }
      });
    },
    removeArticle(action, done) {
      var index = this.radio;
      if (index == -1) {
        this.$toast.fail("未选择文章");
        setTimeout(done, 100);
        return;
      }
      this.chooseArticleId = this.articleList[index].articleId;
      if (action == "confirm") {
        setTimeout(done, 100);
        request({
          method: "post",
          url: "user/article/removeArticle",
          params: {
            articleId: this.chooseArticleId,
            userId: localStorage.getItem("userId")
          },
        }).then(res=>{
          if(res.status == 200) {
            this.$toast.success("删除成功");
            this.$router.push("tag");
          }
        })
      }
      if (action == "cancel") {
        setTimeout(done, 100);
      }
    },
    reMarkArticleTag(action, done) {
      var index = this.radio;
      if (index == -1) {
        this.$toast.fail("未选择文章");
        setTimeout(done, 100);
        return;
      }
      this.chooseArticleId = this.articleList[index].articleId;
      if (action == "confirm") {
        setTimeout(done, 100);
        let userToken = localStorage.getItem("token");
        if (userToken == null) {
          this.$toast.fail("请登录");
          this.$router.push({
            name: "login",
            query: {
              name: "tagDetail",
              param: { tagId: "noneTag", tagList: this.articleList },
            },
          });
          return;
        }
        this.$toast.loading({
          message: "正在操作中...",
          duration: 1000,
          forbidClick: true,
        });

        // 对于 无标签的文章， 直接 标记
        if (this.tagId == "noneTag") {
          request({
            method: "post",
            url: "user/tag/markArticleTag",
            data: {
              articleId: this.chooseArticleId,
              tagId: this.chooseTagId,
            },
          })
            .then((res) => {
              if (res.status == 200) {
                this.$toast.success("移出成功");
                this.$router.push("tag");
              } else {
                this.$toast.fail("未选择标签");
              }
            })
        } else {
          this.chooseArticles2TagsId = this.articleList[index].id;
          // 对于 有标签的文章， 则使用 重新标记
          request({
            method: "post",
            url: "user/tag/reMarkArticleTag",
            data: {
              id: this.chooseArticles2TagsId,
              articleId: this.chooseArticleId,
              tagId: this.chooseTagId,
            },
          })
            .then((res) => {
              if (res.status == 200) {
                this.$toast.success("移出成功");
                this.$router.push("tag");
              }
            })
        }
      }
      if (action == "cancel") {
        setTimeout(done, 100);
      }
    },
    goDetail(articeId) {
      this.$router.push({
        name: "detail",
        query: {
          name: "tagDetail",
          param: {
            articleId: articeId,
            tagId: this.tagId,
            tagList: this.articleList,
          },
        },
      });
      // this.$router.push({name:"detail",query:{articleId:articeId}});
    },
    getArticleTag() {
      request({
        method: "post",
        url: "user/tag/getArticleTag",
        params: {
          tagId: this.tagId,
        },
      })
        .then((res) => {
          if (res.status == 200) {
            let articleList = res.data;
            this.articleList = articleList;
          }
        })
    },
    goback() {
      this.$router.push("tag");
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
          if (res.status == 200) {
            let data = res.data;
            this.tagList = data;
            data.map((o) => {
              this.tagNameList.push(o.name);
            });
          }
        })
    },
  },

  created() {
    let userToken = localStorage.getItem("token");
    if (userToken == null) {
      this.$toast.fail("请登录");
      this.$router.push({ name: "login", query: { name: "tagDetail" } });
      return;
    }

    let params = this.$route.params;
    let param = params.param;

    this.tagId = param.tagId;
    if (this.tagId != "noneTag") {
      this.getArticleTag();
    } else {
      let articleList = param.tagList;
      articleList.map((o) => {
        o.articleId = o.id;
      });
      this.articleList = articleList;
    }
    this.getAllTags();
  },
};
</script>

<style lang="scss" scoped>
</style>