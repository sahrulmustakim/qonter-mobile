import axios from 'axios';
import queryString from 'query-string';
import { server_api } from '../configs/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * send request to server
 *
 * @param {String} method
 * @param {String} uri
 * @param {Object} data
 * @return {Promise}
 */
class apiServices {
  async sendRequest(method, uri, data = {}, authorization = true) {
    const instanceOfAxios = axios.create()
    let authToken = ''
    let signature = ''
    let trxToken = ''
    let headers = null

    if (authorization) {
      const token = await AsyncStorage.getItem('token')
      // console.log(token)
      if(token != null && typeof token !== 'undefined' && token != ''){
        authToken = token
      }
    }

    const userdata = JSON.parse(await AsyncStorage.getItem('userdata'))
    if(userdata != null && userdata.signature != null && typeof userdata.signature !== 'undefined' && userdata.signature != ''){
      signature = userdata.signature
    }

    const tokentrx = JSON.parse(await AsyncStorage.getItem('trxtoken'))
    if(tokentrx != null && tokentrx.token != null && typeof tokentrx.token !== 'undefined' && tokentrx.token != ''){
      trxToken = tokentrx.token
    }

    const commonHeaders = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Signature': signature,
      'X-Token': trxToken,
      Accept: 'application/json',
      Authorization: 'bearer '+authToken
    }
    // console.log(commonHeaders)

    let requestData = null
    if (data.json) {
      headers = {
        ...commonHeaders,
        'Content-Type': 'application/json'
      }
      requestData = data.json
    } else if (data.form) {
      headers = {
        ...commonHeaders,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      requestData = queryString.stringify(data.form)
    } else if (data.formData) {
      headers = {
        ...commonHeaders,
        'Content-Type': 'multipart/form-data'
      }
      requestData = data.formData
    } else {
      headers = {
        ...commonHeaders
      }
      requestData = data
    }

    return instanceOfAxios
      .request({
        baseURL: server_api.baseURL,
        url: uri,
        method,
        headers,
        params: data.params,
        paramsSerializer: params => queryString.stringify(params),
        data: requestData,
        timeout: 60 * 1000
      })
      .then(
        resp => {
          // console.log('raw resp => ', resp)
          return new Promise((resolve, reject) => {
            const response = resp.data
            // console.log('raw response => ', response)
            if (response.status || (response.code >= 200 && response.code < 300)) {
              // console.warn('resolve at status => ' + JSON.stringify(response))
              resolve(response.data)
              return false
            }
            // console.warn('accept => ' + JSON.stringify(response))
            reject(response)
            return false
          })
        },
        err => {
          // console.log('raw error => ', err)
          return new Promise((resolve, reject) => {
            if (typeof err.data !== 'undefined' && err.data !== null) {
              const response = err.data
              // console.warn('reject at error by data => ' + JSON.stringify(response.data))
              reject(response.data)
              return false
            }
            // console.log('reject => ' + JSON.stringify(err))
            reject(err)
            return false
          })
        }
      )
  }

  /**
   *
   * @param {String} URI:string
   * @param {Mixed} DATA:object
   * @param {Boolean} AUTHORIZATION:bool
   * @return {Promise}:promise
   */
  GET(URI, DATA, AUTHORIZATION) {
    return this.sendRequest('GET', URI, DATA, AUTHORIZATION)
  }

  /**
   *
   * @param {String} URI:string
   * @param {Mixed} DATA:object
   * @param {Boolean} AUTHORIZATION:bool
   * @return {Promise}:promise
   */
  POST(URI, DATA, AUTHORIZATION) {
    return this.sendRequest('POST', URI, DATA, AUTHORIZATION)
  }

  /**
   *
   * @param {String} URI:string
   * @param {Mixed} DATA:object
   * @param {Boolean} AUTHORIZATION:bool
   * @return {Promise}:promise
   */
  PUT(URI, DATA, AUTHORIZATION) {
    return this.sendRequest('PUT', URI, DATA, AUTHORIZATION)
  }

  /**
   *
   * @param {String} URI:string
   * @param {Mixed} DATA:object
   * @param {Boolean} AUTHORIZATION:bool
   * @return {Promise}:promise
   */
  DELETE(URI, DATA, AUTHORIZATION) {
    return this.sendRequest('DELETE', URI, DATA, AUTHORIZATION)
  }
}
const ApiServices = new apiServices();
export default ApiServices;
