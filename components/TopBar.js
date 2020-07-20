import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const styles = StyleSheet.create({
  wrapper: {
    height: 40,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  icon: {
    width: 26,
    height: 26,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  centerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
});

const TopBar = ({
  headerLeft,
  headerRight,
}) => {
  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.50)', 'rgba(0,0,0,0)']}
      style={styles.wrapper}
    >
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {headerLeft ? headerLeft() : undefined}
        </View>
        <View style={styles.centerContainer} />
        <View style={styles.rightContainer}>
          {headerRight ? headerRight() : undefined}
        </View>
      </View>
    </LinearGradient>
  );
};

export { TopBar };