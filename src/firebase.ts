import firebase, {ServiceAccount} from 'firebase-admin'
import * as serviceAccount from '../firebase-service-account.json'

let app: firebase.app.App
let auth: firebase.auth.Auth
let messaging: firebase.messaging.Messaging

export function initializeApp() {
  if (app) {
    return
  }

  const credential = firebase.credential.cert(serviceAccount as ServiceAccount)

  app = firebase.initializeApp({credential})
  auth = firebase.auth(app)
  messaging = firebase.messaging(app)
}

export {firebase, auth, messaging}
