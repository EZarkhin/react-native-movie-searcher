import React, { Component } from 'react'
import { View, Text, NetInfo, AsyncStorage } from 'react-native'
import { Spinner } from 'native-base';
import RNFetchBlob from 'react-native-fetch-blob'
import { cloneDeep } from 'lodash'
import axios from 'axios'

import Search from './components/Search'
import ListItems from './components/ListItems'

const API_KEY = 'a6f86160b49322cc31228fc68f0e34c7'
const STORAGE_KEY = '@49322cc31228f55';
const TOP_RATED_REQUEST = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US`
const SEARCH_REQUEST = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}`
const POSTER_URL = 'https://image.tmdb.org/t/p/w300'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      movieData: [],
      cachedData: [],
      loaded: false,
      isConnected: null
    }

    this.onFilmSearch = this.onFilmSearch.bind(this)
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
    this.onCacheData = this.onCacheData.bind(this)
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener(
        'change',
        this.handleConnectivityChange
    )
    NetInfo.isConnected
      .fetch()
        .then(isConnected => this.setState({ isConnected }))
        .then(() => this.fetchData())
        .done()
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
        'change',
        this.handleConnectivityChange
    )
  }

  onFilmSearch(search) {
    if (!search) return this.fetchData()

    if (this.state.isConnected) {
      axios.get(`${SEARCH_REQUEST}&query=${search}`)
        .then((responseData) => {
          this.setState({
            movieData: responseData.data.results
          })
        })
    }

    if (!this.state.isConnected) {
      const searchValue = this.state.cachedData.filter((item) =>
          item.title.toLowerCase().search(
          search.trim().toLowerCase()) !== -1
      )
      this.setState({
        cachedData: searchValue
      })
    }
  }

  onCacheData(data) {
      const cachedData = cloneDeep(data)
      let imagePath = null

      const actions = cachedData.map((element) => {
        return RNFetchBlob
          .config({
            fileCache: true
          })
          .fetch('GET', `${POSTER_URL}${element.poster_path}`)
          .then((resp) => {
            imagePath = resp.path()
            element.poster_path = imagePath;
          })
      })

      const that = this
       Promise.all(actions)
         .then(() => {
           that.onAsyncStorage(cachedData)
             .then(storedData => that.setState({ cachedData: JSON.parse(storedData) }))
             .catch(e => console.warn('Error', e))
         })
    }

  async onAsyncStorage(data) {
    try {
      let value = await AsyncStorage.getItem(STORAGE_KEY)

      if (value !== null) {
        await AsyncStorage.clear()
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))

        value = await AsyncStorage.getItem(STORAGE_KEY)

        return value
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      value = await AsyncStorage.getItem(STORAGE_KEY)

      return value
    } catch (e) {
      console.warn('Error', e)
    }
  }

  handleConnectivityChange(isConnected) {
    this.setState({ isConnected })
  }

  fetchData() {
    axios.get(TOP_RATED_REQUEST)
      .then((responseData) => {
        this.setState({
          movieData: responseData.data.results,
          loaded: true
        })
        this.onCacheData(responseData.data.results)
      })
      .catch(() => {
        const value = AsyncStorage.getItem(STORAGE_KEY)
        if (value !== null) {
          value
            .then(storedData => this.setState({
              cachedData: JSON.parse(storedData),
              loaded: true })
            )
            .done()
          return
        }
      })
  }

  renderLoadingView() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner color='#48688d' />
        <Text>Loading...</Text>
        {!this.state.isConnected && <Text>You have lost your internet connection...</Text>}
      </View>
    )
  }

  render() {
    if (!this.state.loaded) {
      return this.renderLoadingView()
    }

    return (
      <View style={{ flex: 1 }}>
        <Search onFilmSearch={this.onFilmSearch} />
        <ListItems
          movieData={this.state.isConnected ? this.state.movieData : this.state.cachedData}
          isConnected={this.state.isConnected}
        />
      </View>
    )
  }
}

export default App
