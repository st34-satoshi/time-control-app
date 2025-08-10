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

### ビルド
- `npx expo run:ios`

## デプロイ
### Cloud Functions
- `firebase deploy`