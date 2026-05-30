{
  "name": "go-snake",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "react": "18.2.0",
    "react-native": "0.74.2",
    "react-native-google-mobile-ads": "^13.0.0"
  },
  "private": true
}
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
{
  "expo": {
    "name": "GO SNAKE",
    "slug": "go-snake",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.tonnom.gosnake",
      "supportsTablet": true
    },
    "android": {
      "package": "com.tonnom.gosnake"
    },
    "plugins": [
      "react-native-google-mobile-ads"
    ]
  }
}
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, ImageBackground, Animated, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GRID_SIZE = 15;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CELL_SIZE = SCREEN_WIDTH / GRID_SIZE;

const COLORS = [
  '#ff6600', '#00cc66', '#3399ff', '#ff3366', '#9933ff', 
  '#ffcc00', '#0099cc', '#ff9933', '#66cc33', '#cc33ff', 
  '#ff3399', '#33ccff'
];

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [gameState, setGameState] = useState('home');
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [colorIndex, setColorIndex] = useState(0);
  const [pressedBtn, setPressedBtn] = useState(null);
  const [snake, setSnake] = useState([{ x: 7, y: 7 }]);
  const [food, setFood] = useState({ x: 3, y: 3 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const dirRef = useRef({ x: 0, y: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentColor = COLORS[colorIndex];

  const getGameSpeed = (s) => {
    if (s >= 20) return Math.max(70, 180 - (s * 1.5));
    if (s >= 10) return Math.max(100, 200 - (s * 6));
    return 250 - (s * 8);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }).start(() => setShowIntro(false));
    }, 3000);
    AsyncStorage.getItem('GO_SNAKE_HIGHSCORE').then(s => s && setHighScore(parseInt(s)));
    return () => clearTimeout(timer);
  }, []);

  const spawnFood = (currentSnake) => {
    let newFood;
    while (true) {
      newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
    }
    setFood(newFood);
  };

  const resetGame = async () => {
    if (score > highScore) {
      setHighScore(score);
      await AsyncStorage.setItem('GO_SNAKE_HIGHSCORE', score.toString());
    }
    setColorIndex((prev) => (prev + 1) % COLORS.length);
    setSnake([{ x: 7, y: 7 }]);
    setScore(0);
    dirRef.current = { x: 0, y: 0 };
    setIsGameOver(false);
    setIsStarted(false);
    setGameState('game');
  };

  useEffect(() => {
    if (gameState !== 'game' || !isStarted || isGameOver || isPaused || (dirRef.current.x === 0 && dirRef.current.y === 0)) return;
    const gameLoop = setInterval(() => {
      setSnake(prev => {
        let nextX = prev[0].x + dirRef.current.x;
        let nextY = prev[0].y + dirRef.current.y;
        if (nextX < 0) nextX = GRID_SIZE - 1; else if (nextX >= GRID_SIZE) nextX = 0;
        if (nextY < 0) nextY = GRID_SIZE - 1; else if (nextY >= GRID_SIZE) nextY = 0;
        const head = { x: nextX, y: nextY };
        if (prev.some(s => s.x === head.x && s.y === head.y)) { setIsGameOver(true); return prev; }
        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          spawnFood(newSnake);
        } else { newSnake.pop(); }
        return newSnake;
      });
    }, getGameSpeed(score));
    return () => clearInterval(gameLoop);
  }, [food, isGameOver, gameState, isStarted, isPaused, score]);

  const handleDir = (x, y, btnName) => {
    setPressedBtn(btnName);
    setTimeout(() => setPressedBtn(null), 100);
    if (!isStarted) setIsStarted(true);
    if (dirRef.current.x !== 0 || dirRef.current.y !== 0 ? (x + dirRef.current.x !== 0 || y + dirRef.current.y !== 0) : true) {
      dirRef.current = { x, y };
    }
  };

  if (showIntro) return (
    <View style={styles.appContainer}>
      <Animated.View style={[styles.introContainer, { opacity: fadeAnim }]}>
        <Image source={{ uri: 'https://i.imgur.com/LlbglKN.png' }} style={styles.logo} resizeMode="contain" />
        <Text style={styles.devName}>CSY GAMES</Text>
      </Animated.View>
    </View>
  );

  if (gameState === 'home') return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1633183921767-2e0c740bada2?q=80&w=1302&auto=format&fit=crop' }} style={styles.fullScreen}>
      <View style={styles.mainContainer}>
        <View style={styles.titleContainer}><Text style={styles.title}>GO</Text><Text style={styles.title}>SNAKE</Text></View>
        <Pressable style={[styles.button, {backgroundColor: currentColor}]} onPress={() => setGameState('game')}>
          <Text style={styles.buttonText}>COMMENCER</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );

  return (
    <View style={styles.gameContainer}>
      <View style={styles.header}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={[styles.highScoreText, {color: currentColor}]}>Best: {highScore}</Text>
        <Pressable onPress={() => setIsPaused(!isPaused)} style={[styles.pauseBtn, {backgroundColor: currentColor}]}>
          <View style={styles.pauseIcon}><View style={styles.bar}/><View style={styles.bar}/></View>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
          return <View key={i} style={[
            styles.cell, 
            snake.some(s => s.x === x && s.y === y) && {backgroundColor: '#000'},
            (food.x === x && food.y === y) && {backgroundColor: currentColor}
          ]} />;
        })}
      </View>

      {(isPaused || isGameOver) && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>{isGameOver ? 'GAME OVER' : 'PAUSE'}</Text>
          {isPaused && (
            <Pressable style={styles.optionBtn} onPress={() => setSoundEnabled(!soundEnabled)}>
              <Text style={{fontWeight: 'bold'}}>Son : {soundEnabled ? 'ON' : 'OFF'}</Text>
            </Pressable>
          )}
          <Pressable style={styles.overlayBtn} onPress={isGameOver ? resetGame : () => setIsPaused(false)}>
            <Text style={styles.overlayBtnText}>{isGameOver ? 'REJOUER' : 'REPRENDRE'}</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.dPad}>
        <View style={styles.row}><View style={styles.spacer}/><Pressable style={[styles.btn, pressedBtn === 'UP' && styles.btnActive]} onPress={() => handleDir(0, -1, 'UP')}><View style={styles.arrowUp}/></Pressable><View style={styles.spacer}/></View>
        <View style={styles.row}><Pressable style={[styles.btn, pressedBtn === 'LEFT' && styles.btnActive]} onPress={() => handleDir(-1, 0, 'LEFT')}><View style={styles.arrowLeft}/></Pressable><View style={styles.centerSpacer}/><Pressable style={[styles.btn, pressedBtn === 'RIGHT' && styles.btnActive]} onPress={() => handleDir(1, 0, 'RIGHT')}><View style={styles.arrowRight}/></Pressable></View>
        <View style={styles.row}><View style={styles.spacer}/><Pressable style={[styles.btn, pressedBtn === 'DOWN' && styles.btnActive]} onPress={() => handleDir(0, 1, 'DOWN')}><View style={styles.arrowDown}/></Pressable><View style={styles.spacer}/></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#000' },
  fullScreen: { flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  introContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  logo: { width: 250, height: 250, marginBottom: 20 },
  devName: { color: '#FFF', fontSize: 36, fontWeight: '900', letterSpacing: 6, textTransform: 'uppercase', textAlign: 'center' },
  mainContainer: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingTop: 130, paddingBottom: 180 },
  title: { fontSize: 80, fontWeight: '900', color: '#FFF', lineHeight: 80, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4, textAlign: 'center' },
  button: { marginTop: 'auto', paddingVertical: 20, paddingHorizontal: 50, borderRadius: 40, elevation: 5 },
  buttonText: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  gameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginBottom: 10, alignItems: 'center' },
  scoreText: { fontSize: 20, fontWeight: 'bold' },
  highScoreText: { fontSize: 20, fontWeight: 'bold' },
  pauseBtn: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  pauseIcon: { flexDirection: 'row', justifyContent: 'space-between', width: 16, height: 20 },
  bar: { width: 6, height: 20, backgroundColor: '#fff' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  overlayTitle: { fontSize: 40, fontWeight: 'bold', marginBottom: 20 },
  optionBtn: { padding: 15, backgroundColor: '#eee', borderRadius: 10, marginBottom: 20 },
  overlayBtn: { backgroundColor: '#333', padding: 20, borderRadius: 20 },
  overlayBtnText: { color: '#fff', fontSize: 20 },
  grid: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: '#eee', borderColor: '#ccc', borderWidth: 0.2 },
  dPad: { marginTop: 30 },
  row: { flexDirection: 'row' },
  spacer: { width: 90, height: 90 },
  centerSpacer: { width: 90, height: 90 },
  btn: { width: 90, height: 90, backgroundColor: '#bbb', borderRadius: 45, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#888' },
  btnActive: { backgroundColor: '#555', transform: [{ scale: 0.9 }] },
  arrowUp: { borderBottomWidth: 20, borderBottomColor: '#fff', borderLeftWidth: 15, borderLeftColor: 'transparent', borderRightWidth: 15, borderRightColor: 'transparent' },
  arrowDown: { borderTopWidth: 20, borderTopColor: '#fff', borderLeftWidth: 15, borderLeftColor: 'transparent', borderRightWidth: 15, borderRightColor: 'transparent' },
  arrowLeft: { borderRightWidth: 20, borderRightColor: '#fff', borderTopWidth: 15, borderTopColor: 'transparent', borderBottomWidth: 15, borderBottomColor: 'transparent' },
  arrowRight: { borderLeftWidth: 20, borderLeftColor: '#fff', borderTopWidth: 15, borderTopColor: 'transparent', borderBottomWidth: 15, borderBottomColor: 'transparent' }
});