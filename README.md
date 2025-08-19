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

### バージョン
- メジャー: 互換性に影響する大きな変更
- マイナー: 互換性に影響しない新規機能追加
- パッチ: バグ修正

更新したら`npx expo run:ios`を実行

## デプロイ

### Cloud Functions
#### 準備
- `npm install -g firebase-tools`
- `firebase login`

#### lint
- `cd cloud-functions/functions`
- `npm run lint:fix`

#### 実行
- `cd cloud-functions`
- `firebase deploy --only functions`

### Expo
#### 準備
Expo管理画面でプロジェクトを選択->サイドバーのEnvironment variablesから.envをアップロードする
アプリからみられないようにする情報はSecretにする

- `npm install -g eas-cli`
- `eas login`

#### 実行
変更内容はコミット・プッシュする
- `eas build --platform ios`
- `eas submit --platform ios`

jsの変更を更新
- `eas update --branch production --message "コメントを書く"`