import { FlatList, StatusBar, StyleSheet, Text, View, SafeAreaView } from 'react-native'
import React from 'react'

import Navigation from './src/navigation'

const App = () => {
  return (
    <>
      <StatusBar barStyle={'dark-content'} />

      <Navigation />

    </>
  )
}

export default App

const styles = StyleSheet.create({

})