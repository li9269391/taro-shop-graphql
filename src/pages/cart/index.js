import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'
import ButtonItem from '../../components/button'
import Loading from '../../components/loading'
import {findMany} from "../../utils/crud"
import {getWindowHeight} from '../../utils/style'
import Tip from './tip'
// import Gift from './gift'
import Empty from './empty'
import List from './list'
import Footer from './footer'
import './index.scss'

class Cart extends Component {
  config = {
    navigationBarTitleText: '购物车'
  }

  constructor(props){
    super(props)
    this.state={
      loaded: false,
      login: true,
      cartList:[],
      totalPrice:0,
      isSelectAll:false,
      selectedCount:0
    }
  }

  componentDidMount() {
    this.getCartData()
  }

  // 获取购物车数据
  getCartData = () => {
    let user_id = 'ioobot'
    const fields = [
      "count",
      "id",
      "product_id{id, img, intro, name, price, status, stock, unit, discountRate}",
      "specificationStock_id{id, color, size, stock, status}"
    ]
    findMany({collection:"userCart",condition:{user_id},fields}).then((res)=>{
      console.log("cartList",res)
      res.forEach((item)=>{
        item.checked = false
      })
      this.setState({
        loaded:true,
        cartList:res
      },()=>{
        this.sumPrice(false)
      })
    })
  }

  //计算选中总合计金额
  sumPrice = (update) => {
    let {cartList} = this.state
    if(update) Taro.setStorage({key: 'cartList', data: cartList})
    let totalPrice=0, selectedCount=0, checkedCount=0, cartCount=0
    let cartListLength = cartList.length
    let isSelectAll = false
    cartList.forEach((item,index)=>{
      cartCount+=item.count
      if(item.checked===true){
        totalPrice+=item.count*(item.product_id.price*item.product_id.discountRate/100).toFixed(2)
        selectedCount+=item.count
        checkedCount++
      }
      if(index === cartListLength - 1){
        Taro.setStorage({key: 'cartCount', data: cartCount})
        isSelectAll = cartListLength === checkedCount
        this.setState({
          totalPrice,
          selectedCount,
          isSelectAll
        })
      }
    })
  }

  // 更新数量
  changeCount = (i,count) =>{
    this.setState(prevState => ({
      cartList: prevState.cartList.map((item,index)=>{
        if(index===i){
          item.count = count
          return item
        }else {
          return item
        }
      })
    }),()=>{
      this.sumPrice(true)
    })
  }

  // 改变选择
  changeCheckedStatus = (i) => {
    this.setState(prevState => ({
      cartList: prevState.cartList.map((item,index)=>{
        if(index===i){
          item.checked=!item.checked
        }
        return item
      })
    }))

    let flag = this.state.cartList.every((item)=>{
      if(item.checked===false) {
        return false
      }else {
        return true
      }
    })

    if(flag===true){
      this.setState({isSelectAll:true},()=>{
        this.sumPrice(true)
      })
    }else {
      this.setState({isSelectAll:false},()=>{
        this.sumPrice(true)
      })
    }
  }

  //全选或全不选,判断全选状态
  checkedAll = () => {
    let {isSelectAll} = this.state
    if(!isSelectAll){
      this.setState(prevState => ({
        cartList: prevState.cartList.map((item)=>{
          item.checked=true
          return item
        }),
        isSelectAll:true
      }),()=>{
        this.sumPrice(true)
      })
    }else{
      this.setState(prevState => ({
        cartList: prevState.cartList.map((item)=>{
          item.checked=false
          return item
        }),
        isSelectAll:false
      }),()=>{
        this.sumPrice(true)
      })
    }
  }

  //结算传值
  settleAccounts = () => {
    let {cartList, totalPrice, selectedCount} = this.state
    let shopping=[]
    cartList.map((item)=>{
      if(item.checked===true){
        shopping.push(item)
      }
    })
    // console.log('cartList',this.state.cartList)
    // console.log('shopping',shopping)
    Taro.setStorage({key: 'cartSelected', data: shopping})
    Taro.setStorage({key: 'totalPrice', data: totalPrice})
    Taro.setStorage({key: 'totalCount', data: selectedCount})
    Taro.navigateTo({
      url: `/pages/orders/index?dataType=cartSelected`
    })
  }

  render () {
    let {cartList, totalPrice, selectedCount, isSelectAll} = this.state
    const isEmpty = !cartList.length
    const isShowFooter = !isEmpty

    if (!this.state.loaded) {
      return <Loading />
    }

    if (!this.state.login) {
      return (
        <View className='cart cart--not-login'>
          <Empty text='未登陆' />
          <View className='cart__login'>
            <ButtonItem
              type='primary'
              text='登录'
              onClick={this.toLogin}
              compStyle={{
                background: '#b59f7b',
                borderRadius: Taro.pxTransform(4)
              }}
            />
          </View>
        </View>
      )
    }

    return (
      <View className='cart'>
        <ScrollView
          scrollY
          className='cart__wrap'
          style={{ height: getWindowHeight() }}
        >
          <Tip />
          {isEmpty && <Empty />}

          {/*{!isEmpty && <Gift />}*/}

          {!isEmpty &&
            <List
              list={cartList}
              onChangeCount={this.changeCount}
              onChangeCheckedStatus={this.changeCheckedStatus}
            />
          }

          {isShowFooter &&
            <View className='cart__footer--placeholder' />
          }
        </ScrollView>

        {isShowFooter &&
          <View className='cart__footer'>
            <Footer
              isSelectAll={isSelectAll}
              totalPrice={totalPrice}
              selectedCount={selectedCount}
              onCheckedAll={this.checkedAll}
              onSettleAccounts={this.settleAccounts}
            />
          </View>
        }
      </View>
    )
  }
}

export default Cart
