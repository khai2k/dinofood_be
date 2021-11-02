// Firebase project configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA3zCXMwy6l7ZfTg3JnZR221J5jqHQBOiw',
  authDomain: 'dinofood.firebaseapp.com',
  databaseURL: 'https://dinofood.firebaseio.com',
  projectId: 'dinofood',
  storageBucket: 'dinofood.appspot.com',
  messagingSenderId: '1064557322091',
  appId: '1:1064557322091:web:c792c3684d2ce823bbf62e'
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const database = firebase.database()

const firestore = firebase.firestore()

// /**
//  * Watch disconnectMessages collection
//  */
// const unsubscribeDisconnectMessageRef = firestore
//   .collection('disconnectMessages')
//   .onSnapshot(function(snapshot) {
//     console.log('disconnectMessages', { snapshot })
//   }, function(error) {
//     console.log('disconnectMessages', { error })
//   })

// unsubscribeDisconnectMessageRef()

// /**
//  * Watch orders collection
//  */
// const unsubscribeOrderRef = firestore
//   .collection('orders')
//   .onSnapshot(function(snapshot) {
//     console.log('orders', { snapshot })
//   }, function(error) {
//     console.log('orders', { error })
//   })

// // Stop listening to changes
// // unsubscribeOrderRef()

// /**
//  * Watch orders record
//  */
// const unsubscribeOrderRef = firestore
//   .collection('orders')
//   .doc('123123123123123123123123')
//   .onSnapshot(function(doc) {
//     console.log('Current order data: ', doc.data())
//   }, function(error) {
//     console.log('orders', { error })
//   })

// // Stop listening to changes
// // unsubscribeOrderRef()