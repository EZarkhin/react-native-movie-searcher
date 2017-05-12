import React, { Component } from 'react'
import { Platform } from 'react-native'
import { Container, Header, Item, Input, Icon } from 'native-base'
import { debounce } from 'lodash'

class Search extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inputValue: ''
    }

    this.onInputChange = debounce(this.onInputChange, 500) //Add delay
    this.onInputChange = this.onInputChange.bind(this)
  }


  onInputChange(inputValue) {
    this.setState({ inputValue })
    this.props.onFilmSearch(inputValue)
  }

  render() {
    return (
            <Container style={{ paddingBottom: (Platform.OS === 'ios') ? 65 : 55 }}>
              <Header searchBar rounded>

                <Item>
                  <Icon name="ios-search" />
                  <Input
                    placeholder="Search"
                    onChangeText={this.onInputChange}
                  />
                  <Icon name="ios-film" />
                </Item>
              </Header>
            </Container>
    );
  }
}

export default Search
