<template>
  <div class="classfication">
    <van-nav-bar
      fixed
      title="分类详情"
      left-text="返回"
      left-arrow
      @click-left="goback"
    />


    <div class="detail">
      <van-sidebar v-model="activeKey" @change="onChange">
        <van-sidebar-item
          class="left-index"
          v-for="item in classficationList"
          :key="item.id"
          :title="item.name"
        />
      </van-sidebar>
      <div class="item-box">
        <div
          class="item"
          @click="goDetail(item.id)"
          v-for="item in articleList"
          :key="item.id"
        >
          <img class="item-img" src="../assets/icon/article.jpg" alt="" />
          <div class="other-info">
            <div class="title">{{ item.title.substr(0,21)+(item.title.substr(21,22)==0 ? '' : '…') }}</div>
            <div class="else">
              <div class="time-box">
                <div class="time-ago">{{ item.createTimeAgoStr }}</div>
              </div>
              <div class="readCounts">
                <img class="icon" src="../assets/icon/readCount.png" />
                <div class="num">{{ item.readCounts }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="article-load-more">
          <img
            src="../assets/icon/load-more-1.png"
            @click="getArticle(index, 3)"
          />
          <div class="article-load-name">加载更多</div>
        </div>

        <div class="footer">
          <a href="mailto:fyp010311@163.com"
            >产品反馈请联系开发者:@fyp</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/less/classfication.less";
import { request } from "../util/js/request";
export default {
  data() {
    return {
      key: "",
      activeKey: 0,
      classficationList: "",
      articleList: "",
      pageSize: 3,
      index: 0,
    };
  },
  methods: {
    goback() {
      this.$router.push({
        name: "home",
      });
    },
    getArticle(index, pageDelta) {
      this.$toast.loading({
        message: "正在加载中....",
        duration: 1000,
        forbidClick: true,
      });
      this.pageSize = this.pageSize + pageDelta;
      let classfication = this.classficationList[index];
      request({
        method: "post",
        url: "/user/article/getAllArticles",
        params: {
          page: 1,
          pageSize: this.pageSize,
          searchKey: classfication.name,
          userId: localStorage.getItem("userId"),
        },
      })
        .then((res) => {
          if (res.status == 200) {
            this.$toast.clear();
            this.articleList = res.data.rows;
          } else {
            this.$toast(res.msg);
          }
        })
    },
    onChange(index) {
      this.index = index;
      this.getArticle(index, 0);
    },
    goDetail(articeId) {
      // console.log(articeId);
      this.$router.push({
        name: "detail",
        query: { name: "classfication", articleId: articeId },
      });
      // this.$router.push({name:"detail",query:{articleId:articeId}});
    },
    getAllClassfications() {
      request({
        method: "post",
        url: "user/article/getAllClassfications",
      })
        .then((res) => {
          if (res.status == 200) {
            this.classficationList = res.data;
            this.onChange(0);
          }
        })
    },
  },

  created() {
    this.getAllClassfications();
  },
};
</script>

<style lang="scss" scoped>
</style>