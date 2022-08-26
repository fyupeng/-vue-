
<template>

  <div class="edit">
    <van-nav-bar
      title="发布文章"
      left-text="返回"
      left-arrow
      @click-left="goback"
    />

    <div class="edit-head">
      <div class="title-intro">文章标题：</div>
      <div class="title">
        <input v-model="title" class="" />
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
            <textarea v-model="summary"></textarea>
          </div>
        </div>

        <div class="type">
          <div class="type-intro">文章分类:</div>
          <div class="type-content">
            <van-field
              readonly
              clickable
              label="分类"
              :value="chooseClassName"
              placeholder="选择分类"
              @click="showPicker = true"
              style="margin-left: 10px; width: 90%"
            />
            <van-popup v-model="showPicker" round position="bottom">
              <van-picker
                title="文章分类"
                show-toolbar
                :columns="classNameList"
                @cancel="showPicker = false"
                @confirm="changeConfirm"
              />
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
        v-model="content"
        :toolbars="toolbars"
      />
    </div>

 

  </div>
</template>
 

<script>
import "../assets/less/edit.less";
import { request } from "../util/request";

export default {
  data() {
    return {
      classId: "",
      summary: "",
      classFicationList: [],
      chooseClassName: "", //input框内显示的值
      classNameList: [],
      showPicker: false,

      show: false,
      title: "",
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
    };
  },

  methods: {
    getAllClassfication() {
      request({
        method: "post",
        url: "/user/article/getAllClassfications",
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
          this.classId = o.id;
        }
      });
    },
    beforeClose(action, done) {
      if (action == "confirm") {
        setTimeout(done, 100);
        // 发起请求 - 保存文章
        let userToken = localStorage.getItem("token");
        if (userToken == undefined) {
          this.$toast.fail("请登录");
          this.$router.push({name:"login",query:{name:'edit'}});
          return;
        }
        request({
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          url: "user/article/saveArticle",
          data: {
            classId: this.classId,
            userId: localStorage.getItem("userId"),
            content: this.content,
            title: this.title,
            summary: this.summary,
          },
        }).then((res) => {
          console.log(res)
            if (res.status == 200) {
              this.$toast.clear();
              this.$dialog.alert({
                  message: '发布成功',
              }).then(() => {
                  this.$router.push('/home');
              });
            }
        })
      }
      if (action == "cancel") {
        console.log("取消");
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

    // 上传图片方法
    $imgAdd(pos, $file) {
      console.log(pos, $file);
    },
  },
  created() {
    this.getAllClassfication();
  },
};
</script>