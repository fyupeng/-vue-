<template>
  <div class="comment">
    <div class="nav">
      <van-nav-bar
        title="分类管理"
        left-text="返回"
        left-arrow
        @click-left="goback"
      />
    </div>

    <div class="bg">
      <img class="bgImg" src="../assets/icon/myInfo.jpg" alt="" />
    </div>

    <div class="detail">
      <div class="match-box">
        <div class="comment-num">全部 ( {{ commentList.length }} )</div>
        <div class="other">
          <button class="comment-match" @click="matchComment">开始匹配</button>
        </div>
      </div>

      <div class="pattern-box">
        <div class="intro">模糊匹配:</div>
        <div class="other-condition">
          <div class="condition-box">
            <div class="pro-name">文章匹配:</div>
            <input
              class="pattern"
              v-model="aPattern"
              placeholder="标题、摘要"
            />
          </div>
          <div class="condition-box">
            <div class="pro-name">评论匹配:</div>
            <input class="pattern" v-model="cPattern" placeholder="评论内容" />
          </div>
        </div>
      </div>

      <div class="pattern-box">
        <div class="intro">精准匹配:</div>
        <div class="other-condition">
          <div class="condition-user-box">
            <div class="pro-name">用户id:</div>
            <input class="pattern" v-model="userId" placeholder="用户id" />
          </div>
        </div>
      </div>

      <div class="pattern-box">
        <div class="intro">时间匹配:</div>
        <div class="other-condition">
          <div class="condition-box">
            <div class="pro-name">开始时间:</div>
            <input
              class="pattern-time"
              v-model="startTime"
              placeholder="yyyy-MM-dd HH:mm:ss"
            />
            <button @click="showPicker1 = true" class="select-time">
              选择
            </button>
          </div>
          <div class="condition-box">
            <div class="pro-name">结束时间:</div>
            <input
              class="pattern-time"
              v-model="endTime"
              placeholder="yyyy-MM-dd HH:mm:ss"
            />
            <button @click="showPicker2 = true" class="select-time">
              选择
            </button>
          </div>
        </div>
      </div>
      <van-popup v-model="showPicker1" round position="bottom">
        <van-datetime-picker
          v-model="currentStartDate"
          type="datehour"
          title="选择年月日小时"
          :min-date="minDate"
          :max-date="maxDate"
          @cancel="showPicker1 = false"
          @confirm="confirmStartTime"
        />
      </van-popup>

      <van-popup v-model="showPicker2" round position="bottom">
        <van-datetime-picker
          v-model="currentEndDate"
          type="datehour"
          title="选择年月日小时"
          :min-date="minDate"
          :max-date="maxDate"
          @cancel="showPicker2 = false"
          @confirm="confirmEndTime"
        />
      </van-popup>

      <div class="dividing"></div>

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
          <div v-show="item.toUserNickName != null" class="to-name">
            回复：{{ item.toUserNickName }}
          </div>
        </div>
        <!-- <van-divider /> -->
        <div class="message">{{ item.comment }}</div>
        <div class="dvide"></div>
        <div class="other">
          <div class="reply">
            <van-popover
              v-model="showPopoverList[index]"
              theme="dark"
              trigger="click"
              :actions="item.status == 0 ? blockActions : unblockActions"
              @select="onSelect"
              placement="right"
            >
              <template #reference>
                <img
                  @click="chooseComment(index)"
                  class="reply-icon"
                  src="../assets/icon/reply.png"
                />
              </template>
            </van-popover>
            <img
              v-show="item.status == 0"
              class="block-icon"
              src="../assets/icon/unblock-1.png"
            />
            <img
              v-show="item.status == 1"
              class="block-icon"
              src="../assets/icon/block.png"
            />
          </div>
          <div class="time">{{ item.createTimeAgo }}</div>
        </div>
        <div
          v-show="item.fatherCommentId != null"
          class="father-comment-content"
        >
          引用 “ {{ item.fatherCommentContent }} ”
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import "../assets/less/comment.less";
import { request } from "../util/js/request";
export default {
  data() {
    return {
      commentList: "",
      aPattern: "",
      cPattern: "",
      userId: "",
      startTime: "",
      endTime: "",
      minDate: new Date(2019, 0, 1),
      maxDate: new Date(2025, 0, 1),
      currentStartDate: new Date(),
      currentEndDate: new Date(),
      showStartTimeWindow: false,
      showEndTimeWindow: false,
      showPicker1: false,
      showPicker2: false,
      showPopoverList: [],
      blockActions: [{ text: "屏蔽" }],
      unblockActions: [{ text: "恢复" }],
      chooseIndex: "",
    };
  },
  methods: {
    chooseComment(index) {
      this.chooseIndex = index;
    },
    onSelect(action) {
      var val = action.text;
      if (val == "屏蔽") {
          this.$toast.loading({
          message: "正在操作中....",
          duration: 1000,
          forbidClick: true,
        });
        request({
          method: "post",
          url: "admin/comment/setCommentStatus",
          params: {
            commentId: this.commentList[this.chooseIndex].id,
            status: 2,
            userId: localStorage.getItem("userId"),
          },
        })
          .then((res) => {
            if (res.status == 200) {
              this.$toast.clear();
              this.$toast.success("操作成功");
              this.matchComment();
            } else {
                this.$toast(res.msg);
            }
          })
      }
      if (val == "恢复") {
        this.$toast.loading({
          message: "正在操作中....",
          duration: 1000,
          forbidClick: true,
        });
        request({
          method: "post",
          url: "admin/comment/setCommentStatus",
          params: {
            commentId: this.commentList[this.chooseIndex].id,
            status: 1,
            userId: localStorage.getItem("userId"),
          },
        })
          .then((res) => {
            if (res.status == 200) {
              this.$toast.clear();
              this.$toast.success("操作成功")
              this.matchComment();
            } else {
                this.$toast(res.msg);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    dateFormat(time) {
      var date = new Date(time);
      var year = date.getFullYear();
      /* 在日期格式中，月份是从0开始的，因此要加0
       * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
       * */
      var month =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1;
      var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var hours =
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      var minutes =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      var seconds =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      // 拼接
      return (
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
      );
    },
    confirmStartTime(value) {
      this.showPicker1 = false;
      this.startTime = this.dateFormat(value);
    },
    confirmEndTime(value) {
      this.showPicker2 = false;
      this.endTime = this.dateFormat(value);
    },
    selectStartTime(action, done) {},
    selectEndtTime() {},
    goback() {
      this.$router.push("my");
    },
    matchComment() {
      this.$toast.loading({
        message: "正在匹配中....",
        duration: 1000,
        forbidClick: true,
      });
      request({
        method: "post",
        url: "admin/comment/filterComments",
        params: {
          aPattern: this.aPattern,
          cPattern: this.cPattern,
          userId: this.userId,
          startTime: this.startTime,
          endTime: this.endTime,
        },
      })
        .then((res) => {
          if (res.status == 200) {
            this.$toast.clear();
            this.$toast.success("匹配成功");
            this.commentList = res.data;
            for (var i = 0; i < this.commentList; i++) {
              this.showPopoverList[i] = false;
            }
            this.rules = [];
            this.$toast.clear();
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
            this.$toast(res.data.msg);
          }
        })
    },
  },
  created() {}
};
</script>

<style lang="scss" scoped>
</style>