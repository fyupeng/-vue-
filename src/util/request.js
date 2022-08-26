import axios from "axios";
import router from '../router'
import { Toast } from "vant";

let loadingCount = 0;
let loading;

function startLoading() {
  if (loadingCount === 0) {
    loading = Toast.loading({
      duration: 0, // 持续展示 toast
      forbidClick: true,
    });
  }
  loadingCount++;
}

function stopLoading() {
  loadingCount--;
  if (loadingCount === 0) {
    loading.clear();
  }
}

export function request(config) {
  let to=15000;
  if(config.timeout){
    to=config.timeout
  }
  const instance = axios.create({
    baseURL: "/blogApi/",
    // withCredentials: true,
    timeout: to,
  });
  // request interceptor
  instance.interceptors.request.use(
    (config) => {
        if (localStorage.getItem('token') != undefined) {
            // 更新 token 时间
            axios({
                method: "post",
                url: "/blogApi/user/updateToken",
                headers:{
                    token: localStorage.getItem('token')
                },
                params: {
                token: localStorage.getItem('token')
                },
            })
                .then((res) => {
                    if (res.data.status == 200) {
                        localStorage.setItem("token", res.data.data.userToken);
                        localStorage.setItem("userId", res.data.data.id);
                    }
                }).catch(error => {
                    console.log(error.response)
                    if(error.response == undefined) {
                        return Promise.reject(error);
                    }
                    let errorData = error.response.data;
                    console.log("err" + errorData)
                    if (errorData && errorData.message == 'Token expired or incorrect, please log in again') {
                        console.log("aaaaa")
                        localStorage.removeItem("token");
                        localStorage.removeItem("userId");
                    }
                })
            // 如果后台要token这么写：
            config.headers.token = localStorage.getItem('token')
            // 如果后台要Authorization 这么写：config.headers.Authorization = `Bearer ` + localStorage.getItem('token')
        }
      startLoading();
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // response interceptor
  instance.interceptors.response.use(
    (res) => {
        let data = res.data;
      stopLoading();
      if (res.status != "200") {
        console.log("后端返回异常：" + JSON.stringify(data.msg));
        Toast.fail({
          duration: 6000,
          closeOnClick:true,
          message: data.msg || "请求出现异常",
        });
        return Promise.reject(res)
      }
      return data;
    },
    (error) => {
        if(error.response == undefined) {
            return Promise.reject(error);
        }
        let errorData = error.response.data;
        console.log("err" + errorData)
        if (errorData && errorData.message == 'Token expired or incorrect, please log in again') {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
        }
      stopLoading();
      Toast.fail(errorData.message);
      return Promise.reject(errorData);
    }
  );
  return instance(config);
}