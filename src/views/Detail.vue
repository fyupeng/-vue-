<template>
  <div class="detail">
    <van-nav-bar
      fixed
      title="文章详情"
      left-text="返回"
      left-arrow
      @click-left="goback"
    />

    <div class="intro-box">
      <h1 class="title">{{ article.title }}</h1>

      <div class="other">
        <div class="img-intro">
          <img v-show="!isShow" :src="this.remoteUrl + this.remoteDataDir + article.avatar" alt="" />
          <img v-show="isShow" src="../assets/icon/default-avatar.png" alt="" />
          <div class="name">{{article.nickName}}</div>
        </div>
        <div class="class-tag-time">
          <div class="classfication">
            <div class="desc">分类专栏:</div>
            <div class="block">{{ article.classficationName }}</div>
          </div>
          <div class="tag">
            <div class="desc">文章标签:</div>
            <div class="block">{{article.tagName}}</div>
          </div>
          <div class="publish-time">
            <div class="desc">发布时间:</div>
            <div class="publish-time-desc">{{article.createTime}}</div>
          </div>
        </div>
      </div>
    </div>

    <mavon-editor
      ref="md"
      :subfield="false"
      defaultOpen="preview"
      :boxShadow="false"
      :editable="false"
      style="
        z-index: 1;
        border: 1px solid #d9d9d9;
        height: 70vh;
        margin-bottom: 10px;
        margin-left:10px;
        margin-right:10px
      "
      v-model="content"
      :scrollStyle="false"
      :toolbarsFlag="false"
    />

    <div class="comment-box">
      <div class="comment-notice">
        <div class="reply-num">共{{ commentCounts }}条回复</div>
        <div class="sort">
          <div
            :class="activeSort ? 'active-sort recent' : 'recent'"
            @click="latestSort"
          >
            按时间正序
          </div>
          <div>/</div>
          <div
            :class="!activeSort ? 'active-sort latest' : 'latest'"
            @click="recentSort"
          >
            按时间倒序
          </div>
        </div>
      </div>

      <div
        class="comment-item"
        v-for="(item, index) in commentList"
        :key="index"
      >
        <div class="img-box">
          <img
            v-show="!rules[index].avatarDefault"
            class="avatar-img"
            :src="item.fromUserAvatar"
          />
          <img
            v-show="rules[index].avatarDefault"
            class="avatar-img"
            src="../assets/icon/default-avatar.png"
          />
          <div v-show="!rules[index].nickNameDefault" class="from-name">
            {{ item.fromUserNickName }}
          </div>
          <div v-show="rules[index].nickNameDefault" class="from-name">
            {{ item.fromUserId }}
          </div>
          <div v-show="item.toUserNickName != null" class="to-name">回复：{{item.toUserNickName}}</div>
        </div>
        <!-- <van-divider /> -->
        <div class="message">{{ item.comment }}</div>
        <div class="dvide"></div>
        <div class="other">
          <div class="reply">
            <img
              class="reply-icon"
              src="../assets/icon/reply.png"
              @click="reply(item)"
            />
          </div>
          <div class="time">{{ item.createTimeAgo }}</div>
        </div>
        <div v-show="item.fatherCommentId != null" class="father-comment-content">引用 “ {{item.fatherCommentContent}} ”</div>
      </div>

      <div class="storage-box">
        <div class="comment-load-more">
          <img
            class="load-img"
            src="../assets/icon/load-more-2.png"
            alt="加载更多"
            @click="loadMore(3)"
          />
          <div class="load-name">加载更多</div>
        </div>
        <div class="pick-up">
          <img
            class="collapse-img"
            src="../assets/icon/collapse-1.png"
            alt="加载更多"
            @click="collapseAll"
          />
          <div class="">全部收起</div>
        </div>
      </div>

      <div class="comment-footer">
        <div
          :class="
            !activeButton ? 'active-comment-box comment-box' : 'comment-box'
          "
        >
          <img class="my-comment-img" :src="myAvatar" alt="" />
          <textarea
            id="comment"
            :placeholder="replyPlaceholder"
            v-model="commentContent"
            :class="!activeButton ? 'active-textarea' : ''"
          />
          <button
            v-show="activeButton"
            class="first-button"
            @click="hidenButton"
          >
            评论
          </button>
        </div>
        <div v-show="!activeButton" class="publish-box">
          <div class="blank"></div>
          <button class="second-button" aria-placeholder="1" @click="publish">
            发表评论
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import "../assets/less/detail.less";
import { request } from "../util/js/request";

export default {
  data() {
    return {
      articleId: "",
      isShow: true,
      defaultAvatar: "../assets/icon/grass.jpg",
      content: "",
      article: {
        title: "无标题",
        classficationName: "linux",
      },
      commentList: "",
      commentCounts: "",
      rules: [],
      commentSize: 3,
      activeSort: true,
      activeButton: true,
      commentContent: "",
      toUserId:"",
      fatherCommentId:"",
      replyPlaceholder:"",
      param:"",
      myAvatar: require("../assets/icon/default-avatar.png")
    };
  },
  methods: {
    getMyInfo() {
      let userToken = localStorage.getItem("token");
      let userId = localStorage.getItem("userId");

      if (userId == null && userToken == null) {
        this.$toast.fail("请登录");
        this.$router.push({
          name: "login",
          params: { name: "detail", param: { articleId: this.articleId } },
        });
        return;
      }
      request({
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        url: "user/query",
        params: {
          userId: localStorage.getItem("userId"),
         },
      })
        .then((res) => {
          if (res.status == 200) {
            let data = res.data;
            if(data.avatar != null) {
              this.myAvatar = this.remoteUrl + this.remoteDataDir + res.data.avatar;
            }
          } else {
            this.$toast(res.msg);
          }
        })
    },
    collapseAll() {
      this.commentSize = 3;
      this.getAllComments(this.articleId, 3, this.activeSort ? 1 : 2);
    },
    loadMore(loadNum) {
      this.commentSize += loadNum;
      this.getAllComments(
        this.articleId,
        this.commentSize,
        this.activeSort ? 1 : 2
      );
    },
    reply(item) {
      this.activeButton = false;
      var reply = item.fromUserNickName == null ? item.fromUserId : item.fromUserNickName;
      this.replyPlaceholder = "回复: " + reply;
      document.getElementById("comment").scrollIntoView({ block: "center", behavior: "smooth" });
      this.toUserId = item.fromUserId;
      this.fatherCommentId = item.id;
    },
    publish() {
      let userToken = localStorage.getItem("token");
      let userId = localStorage.getItem("userId");
      if (userToken == null || userId == null) {
        this.$toast.fail("请登录");
        this.$router.push({
          name: "login",
          params: { name: "detail", param: { articleId: this.articleId } },
        });
        return;
      }
      this.$toast.loading({
        message: "正在发布...",
        duration: 1000,
        forbidClick: true,
      });
      request({
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        url: "user/comment/saveComment",
        data: {
          articleId: this.articleId,
          comment: this.commentContent,
          fromUserId: localStorage.getItem("userId"),
          toUserId:this.toUserId == "" ? undefined : this.toUserId,
          fatherCommentId:this.fatherCommentId == "" ? undefined : this.fatherCommentId
         },
      })
        .then((res) => {
          if (res.status == 200) {
            this.$toast.clear();
            this.$toast.success("发表成功！");
            this.commentSize = 3;
            this.commentContent = "";
            this.getAllComments(this.articleId, 3, 2);
          } else {
            this.$toast(res.msg);
          }
        })
    },
    hidenButton() {
      this.activeButton = false;
    },
    latestSort() {
      this.activeSort = true;
      this.getAllComments(this.articleId, this.commentSize, 1);
    },
    recentSort() {
      this.activeSort = false;
      this.getAllComments(this.articleId, this.commentSize, 2);
    },
    getAllComments(articleId, pageSize, sort) {
      this.$toast.loading("正在加载中....");
      request({
        method: "post",
        url: "user/comment/getAllComments",
        params: {
          articleId: articleId,
          page: 1,
          pageSize: pageSize,
          sort: sort,
        },
      })
        .then((res) => {
          if (res.status == 200) {
            this.rules = [];
            this.$toast.clear();
            this.commentList = res.data.rows;
            this.commentCounts = res.data.records;
            this.commentList.map((o) => {
              let rule = {
                index: 0,
                avatarDefault: false,
                nickNameDefault: false,
              };
              if (o.fromUserAvatar == null) {
                rule.avatarDefault = true;
                if (o.fromUserNickName == null) {
                  rule.nickNameDefault = true;
                }
                this.rules.push(rule);
              } else {
                o.fromUserAvatar = this.remoteUrl + this.remoteDataDir + o.fromUserAvatar;
                this.rules.push(rule);
              }
            });
          } else {

          }

          // console.log(this.commentList);
        })
    },
    goback() {
      let query = this.$route.query;
      let param = query.param;
      var routeName = query.name;
      this.$router.push({name:routeName,params:{param}});
      // this.$router.go(-1);
    },
    getArticleDetail(articeId) {
      this.$toast.loading("正在加载中....");
      request({
        method: "post",
        url: "user/article/getArticleDetail",
        params: {
          articleId: articeId,
        },
      })
        .then((res) => {
          if (res.status == 200) {
            let data = res.data;
            let createTime = data.createTime;
            let yearMonDay = createTime.substr(0,10);
            let hourMinSec = createTime.substr(11,8);
            let resTime = yearMonDay + " " + hourMinSec;
            data.createTime = resTime;

            this.$toast.clear();
            this.article = data;
            this.content = data.content;
            if(data.avatar != null) {
              this.isShow = false;
            }
          }
        })
    },
  },
  created() {
    let query = this.$route.query;

    let param = query.param;

    this.param = param;
    let articleId = query.articleId;
    let username = query.auth;
    if (param != undefined) {
      articleId = param.articleId;
    }
    this.articleId = articleId;
    // 做一个 游客 免登陆
    if(username == "youkeUser" && localStorage.getItem("token") == null) {
      this.axios({
        method: "post",
        url: "/blogApi/user/login",
        data: {
          username: username,
          password: username,
        },
      })
        .then((res) => {
          if (res.data.status == 200) {
            this.$toast.clear();
            this.$toast.success("欢迎游客");
            localStorage.setItem("userId", res.data.data.id);
            }
        })
    } else {
      this.getMyInfo();
    }
    this.getArticleDetail(articleId);
    this.getAllComments(articleId, this.commentSize, 2);
   
  },
};
</script>


<style lang="scss" scoped>
</style>