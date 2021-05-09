import firebase from 'firebase-admin'

declare module 'express' {
  interface Request {
    user: firebase.auth.UserRecord
  }
}
