# たすけあいリンク — PWAマッチングアプリ starter

全国の困りごとと支援者をつなぐサービスの開発用スターターです。Next.js + Supabase + Stripeを使用します。

## 重要な状態

このリポジトリは「開発の土台」です。現状、ホーム、依頼一覧、投稿申請、会員登録、マイページ、管理者画面の基本コードを含みます。
一方、応募・チャットの実UI、本人確認の実処理、通報ワークフロー、応募チケット購入、支援金の受領・分配は本番完成版ではありません。支援金を実際に動かすことはできません。
公開前にコードレビュー、セキュリティ検査、法務確認、決済会社の承認が必要です。

## 必要なもの

- Node.js 20以上
- Supabaseアカウント（無料枠から開始可能）
- GitHubアカウント
- Cloudflare Pagesなどの公開先
- 有料決済を使う段階ではStripeアカウントと審査承認

## ローカルで起動

1. このZIPを解凍し、フォルダ内でターミナルを開く
2. `npm install`
3. `.env.example`をコピーして`.env.local`を作り、SupabaseのURLとanon keyを入力
4. SupabaseのSQL Editorで`supabase/schema.sql`を実行
5. `npm run dev`
6. ブラウザで `http://localhost:3000` を開く

Supabase環境変数が未設定の場合、データを使うページは動作しません。

## Supabaseの設定

1. Supabaseで新規プロジェクトを作成
2. Project Settings → APIからProject URLとanon/public keyを取得
3. `.env.local`に設定
4. SQL Editorで`supabase/schema.sql`を実行
5. Authentication → URL ConfigurationでローカルURLと本番URLを設定
6. Authenticationのメール確認とパスワードポリシーを設定
7. 最初の会員を登録後、SQL Editorで信頼できる管理者を指定：

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
```

`YOUR_ADMIN_EMAIL`は実際の管理者メールに置き換えます。roleをユーザー自身が変更できるAPIは作らないでください。

## 公開方法（無料枠から）

### GitHub + Cloudflare Pages

1. GitHubに新しいprivate/publicリポジトリを作る
2. ソースをpush
3. CloudflareでWorkers & Pages → Create → Pages → Connect to Gitを選ぶ（UI名称は変更される場合あり）
4. リポジトリを接続
5. Framework presetをNext.jsとして案内される場合はその設定を確認。Next.jsのSSRは静的Pagesだけでは動かないため、Cloudflareの現行Next.js/Workers対応手順に従う
6. ビルド設定、環境変数を設定してデプロイ
7. Supabase Authの許可URLに本番URLを追加
8. 本番環境で会員登録、投稿、アクセス権限をテスト

注意：Next.jsのサーバー機能（API Routes、Stripe webhook等）を使う場合、静的サイト専用ホスティングでは足りません。Cloudflare WorkersのNext.js対応など、SSR/APIを実行できる方式を選びます。無料枠の制限・利用規約は公開時点で再確認してください。

## PWA

`app/manifest.ts`でPWAマニフェストを提供します。実際にインストール体験を整えるには、192px/512pxアイコン、必要に応じたservice worker、オフライン時の表示を追加してください。PWAはApp Storeの掲載とは別です。

## Stripeのテスト決済

1. Stripeアカウントの事業者確認と利用可能な事業内容を確認
2. Dashboardでテストモードの月額商品とPriceを作成
3. `STRIPE_SECRET_KEY`、`STRIPE_PRICE_MONTHLY`をテスト値で設定
4. `/api/stripe-webhook`をStripe webhook endpointとして登録し、`checkout.session.completed`等のイベントを受ける
5. `STRIPE_WEBHOOK_SECRET`を設定
6. テストカードで成功・失敗・解約をテスト
7. Webhookに冪等性、subscription.updated/deleted処理、請求失敗処理を追加
8. 本番審査、特商法表示等の整備後にライブキーへ切り替える

このスターターは月額Checkout開始のサンプルを含みますが、会員状態の完全な同期・解約画面・返金管理は未完成です。未完成のまま有料会員を販売しないでください。秘密鍵は`NEXT_PUBLIC_`を付けず、Gitへコミットしないでください。

## 支援金の扱い

このスターターでは寄付金・支援金を受領・分配する決済を実装していません。利用料の決済と、支援金の流れは別の機能です。
運営者が資金を預かる、支援者から受取人へ資金を送る、成約代金を分配する仕組みは、資金決済法その他の法令、決済会社の規約、返金・チャージバック・本人確認要件を確認し、必要な専門家相談と決済会社の事前承認を得てから設計してください。

## 本番公開前チェック

- [ ] 事業者情報、問い合わせ先、利用規約、プライバシーポリシー、料金・返金条件を完成
- [ ] 特定商取引法上の表示要否を確認
- [ ] すべてのテーブルのRLSと権限を別アカウントでテスト
- [ ] 管理者権限を一般ユーザーが変更できないことを確認
- [ ] レート制限、スパム対策、通報・ブロック機能を実装
- [ ] 本人確認書類を保管する場合は、専用のprivate storage、閲覧制限、保存期間、削除フローを実装
- [ ] メッセージ内の個人情報・詐欺への注意表示
- [ ] 決済Webhookの署名検証、冪等性、失敗・返金・解約の処理
- [ ] 支援金は承認された資金フローだけを使用
- [ ] バックアップ、ログ監視、問い合わせ対応体制を準備

## 主要ルート

- `/` トップ
- `/requests` 依頼一覧
- `/requests/new` 依頼投稿（ログイン必要）
- `/requests/[id]` 依頼詳細
- `/login` 会員登録・ログイン
- `/account` マイページ
- `/admin` 管理者画面
- `/subscribe` 月額会員のCheckout開始サンプル
- `/safety` 安全ガイド
- `/terms` 利用規約草案
- `/privacy` プライバシー草案
