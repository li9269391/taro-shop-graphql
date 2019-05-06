import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'
import Loading from '../../components/loading'
import Popup from '../../components/popup'
import { findOne, findMany } from "../../utils/crud"
import { getWindowHeight } from '../../utils/style'
import Gallery from './gallery'
import InfoBase from './info-base'
import DetailImg from './detail-img'
import Footer from './footer'
import Spec from './spec'
import './index.scss'


class Detail extends Component {
  config = {
    navigationBarTitleText: '商品详情'
  }

  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      selected: {},
      detailInfo:{},
      detailSpec:[],
      buttonType: 'add'
    }
    this.id = String(this.$router.params.id)
  }

  componentDidMount() {
    console.log("this.id",this.id,typeof this.id)
    let detail = findOne({collection:"product",condition:{id: this.id},fields:["name", "id", "intro", "price", "img", "stock", "discountRate", "status"]})
    let detailSpec = findMany({collection:"specificationStock",condition:{product_id: this.id},fields:["id", "color", "size", "slideImg", "detailImg", "stock", "status"]})

    Promise.all([detail, detailSpec]).then((res)=>{
      console.log('promise data',res)
      this.setState({
        loaded:true,
        detailInfo: res[0],
        detailSpec: res[1]
      });
    })
    this.setState({ loaded: true })
  }

  handleSelect = (selected) => {
    this.setState({ selected })
  }

  changeDetailState = (state,val) => {
    this.setState({
      [state]:val
    })
  }

  toggleVisible = () => {
    this.setState({
      visible: !this.state.visible,
      selected: {}
    })
  }

  onChangeAddOrBuy = (val) => {
    this.setState({
      buttonType:val
    })
    this.toggleVisible()
  }

  render () {
    const { detailInfo, detailSpec, buttonType} = this.state
    let {img, price} = detailInfo
    console.log("detailInfo",detailInfo)
    console.log("detailSpec",detailSpec)
    let sliderImg = detailInfo.img
    let gallery = [detailInfo.img]
    gallery.push(sliderImg)

    console.log("gallery",gallery)
    const height = getWindowHeight(false)

    if (!this.state.loaded) {
      return <Loading />
    }

    return (
      <View className='item'>
        <ScrollView
          scrollY
          className='item__wrap'
          style={{ height }}
        >
          <Gallery list={gallery} />
          <InfoBase data={detailInfo} />
          <DetailImg imgList={gallery} />
        </ScrollView>

        {/* NOTE Popup 一般的实现是 fixed 定位，但 RN 不支持，只能用 absolute，要注意引入位置 */}
        <Popup
          visible={this.state.visible}
          onClose={this.toggleVisible}
        >
          <Spec
            detailInfo={detailInfo}
            detailSpec={detailSpec}
            price={price}
            img={img}
            selected={this.state.selected}
            onSelect={this.handleSelect}
            onClose={this.toggleVisible}
            buttonType={buttonType}
            onChangeDetailState={this.changeDetailState}
          />
        </Popup>
        <View className='item__footer'>
          <Footer onChangeAddOrBuy={this.onChangeAddOrBuy} />
        </View>
      </View>
    )
  }
}

export default Detail
