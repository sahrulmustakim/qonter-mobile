import React, { Component } from 'react';
import { Router, Scene, Drawer } from 'react-native-router-flux';

// SPLASH
import SplashScreen from '../scenes/splash/index';

// LOGIN
import LoginScreen from '../scenes/login/index';
import LoginOtpScreen from '../scenes/login/otp';
import LoginOtpVerificationScreen from '../scenes/login/otp_verification';
import LoginPinScreen from '../scenes/login/pin';
import LoginPinConfirmationScreen from '../scenes/login/pin_confirmation';

// REGISTER
import Register from '../scenes/register/index';
import RegisterPhoto from '../scenes/register/photo';

// HOME
import SideBar from '../components/sidebar';
import Home from '../scenes/home/index';

// NOTIFICATION
import Notification from '../scenes/notification/index';
import NotificationDetail from '../scenes/notification/detail';

// // PROMO
// import PromoList from '../scenes/promo/list';

// // PRODUCT
// import ProductList from '../scenes/product/list';
// import ProductCode from '../scenes/product/code';

// // PROFILE
// import Profile from '../scenes/profile/index';

// // WALLET
// import Wallet from '../scenes/wallet/index';

// // PAYLATER
// import Paylater from '../scenes/paylater/index';
// import PaylaterRequest from '../scenes/paylater/request';

// // PAYMENT
// import Payment from '../scenes/payment/index';
// import PaymentDetail from '../scenes/payment/detail';

// // PRICELIST
// import PriceList from '../scenes/pricelist/index';

// // REWARD
// import Reward from '../scenes/reward/index';
// import RewardSaya from '../scenes/reward/listing';
// import RewardDetail from '../scenes/reward/detail';

// // PRINT STRUK
// import Print from '../scenes/print/index';
// import PrintDetail from '../scenes/print/detail';

// // HISTORY
// import History from '../scenes/history/index';
// import HistoryDetail from '../scenes/history/detail';
// import HistoryDetailPrint from '../scenes/history/print';

// // REFERAL
// import Referal from '../scenes/referal/index';

// // CUSTOMER SERVICE
// import CustomerService from '../scenes/customerservice/index';

// // ABOUT US
// import AboutUs from '../scenes/aboutus/index';

// // PRODUCT TRANSACTION
// import ProductRequest from '../scenes/product/request/index';
// import ProductCheckout from '../scenes/product/detail/checkout';
// import ProductPayment from '../scenes/product/detail/payment';
// import ProductPin from '../scenes/product/detail/pin';
// import ProductStatus from '../scenes/product/detail/status';

// // PRODUCT TRANSFER
// import ProductTransferRequest from '../scenes/product/transfer/request';
// import ProductTransferCheckout from '../scenes/product/transfer/checkout';
// import ProductTransferPayment from '../scenes/product/transfer/payment';
// import ProductTransferPin from '../scenes/product/transfer/pin';
// import ProductTransferStatus from '../scenes/product/transfer/status';

// // PRODUCT EXTERNAL
// import ProductExternal from '../scenes/product/external';

// // CHAT
// import Chat from '../scenes/chat/index';

// // SALES
// import SalesApproval from '../scenes/sales/approval';
// import SalesApprovalDetail from '../scenes/sales/approval_detail';
// import SalesKonter from '../scenes/sales/konter';
// import SalesKonterDetail from '../scenes/sales/konter_detail';
// import SalesRegister from '../scenes/sales/register';
// import SalesPhoto from '../scenes/sales/photo';
// import SalesMarkup from '../scenes/sales/markup';
// import SalesSetoran from '../scenes/sales/setoran';
// import SalesSetoranDetail from '../scenes/sales/setoran_detail';

// // KOLEKTOR
// import KolektorApproval from '../scenes/kolektor/approval';
// import KolektorApprovalDetail from '../scenes/kolektor/approval_detail';

// // KOMISI
// import KomisiWithdraw from '../scenes/komisi/withdraw';

// // UPDATE PROFILE
// import UpdateProfile from '../scenes/profile/update';
// import UpdateEmail from '../scenes/profile/email';
// import UpdatePin from '../scenes/profile/pin';

// // USER DETTING
// import UserDevice from '../scenes/user/device';
// import UserPin from '../scenes/user/pin';

export default class Routes extends Component {
	render() {
		return(
			<Router>
				<Scene key="root" hideNavBar>
					<Scene key="splash" component={SplashScreen} title="Splash" initial={true} />

					<Scene key="login" component={LoginScreen} title="Login" />
					<Scene key="login_otp" component={LoginOtpScreen} title="Login OTP" />
					<Scene key="login_otp_verification" component={LoginOtpVerificationScreen} title="Login OTP Verification" />
					<Scene key="login_pin" component={LoginPinScreen} title="Login Set Pin" />
					<Scene key="login_pin_confirmation" component={LoginPinConfirmationScreen} title="Login Pin Confirmation" />
					
					<Scene key="register" component={Register} title="Register" />
					<Scene key="register_photo" component={RegisterPhoto} title="Register Photo" />
					
					<Drawer open={false} type="overlay" key="menus" contentComponent={SideBar} drawerWidth={300}>
						<Scene key="rootScene" hideNavBar>
							<Scene key="home" component={Home} title="Home" />

							<Scene key="notification" component={Notification} title="Notification" />
							<Scene key="notification_detail" component={NotificationDetail} title="Notification Detail" />

							{/* <Scene key="promo_list" component={PromoList} title="List Promo" />
							<Scene key="product_list" component={ProductList} title="List Product" />
							<Scene key="productcode" component={ProductCode} title="Code Product" />
							<Scene key="profile" component={Profile} title="Profile" />

							<Scene key="wallet" component={Wallet} title="Wallet" />
							<Scene key="paylater" component={Paylater} title="Paylater" />
							<Scene key="paylater_request" component={PaylaterRequest} title="Paylater Request" />

							<Scene key="payment" component={Payment} title="Payment" />
							<Scene key="payment_detail" component={PaymentDetail} title="Payment Detail" />

							<Scene key="pricelist" component={PriceList} title="Price List" />

							<Scene key="reward" component={Reward} title="Reward" />
							<Scene key="reward_saya" component={RewardSaya} title="Reward Saya" />
							<Scene key="reward_detail" component={RewardDetail} title="Reward Detail" />
							
							<Scene key="print" component={Print} title="Print" />
							<Scene key="print_detail" component={PrintDetail} title="Print Detail" />
							
							<Scene key="history" component={History} title="History Transaction" />
							<Scene key="history_detail" component={HistoryDetail} title="History Detail" />
							<Scene key="history_print" component={HistoryDetailPrint} title="Cetak Transaksi" />
							
							<Scene key="referal" component={Referal} title="Referal" />
							
							<Scene key="customerservice" component={CustomerService} title="Customer Service" />
							<Scene key="chat" component={Chat} title="Chat" />
							<Scene key="aboutus" component={AboutUs} title="About Us" />
							
							<Scene key="product_request" component={ProductRequest} title="Product Request" />
							<Scene key="product_checkout" component={ProductCheckout} title="Product Checkout" />
							<Scene key="product_payment" component={ProductPayment} title="Product Payment" />
							<Scene key="product_pin" component={ProductPin} title="Product Pin" />
							<Scene key="product_status" component={ProductStatus} title="Product Status" />

							<Scene key="product_transfer_request" component={ProductTransferRequest} title="Product Transfer Request" />
							<Scene key="product_transfer_checkout" component={ProductTransferCheckout} title="Product Transfer Checkout" />
							<Scene key="product_transfer_payment" component={ProductTransferPayment} title="Product Transfer Payment" />
							<Scene key="product_transfer_pin" component={ProductTransferPin} title="Product Transfer Pin" />
							<Scene key="product_transfer_status" component={ProductTransferStatus} title="Product Transfer Status" />
							
							<Scene key="product_external" component={ProductExternal} title="Product External" />

							<Scene key="update_profile" component={UpdateProfile} title="Update Profile" />
							<Scene key="update_email" component={UpdateEmail} title="Update Email / Phone" />
							<Scene key="update_pin" component={UpdatePin} title="Update Pin Konfirmasi" />

							<Scene key="sales_approval" component={SalesApproval} title="Sales Approval" />
							<Scene key="sales_approval_detail" component={SalesApprovalDetail} title="Sales Approval Detail" />
							<Scene key="sales_konter" component={SalesKonter} title="Sales Konter" />
							<Scene key="sales_konter_detail" component={SalesKonterDetail} title="Sales Konter Detail" />
							<Scene key="sales_register" component={SalesRegister} title="Sales Register Konter" />
							<Scene key="sales_photo" component={SalesPhoto} title="Sales Register Photo Konter" />
							<Scene key="sales_markup" component={SalesMarkup} title="Sales Markup" />
							<Scene key="sales_setoran" component={SalesSetoran} title="Sales Setoran" />
							<Scene key="sales_setoran_detail" component={SalesSetoranDetail} title="Sales Setoran Detail" />

							<Scene key="kolektor_approval" component={KolektorApproval} title="Kolektor Approval" />
							<Scene key="kolektor_approval_detail" component={KolektorApprovalDetail} title="Kolektor Approval Detail" />
							
							<Scene key="komisi_withdraw" component={KomisiWithdraw} title="Komisi Withdraw" />
							
							<Scene key="device" component={UserDevice} title="Device Saya" />
							<Scene key="reset_pin" component={UserPin} title="Reset Pin" /> */}
						</Scene>
					</Drawer>
					
				</Scene>
			</Router>
		)
	}
}