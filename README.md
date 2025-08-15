# time-control-app
時間管理アプリ

## 準備
- `GoogleService-Info.plist`を用意する

## 開発
- `npm install expo`
- `npx expo start`
- シミュレーターを起動: `npx expo start --ios`

### パッケージをインストール
- `npx expo install package-name`

### 環境変数
環境変数はgitignoreされている
- .env

#### Expoの環境変数に登録する
- `eas env:list`
- `eas env:create --name IOS_GOOGLESERVICE_INFO_PLIST_BASE64 --value "base64に変換した値"`

### ビルド
- `npx expo run:ios`

## デプロイ

### Cloud Functions
#### 準備
- `npm install -g firebase-tools`
- `firebase login`

#### 実行
- `cd cloud-functions`
- `firebase deploy --only functions`

### Expo
- `npm install -g eas-cli`
- `eas login`
- `eas build --platform ios`
- `eas submit --platform ios`