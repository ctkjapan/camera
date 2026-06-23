# Camera WebRTC

スマホのカメラ映像をWebRTCでブラウザに表示するシンプルなサンプル

## セットアップ

```bash
cd camera
npm install
npm start
```

デフォルトで `http://localhost:3000` にサーバーが立ちます。スマホで送信する側は次のように開きます（例）:

```
http://<server-ip>:3000/sender.html?room=myroom
```

受信するブラウザは同じ `room` を使います:

```
http://<server-ip>:3000/viewer.html?room=myroom
```

- スタン（STUN）に `stun:stun.l.google.com:19302` を使用します。必要ならTURNを追加してください。

## サーバ無しでの実行 (file://)

このリポジトリには WebSocket シグナリングと手動シグナリングの両方が含まれています。`public/*.html` を直接開く（`file://`）しても、手動で SDP をコピー&ペーストすることで接続できます。

- 送信側 (スマホ): `public/sender.html` を開き「カメラ開始・Offer生成」を押して出力された Local SDP をコピーし、受信側に渡す。生成されたQRコードを別の端末でスキャンしてOfferを共有することもできます。
- 受信側 (ブラウザ): `public/viewer.html` を開き、受け取った Offer を貼り付けて「Answer 生成」を押し、生成された Answer を送信側に返す。Answer はQRコードでも表示されるので、送信側でスキャンできます。

注意: ほとんどのモダンブラウザは `getUserMedia` を安全なコンテキスト（HTTPS または localhost）でのみ許可します。`file://` でカメラが動作しない場合は、一時的にローカルサーバー (`npm start`) を使うか、HTTPS化してください。

