import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  Alert,
} from 'react-native';
import VideoPlayer from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import Icons from 'react-native-vector-icons/MaterialIcons';
import { Controls } from './Controls';
import { TopBar } from './TopBar';
import { checkSource, divide, multiply } from './utils';

const Win = Dimensions.get('window');
const backgroundColor = '#000';

const styles = StyleSheet.create({
  background: {
    backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 98,
    flex: 1,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    zIndex: 99,
  },
});

const defaultTheme = {
  title: '#FFF',
  more: '#FFF',
  center: '#FFF',
  fullscreen: '#FFF',
  volume: '#FFF',
  scrubberThumb: '#FFF',
  scrubberBar: '#FFF',
  seconds: '#FFF',
  duration: '#FFF',
  progress: '#FFF',
  loading: '#FFF',
};

class Video extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: !props.autoPlay,
      muted: props.mute,
      inlineHeight: props.resizedVideoHeight || Win.width * 0.5625,
      loading: false,
      duration: 0,
      progress: 0,
      currentTime: 0,
      seeking: false,
      renderError: false,
    };
    this.animInline = new Animated.Value(props.resizedVideoHeight || Win.width * 0.5625);
    this.animFullscreen = new Animated.Value(Win.height);
    this.onRotated = this.onRotated.bind(this);
    this.setVideoRef = (element) => {
      this.video = element;
    };
    this.video = null;
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this.onRotated);
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.onRotated);
  }

  onLoadStart() {
    this.setState({ paused: true, loading: true });
  }

  setInlineHeight(data) {
    const { lockRatio, resizedVideoHeight } = this.props;
    if(resizedVideoHeight) {
      return resizedVideoHeight;
    }
    if(lockRatio) {
      return (Win.width / this.props.lockRatio);
    }
    const { height, width } = data.naturalSize;
    const ratio = height === 'undefined' && width === 'undefined' ?
    (9 / 16) : (height / width);
    return Win.width * ratio;
  }

  onLoad(data) {
    if (!this.state.loading) return;
    const inlineHeight = this.setInlineHeight(data);
    this.setState({
      loading: false,
      inlineHeight,
      duration: data.duration,
    }, () => {
      this.props.onLoad(data);
      if(this.props.fullScreen) {
        Animated.timing(this.animFullscreen, { toValue: Win.height, duration: 200, useNativeDriver: false }).start();
      } else {
        Animated.timing(this.animInline, { toValue: inlineHeight, duration: 200, useNativeDriver: false }).start();
      }
    });
  }

  // onBuffer() {
  //   // console.log('buffering')
  //   this.setState({ loading: true, paused: true })
  // }

  onSeek(e) {
    // console.log('onSeek', e);
  }

  onEnd() {
    this.props.onEnd();
    const { loop } = this.props;
    if (!loop) this.pause();
    this.onSeekRelease(0);
    this.setState({ currentTime: 0 }, () => {
      if (!loop) this.controls.showControls();
    });
  }

  onRotated({ window: { width, height } }) {
    // Add this condition incase if inline and fullscreen options are turned on
    if (this.props.inlineOnly) return;
    const orientation = width > height ? 'LANDSCAPE' : 'PORTRAIT';
      if (orientation === 'LANDSCAPE') {
        this.animToFullscreen(height);
        this.props.onFullScreen(this.props.fullScreen);
        return;
      };
      if (orientation === 'PORTRAIT') {
        this.animToInline();
        this.props.onFullScreen(this.props.fullScreen);
        return;
      };
  }

  onSeekRelease(percent) {
    // console.log('onSeekRelease', percent);
    const seconds = multiply(percent, this.state.duration);
    // console.log('onSeekRelease:seconds', seconds);
    this.video.seek(seconds);
    setTimeout(()=> {
      this.setState({ seeking: false });
    }, 500);
  }

  onError(msg) {
    this.props.onError(msg);
    const { error } = this.props;
    this.setState({ renderError: true }, () => {
      let type;
      switch (true) {
        case error === false:
          type = error;
          break;
        case typeof error === 'object':
          type = Alert.alert(error.title, error.message, error.button, error.options);
          break;
        default:
          type = Alert.alert('Oops!', 'There was an error playing this video, please try again later.', [{ text: 'Close' }]);
          break;
      }
      return type;
    });
  }

  BackHandler() {
    if (this.props.fullScreen) {
        this.animToInline();
        this.props.onFullScreen(this.props.fullScreen);
        if (this.props.fullScreenOnly && !this.state.paused) this.togglePlay();
        if (this.props.rotateToFullScreen) Orientation.lockToPortrait();
        setTimeout(() => {
          if (!this.props.lockPortraitOnFsExit) Orientation.unlockAllOrientations();
        }, 1500);
      return true;
    }
    return false;
  }

  pause() {
    if (!this.state.paused) this.togglePlay(false);
  }

  play() {
    if (this.state.paused) this.togglePlay(false);
  }

  togglePlay(shouldCallOnPlayProps = true) {
    this.setState((prevState) => ({ paused: !prevState.paused }), () => {
      if(shouldCallOnPlayProps) {
        this.props.onPlay(this.state.paused);
      }
    });
  }

  toggleFS() {
    this.props.onFullScreen(true);
  }

  animToFullscreen(height) {
    Animated.parallel([
      Animated.timing(this.animFullscreen, { toValue: height, duration: 200, useNativeDriver: false }),
      Animated.timing(this.animInline, { toValue: height, duration: 200, useNativeDriver: false }),
    ]).start();
  }

  animToInline(height) {
    const newHeight = height || this.state.inlineHeight;
    Animated.parallel([
      Animated.timing(this.animFullscreen, { toValue: newHeight, duration: 100, useNativeDriver: false }),
      Animated.timing(this.animInline, { toValue: this.state.inlineHeight, duration: 100, useNativeDriver: false }),
    ]).start();
  }

  toggleMute(mute) {
    if(mute) {
      this.setState({ muted: true })
      this.props.onToggleMute(mute);
    } else {
      this.setState({ muted: !this.state.muted });
      this.props.onToggleMute(!this.state.muted);
    }
  }

  setMute(mute) {
    this.setState({ muted: mute })
  }

  seek(percent) {
    // console.log('seekPercent', percent);
    const currentTime = multiply(percent, this.state.duration);
    // console.log('seekCurrentTime', currentTime);
    this.setState({ seeking: true, currentTime, progress: percent });
  }

  seekTo(seconds) {
    const percent = divide(seconds , this.state.duration);
    if (seconds > this.state.duration) {
    //  console.info(`Current time (${seconds}) exceeded the duration ${this.state.duration}`);
    } else {
      this.setState({ currentTime: seconds });
      return this.onSeekRelease(percent);
    }
  }

  progress(time) {
    const { currentTime } = time;
    const progress = divide(currentTime, this.state.duration);
    // console.log('progress', time, progress, this.state.seeking);
    if (!this.state.seeking) {
      this.setState({ progress, currentTime }, () => {
        this.props.onProgress(time);
      });
    }
  }

  renderError() {
    const { fullScreen } = this.props;
    const inline = {
      height: this.animInline,
      alignSelf: 'stretch',
    };
    const textStyle = { color: 'white', padding: 10 };
    return (
      <Animated.View
        style={[styles.background, fullScreen ? styles.fullScreen : inline]}
      >
        <Text style={textStyle}>Retry</Text>
        <Icons
          name="replay"
          size={60}
          color={this.props.theme}
          onPress={() => this.setState({ renderError: false })}
        />
      </Animated.View>
    );
  }

  renderPlayer() {
    const {
      paused,
      muted,
      loading,
      progress,
      seeking,
      duration,
      inlineHeight,
      currentTime,
    } = this.state;
    const {
      url,
      loop,
      title,
      rate,
      style,
      volume,
      placeholder,
      theme,
      onTimedMetadata,
      resizeMode,
      inlineOnly,
      playInBackground,
      playWhenInactive,
      hideFullScreenControl,
      controlDuration,
      disableControls,
      fullScreen,
      onFullScreen,
      isAdvertisement,
      topBar,
      topBarProps,
    } = this.props;

    const inline = {
      height: inlineHeight,
      alignSelf: 'stretch',
    };

    const setTheme = {
      ...defaultTheme,
      ...theme,
    };

    return (
      <Animated.View
        style={[
          styles.background,
          fullScreen ?
            (styles.fullScreen, { height: this.animFullscreen })
            : { height: this.animInline },
          fullScreen ? null : style,
        ]}
      >
        {
          ((loading && placeholder) || currentTime < 0.01) ?
            <Image resizeMode="cover" style={styles.image} {...checkSource(placeholder)} /> : null
        }
        <VideoPlayer
          {...checkSource(url)}
          paused={paused}
          resizeMode={resizeMode}
          repeat={loop}
          style={fullScreen ? styles.fullScreen : inline}
          ref={this.setVideoRef}
          rate={rate}
          volume={volume}
          muted={muted}
          playInBackground={playInBackground} // Audio continues to play when app entering background.
          playWhenInactive={playWhenInactive} // [iOS] Video continues to play when control or notification center are shown.
          progressUpdateInterval={400} // [iOS] Interval to fire onProgress (default to ~250ms)
          onLoadStart={() => this.onLoadStart()} // Callback when video starts to load
          onLoad={e => this.onLoad(e)} // Callback when video loads
          onProgress={e => this.progress(e)} // Callback every ~250ms with currentTime
          onEnd={() => this.onEnd()}
          onSeek={e => this.onSeek(e)}
          // onError={e => this.onError(e)}
          // onBuffer={() => this.onBuffer()} // Callback when remote video is buffering
          onTimedMetadata={e => onTimedMetadata(e)} // Callback when the stream receive some metadata
        />
        <Controls
          ref={(ref) => { this.controls = ref; }}
          onFullScreen={onFullScreen}
          isAdvertisement={isAdvertisement}
          disableControls={disableControls}
          toggleMute={() => this.toggleMute()}
          toggleFS={() => this.toggleFS()}
          togglePlay={() => this.togglePlay()}
          topBar={topBar}
          topBarProps={topBarProps}
          paused={paused}
          seeking={seeking}
          muted={muted}
          fullscreen={fullScreen}
          loading={loading}
          onSeek={val => this.seek(val)}
          onSeekRelease={pos => this.onSeekRelease(pos)}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          title={title}
          theme={setTheme}
          inlineOnly={inlineOnly}
          hideFullScreenControl={hideFullScreenControl}
          controlDuration={controlDuration}
        />
      </Animated.View>
    );
  }

  render() {
    if (this.state.renderError) return this.renderError();
    return this.renderPlayer();
  }
}

Video.propTypes = {
  url: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  placeholder: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
  error: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  video: PropTypes.object,
  loop: PropTypes.bool,
  mute: PropTypes.bool,
  autoPlay: PropTypes.bool,
  inlineOnly: PropTypes.bool,
  fullScreenOnly: PropTypes.bool,
  isAdvertisement: PropTypes.bool,
  disableControls: PropTypes.bool,
  playInBackground: PropTypes.bool,
  playWhenInactive: PropTypes.bool,
  rotateToFullScreen: PropTypes.bool,
  lockPortraitOnFsExit: PropTypes.bool,
  onEnd: PropTypes.func,
  onLoad: PropTypes.func,
  onPlay: PropTypes.func,
  onError: PropTypes.func,
  onProgress: PropTypes.func,
  onMorePress: PropTypes.func,
  onToggleMute: PropTypes.func,
  onFullScreen: PropTypes.func,
  onTimedMetadata: PropTypes.func,
  rate: PropTypes.number,
  volume: PropTypes.number,
  lockRatio: PropTypes.number,
  title: PropTypes.string,
  theme: PropTypes.object,
  topBar: PropTypes.elementType,
  topBarProps: PropTypes.any,
  resizeMode: PropTypes.string,
  hideFullScreenControl: PropTypes.bool,
};

Video.defaultProps = {
  placeholder: undefined,
  style: {},
  error: true,
  loop: false,
  mute: false,
  autoPlay: false,
  inlineOnly: false,
  fullScreenOnly: false,
  isAdvertisement :false,
  disableControls: false,
  playInBackground: false,
  playWhenInactive: false,
  rotateToFullScreen: false,
  lockPortraitOnFsExit: false,
  hideFullScreenControl: false,
  onEnd: () => {},
  onLoad: () => {},
  onPlay: () => {},
  onError: () => {},
  onProgress: () => {},
  onMorePress: undefined,
  onToggleMute: () => {},
  onFullScreen: () => {},
  onTimedMetadata: () => {},
  rate: 1,
  volume: 1,
  lockRatio: undefined,
  title: '',
  theme: defaultTheme,
  resizeMode: 'contain',
  topBar: () => <TopBar />,
  topBarProps: '',
};

export default Video;
