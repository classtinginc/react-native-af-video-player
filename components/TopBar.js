import React from 'react'
import PropTypes from 'prop-types'

import {
  View,
  StyleSheet,
  Text,
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient'

const backgroundColor = 'transparent'

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center'
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center'
  },
  title: {
    flex: 1,
    backgroundColor,
    paddingLeft: 10,
    paddingRight: 35,
    fontSize: 16
  },
})

const TopBar = (props) => {
  const {
    title,
  } = props
  return (
    <LinearGradient colors={['rgba(0,0,0,0.50)', 'rgba(0,0,0,0)']} style={styles.container}>
      <View style={styles.row}>
        <Text
          style={[styles.title]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>
    </LinearGradient>
  )
}

TopBar.propTypes = {
  title: PropTypes.string.isRequired,
}

export { TopBar }
