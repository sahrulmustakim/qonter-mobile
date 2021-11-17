import AsyncStorage from '@react-native-async-storage/async-storage';

class Global {
  async checkLogin() {
    const user = await AsyncStorage.getItem('userdata')
    const userdata = JSON.parse(user)
    if(userdata != null){
      return userdata
    }else{
      return null
    }
  }

  async getAccountID() {
    const user = await AsyncStorage.getItem('userdata')
    const userdata = JSON.parse(user)
    if(userdata != null){
      return userdata.driver[0].id
    }else{
      return null
    }
  }

  async getAccountStatus() {
    const user = await AsyncStorage.getItem('userdata')
    const userdata = JSON.parse(user)
    if(userdata != null){
      return userdata.driver[0].status_verifikasi
    }else{
      return null
    }
  }

  async getProfile() {
    const user = await AsyncStorage.getItem('userdata')
    const userdata = JSON.parse(user) 
    return userdata
  }

  async getVerified() {
    const user = await AsyncStorage.getItem('userdata_verify')
    const userdata = JSON.parse(user) 
    return userdata
  }

  addZero(i) {
    if (i < 10) {
      i = '0' + i
    }
    return i
  }

  getDateTime(type) {
    var date = addZero(new Date().getDate())
    var month = addZero(new Date().getMonth() + 1)
    var year = addZero(new Date().getFullYear())
    var hours = addZero(new Date().getHours())
    var min = addZero(new Date().getMinutes())
    var sec = addZero(new Date().getSeconds())
    if(type == 'full'){
      return year+'-'+month+'-'+date+' '+hours+':'+min+':'+sec
    }else if(type == 'date'){
      return year+'-'+month+'-'+date
    }else if(type == 'time'){
      return hours+':'+min+':'+sec
    }else{
      return null
    }
  }

  validateInput(data, type, title) {
    let result = null
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
    if (type == 'required') {
      if(data === null || data == '' || typeof data === 'undefined'){
        result = { status: false, message: title+' tidak boleh kosong' }
      }else{
        result = { status: true }
      }
    }else if(type == 'email') {
      if(reg.test(data) === false) {
        result = { status: false, message: title+' yang anda masukkan salah' }
      }else{
        result = { status: true }
      }
    }
    return result
  }

  formatPrice(value){
    return (parseInt(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  getTotalTransaction(request_data, promo_data, postpaid_data, promo = 'include', format = 'price'){
    let grandtotal = 0

    if(request_data != null && request_data.transaction_type.type == 'prepaid'){
      grandtotal = (parseInt(parseInt(request_data.product_value.price) + parseInt(request_data.product_value.price_markup) + parseInt(request_data.product_value.sales_markup)))
    }

    if(request_data != null && request_data.transaction_type.type == 'postpaid' && typeof request_data.product !== 'undefined' && request_data.product.operator == 'prepaid'){
      grandtotal = (parseInt(parseInt(request_data.product_value.price) + parseInt(request_data.product_value.price_markup) + parseInt(request_data.product_value.sales_markup)))
    }
    
    if(request_data != null && request_data.transaction_type.type == 'postpaid' && postpaid_data != null && typeof postpaid_data.selling_price !== 'undefined'){
      grandtotal = parseInt(postpaid_data.selling_price)

      if(typeof postpaid_data.price_markup !== 'undefined' && postpaid_data.price_markup != null){
        grandtotal = parseInt(grandtotal) + parseInt(postpaid_data.price_markup)
      }
      if(typeof postpaid_data.sales_markup !== 'undefined' && postpaid_data.sales_markup != null){
        grandtotal = parseInt(grandtotal) + parseInt(postpaid_data.sales_markup)
      }
    }

    if(promo == 'include' && promo_data != null && promo_data.grand_total > 0){
      grandtotal = parseInt(grandtotal) - parseInt(promo_data.grand_total)
    }

    if(format == 'price'){
      grandtotal = (parseInt(grandtotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }

    return grandtotal
  }

  getProvitTransaction(postpaid_data){
    let grandtotal = 0

    if(postpaid_data != null){
      grandtotal = parseInt(parseInt(postpaid_data.selling_price) - parseInt(postpaid_data.price))
    }

    if(typeof postpaid_data.price_markup !== 'undefined' && postpaid_data.price_markup != null){
      grandtotal = parseInt(grandtotal) + parseInt(postpaid_data.price_markup)
    }

    return grandtotal
  }

  getTotalTransfer(item_data, promo_data, promo = 'include'){
    let grandtotal = 0

    if(item_data != null && typeof item_data.amount !== 'undefined'){
      grandtotal = parseInt(item_data.amount)
    }

    if(promo == 'include' && promo_data != null && typeof promo_data.grand_total !== 'undefined' && promo_data.grand_total > 0){
      grandtotal = parseInt(grandtotal) - parseInt(promo_data.grand_total)
    }

    return grandtotal
  }
}
const global = new Global();
export default global;
