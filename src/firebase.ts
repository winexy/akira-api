import firebase, {ServiceAccount} from 'firebase-admin'
import * as serviceAccount from '../firebase-service-account.json'

let app: firebase.app.App
let auth: firebase.auth.Auth
let messaging: firebase.messaging.Messaging

export function initializeApp(config: AppConfigService) {
  if (app) {
    return
  }

  const credential = firebase.credential.cert(serviceAccount as ServiceAccount)

  app = firebase.initializeApp({credential})
  auth = firebase.auth(app)
  messaging = firebase.messaging(app)

  if (config.get('USE_MOCK_AUTH')) {
    console.info('Using mock auth service')
    // @ts-expect-error all needed api is mocked
    auth = {
      async verifyIdToken() {
        return {
          uid: config.get('SUPERUSER_UID')
        } as firebase.auth.DecodedIdToken
      },
      async getUser() {
        return {
          uid: config.get('SUPERUSER_UID')
        } as firebase.auth.UserRecord
      }
    }
  }
}

export {firebase, auth, messaging}
