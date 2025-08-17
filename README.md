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

### ビルド
- `npx expo run:ios` : 新しいシミュレーターでアプリがないときにはビルドが必要
- `npx expo prebuild --platform ios`

## デプロイ

### Cloud Functions
#### 準備
- `npm install -g firebase-tools`
- `firebase login`

#### 実行
- `cd cloud-functions`
- `firebase deploy --only functions`

### Expo
#### 準備
Expo管理画面でプロジェクトを選択->サイドバーのEnvironment variablesから.envをアップロードする
アプリからみられないようにする情報はSecretにする

#### 実行
変更内容はコミット・プッシュする
- `npm install -g eas-cli`
- `eas login`
- `eas build --platform ios`
- `eas submit --platform ios`