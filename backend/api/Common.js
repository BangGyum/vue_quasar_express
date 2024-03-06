import { api } from "boot/axios";

class CommonApi {
  async get(url, params) {
    let result;
    await api
      .get(url, params)
      .then((response) => {
        result = response.data;
      })

      .catch((e) => {
        console.log(e);
        result = [];
      });

    console.log("result", result);
    return result;
  }

  async post(url, params) {
    let result;
    await api
      .post(url, params, this.getJsonHeader())
      .then((response) => {
        result = response.data;
      })

      .catch((e) => {
        console.log(e);
        result = [];
      });

    console.log("result", result);
    return result;
  }

  getJsonHeader() {
    return {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };
  }
}

export default CommonApi;
