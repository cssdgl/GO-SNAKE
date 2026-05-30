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