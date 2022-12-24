
<template>
  <div class="update">
    <van-nav-bar
      title="更新文章"
      left-text="返回"
      left-arrow
      @click-left="goback"
    />

    <div class="edit-head">
      <div class="title-intro">文章标题：</div>
      <div class="title">
        <input v-model="article.title" class="" />
      </div>
      <!-- <div class="save">保存</div> -->
      <div class="publish">
        <img
          class="publish-img"
          src="../assets/icon/publish.png"
          @click="publish"
          alt=""
        />
      </div>
    </div>

    <div class="pop-up-windows">
      <van-dialog
        v-model="show"
        title="发布文章"
        show-cancel-button
        :before-close="beforeClose"
        confirm-button-text="发布"
      >
        <div class="summary">
          <div class="summary-intro">摘要:</div>
          <div class="summary-content">
            <textarea v-model="article.summary"></textarea>
          </div>
        </div>

        <div class="type">
          <div class="type-content">
            <van-field
              readonly
              clickable
              label="分类"
              :value="chooseClassName"
              placeholder="选择分类"
              @click="showClassPicker = true"
              style="margin-left: 10px; width: 90%"
            />
            <van-field
              readonly
              clickable
              label="封面"
              :value="choosePictureName"
              placeholder="选择图片"
              @click="showCoverPicker = true"
              style="margin-left: 10px; width: 90%"
            />
            <van-popup v-model="showClassPicker" round position="bottom">
              <van-picker
                title="文章分类"
                show-toolbar
                :columns="classNameList"
                @cancel="showClassPicker = false"
                @confirm="changeConfirm"
              />
            </van-popup>

            <van-popup closeable close-icon="close" v-model="showCoverPicker" round position="bottom">
              <div class="picture-box">
                  <div  class="picture-item item-border item-flex" v-for="(item, index) in pictureList">
                  
                      <div @click="curSelect(index)" class="item" :class="enableIndex == index ? 'dark' : 'light'">
                          <div v-show="enableIndex === index" @click="select" class="edit">
                            <img style="line-height: 110px" class="edit-icon" src="../assets/icon/select.png"/>
                          </div>
                      </div>

                      <img 
                      :src=" remoteUrl + remoteDataDir + item.picturePath" 
                      :alt="item.pictureDesc"
                      class="item"
                      />
                  </div>

              </div>   
            </van-popup>
            

          </div>
        </div>

        <!-- <div class="tag">
          <div class="tag-intro">标签:</div>
          <div class="tag-content">内容</div>
        </div> -->
      </van-dialog>
    </div>

    <div class="edit-area">
      <mavon-editor
        ref="md"
        placeholder="请输入文档内容..."
        :boxShadow="false"
        style="z-index: 1; border: 1px solid #d9d9d9; height: 80vh"
        v-model="article.content"
        :toolbars="toolbars"
      />
    </div>
  </div>
</template>
 

<script>
import "../assets/less/update.less";
import { request } from "../util/js/request";

export default {
  data() {
    return {
      curPage: 1,
      pageSize: 999,
      curPicture: {},
      choosePictureName: '',
      enableIndex: -1,
      pictureList: [],
      classFicationList: [],
      chooseClassName: "", //input框内显示的值
      classNameList: [],
      showClassPicker: false,
      showCoverPicker: false,
      show: false,
      // 编辑器
      content: "",
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: true, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: true, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: true, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true, // 预览
      },
      articleId: "",
      article: {},
    };
  },

  methods: {
    select() {
      this.showCoverPicker = false;
      this.choosePictureName = this.curPicture.pictureDesc
    },
    curSelect(index) {
      let userToken = localStorage.getItem("token");
      let userId = localStorage.getItem("userId");
      if (userToken == null || userId == null) {
        this.$toast.fail("请登录");
        this.$router.push({ name: "login", query: { name: "myPicture" } });
        return;
      }
      this.enableIndex = index;
      this.curPicture = this.pictureList[index];
    },
    getArticleDetail(articleId) {
      this.$toast.loading({
        message: "正在为你加载....",
        duration: 1000,
        forbidClick: true,
      });
      request({
        method: "post",
        url: "user/article/getArticleDetail",
        params: {
          articleId: articleId,
        },
      })
        .then((res) => {
          if (res.status == 200) {
            this.$toast.clear();
            this.article = res.data;
            this.chooseClassName = this.article.classficationName;
            
            this.pictureList.map(picture => {
              if (picture.id == this.article.articleCoverId) {
                this.choosePictureName = picture.pictureDesc
              }
            })
            

          } else {
            this.$toast(res.msg);
          }
        })
    },

    getAllClassfication() {
      request({
        method: "post",
        url: "user/article/getAllClassfications",
        data: {},
      })
        .then((res) => {
          let data = res.data;
          this.classFicationList = data;
          data.map((o) => {
            this.classNameList.push(o.name);
          });
        })
    },
    changeConfirm(val, index) {
      this.showPicker = false;
      this.chooseClassName = val; //传值

      this.classFicationList.map((o) => {
        if (o.name == this.chooseClassName) {
          this.article.classId = o.id;
        }
      });
    },
    beforeClose(action, done) {
      if (action == "confirm") {
        setTimeout(done, 100);
        // 发起请求 - 保存文章
        let userToken = localStorage.getItem("token");
        let userId = localStorage.getItem("userId");
        if (userToken == null || userId == null) {
          this.$toast.fail("请登录");
          this.$router.push({ name: "login", query: { name: "edit" } });
          return;
        }
        this.$toast.loading({
          message: "修改中...",
          duration: 1000,
          forbidClick: true,
        });
        request({
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          url: "user/article/updateArticle",
          data: {
            // classId: this.classId,
            // userId: localStorage.getItem("userId"),
            // content: this.content,
            // title: this.title,
            // summary: this.summary,
            id: this.articleId,
            classId: this.article.classId,
            userId: localStorage.getItem("userId"),
            content: this.article.content,
            title: this.article.title,
            summary: this.article.summary,
            articleCoverId: this.curPicture.id
          },
        })
          .then((res) => {
            if (res.status == 200) {
              this.$toast.clear();
              this.$toast.success("发布成功");
              this.$router.push("home");
            }
            if (res.status == 500) {
              this.$toast.clear();
              this.$toast(res.msg);
            }
          })
      }
      if (action == "cancel") {
        setTimeout(done, 100);
        // 取消
      }
    },
    publish() {
      this.show = true;
    },
    goback() {
      this.$router.push("home");
    },
    getPictureList() {
      request({
          method: "post",
          url: "user/picture/getAllPictures",
          params: {
            userId: localStorage.getItem("userId"),
            page: this.curPage,
            pageSize: this.pageSize
          },
        })
          .then((res) => {
            if (res.status == 200) {
              this.pictureList = res.data.rows;
            } else {
              this.$toast(res.msg);
            }
          })
    },
  },
  created() {
    let query = this.$route.query;
    let articleId = query.articleId;
    this.articleId = articleId;
    this.getAllClassfication();
    this.getPictureList();
    this.getArticleDetail(articleId);
    
  },
};
</script>