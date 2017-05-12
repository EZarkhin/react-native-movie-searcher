import React, { Component } from 'react'
import { View, Text, ListView, StyleSheet, Dimensions, Image } from 'react-native'
import { Card, CardItem, Icon } from 'native-base'

const { width } = Dimensions.get('window');
const POSTER_URL = 'https://image.tmdb.org/t/p/w300'

class ListItems extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2
      })
    }
    this.renderMovie = this.renderMovie.bind(this)
  }

  componentDidMount() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.props.movieData)
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(nextProps.movieData)
    })
  }

  renderMovie(movie) {
  const cardItemStyle = { justifyContent: 'center', flexWrap: 'wrap' }
  const iconStyle = { marginRight: -12, fontSize: 20, color: '#507299' }
  const imgUrl = this.props.isConnected ? `${POSTER_URL}${movie.poster_path}` : `file://${movie.poster_path}`

    return (
      <View style={styles.item}>
          <Card>
            <CardItem style={cardItemStyle}>
              <Text style={styles.movieTitle}>{movie.title}</Text>
            </CardItem>

            <CardItem cardBody style={cardItemStyle}>
              <View style={styles.movieBorder}>
              <Image
                source={{ uri: imgUrl }}
                style={styles.movieImg}
              />
              </View>
            </CardItem>

            <CardItem style={cardItemStyle}>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Icon active name="thumbs-up" style={iconStyle} />
                <Text style={styles.vote}>{movie.vote_average}/10</Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Icon active name="ios-calendar-outline" style={iconStyle} />
                <Text>{movie.release_date.substring(0, movie.release_date.length - 3)}</Text>
              </View>

            </CardItem>

          </Card>
      </View>
    )
  }

  render() {
    if (!this.props.movieData.length) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 20 }}>Nothing to show...</Text>
          {
            this.props.isConnected
            &&
            <Text style={{ fontSize: 18, paddingVertical: 10 }}>
              Please reload the app...
            </Text>
          }
        </View>
      )
    }

    return (
      <View style={styles.listItems}>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderMovie}
          contentContainerStyle={styles.list}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
    justifyContent: 'space-around'
  },
  item: {
    backgroundColor: 'transparent',
    margin: 3,
    width: (width - 15) / 2
  },
  movieTitle: {
    minHeight: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
    flex: 1
  },
  movieBorder: {
    borderWidth: 1,
    borderColor: '#edeef0',
    backgroundColor: '#edeef0',
    borderRadius: 0
  },
  movieImg: {
    width: width / 2.5,
    height: 200,
    margin: 3
  },
  vote: {
    marginRight: 8
  },
  listItems: {
    paddingBottom: 60
  }
})

export default ListItems
