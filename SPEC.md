# ICU Books (仮) - 開発仕様書 (Specification Document)

## 1. プロジェクト概要
### 1.1 背景
ICU（国際基督教大学）のリベラルアーツ教育において、学生は多岐にわたる分野の授業を履修する。しかし、指定教科書（特に洋書）は高価であり、かつ専攻外の授業で使用した教科書はその後使用される機会が少ない。

### 1.2 目的
学生間での教科書の貸し借りを安価かつ安全に成立させ、経済的負担の軽減と資源の有効活用を実現する。

### 1.3 コアバリュー
* **Trust (信頼):** 学籍番号と本名、大学メールアドレスによる透明性の確保。
* **Fixed Price (安心):** 価格交渉を排除した固定料金制。
* **Eco-system (循環):** 学内での資産循環。

---

## 2. 機能要件 (Functional Requirements)

### 2.1 ユーザー管理 (User Management)
* **登録 (Sign Up):**
    * `@icu.ac.jp` ドメインのメールアドレスのみ登録可能。
    * メール認証必須。
* **プロフィール設定:**
    * **本名 (Full Name):** 必須。登録後変更不可（または管理者承認）。
    * **学籍番号 (Student ID):** 必須。一意であること。公開/非公開の設定要検討（信頼担保のため取引相手には表示）。
    * **プロフィール画像:** 任意。

### 2.2 教科書管理 (Book Listing)
* **出品 (Lending):**
    * タイトル、著者、ISBN（任意）。
    * **使用授業名:** 検索のキーとなるため必須。
    * **状態:** 写真（複数枚可）、コンディションランク（S/A/B/C）、特記事項（書き込み有無など）。
* **検索 (Search):**
    * キーワード検索（書籍名、授業名、教授名）。
    * 絞り込み（貸出可能のみ表示）。

### 2.3 取引プロセス (Transaction Flow)
1.  **リクエスト:** 借り手（Borrower）が期間を指定してリクエストを送信。
2.  **承認:** 貸し手（Lender）がリクエストを承認。
3.  **決済:** 借り手がStripe経由で支払い（仮売上）。
4.  **受け渡し:** 学内等で直接受け渡し。チャットで調整。
5.  **返却:** 期限までに返却。
6.  **完了:** 貸し手が返却を確認し、完了ボタンを押下。売上が確定。

### 2.4 料金体系 (Pricing Model)
**価格競争を防ぐため、システムによる完全固定価格制を採用。**

* **1日:** 50円
* **1週間:** 250円
* **1ヶ月 (30日):** 500円
* **計算ロジック:** ユーザーが指定した期間に対して、最も安くなる組み合わせを自動適用する。
* **手数料:** 総額の10%をプラットフォーム手数料として徴収。残る90%を貸し手に振り込み。

### 2.5 レビュー機能 (Review System)
* 取引完了後、相互に評価（5段階評価 + コメント）。
* 評価項目例: 返却期限の遵守、本の扱い、コミュニケーション。
* 著しく評価が低いユーザーへの利用制限（将来的な機能）。

---

## 3. 技術スタック (Tech Stack)

* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
* **Backend / BaaS:** Supabase
    * Auth: メール認証
    * Database: PostgreSQL
    * Storage: 教科書画像の保存
* **Payment:** Stripe Connect (Express or Standard)
    * C2C決済（プラットフォーム手数料の徴収と送金）を実現するため。

---

## 4. データベース設計 (Database Schema)

### `profiles` (Users)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | PK, References auth.users |
| `email` | text | Unique, @icu.ac.jp only |
| `full_name` | text | |
| `student_id` | text | Unique |
| `avatar_url` | text | |
| `created_at` | timestamp | |

### `textbooks`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `owner_id` | uuid | FK references profiles.id |
| `title` | text | |
| `course_name` | text | Searchable index |
| `condition` | text | e.g., "Good", "Fair" |
| `description` | text | Details about highlights/notes |
| `images` | text[] | Array of image URLs |
| `is_available` | boolean | Default true |

### `transactions`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `book_id` | uuid | FK references textbooks.id |
| `borrower_id` | uuid | FK references profiles.id |
| `lender_id` | uuid | FK references profiles.id |
| `start_date` | date | |
| `end_date` | date | |
| `amount` | integer | Total price in JPY |
| `fee_amount` | integer | 10% platform fee |
| `status` | enum | pending, approved, paid, active, returned, completed, cancelled |
| `stripe_payment_intent_id` | text | |

### `reviews`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `transaction_id` | uuid | FK references transactions.id |
| `reviewer_id` | uuid | Who wrote the review |
| `target_id` | uuid | Who is being reviewed |
| `rating` | integer | 1-5 |
| `comment` | text | |

---

## 5. UI/UX ガイドライン

### デザインコンセプト
* **Clean & Academic:** 信頼性を重視したシンプルで清潔感のあるデザイン。
* **Mobile First:** キャンパス内での利用を想定し、スマートフォンでの操作性を最優先。

### 必須画面
1.  **ランディングページ:** サービスの意義（安価・学内限定）を伝える。
2.  **認証画面:** サインアップ/ログイン。
3.  **教科書一覧/検索:** フィルタリング機能付き。
4.  **教科書詳細:** 写真、状態、所有者の信頼度（レビュー）を表示。
5.  **マイページ:** 出品管理、借入履歴、売上確認。
6.  **取引チャット:** 取引中のユーザー同士の連絡用。

---

## 6. セキュリティとリスク管理

### なりすまし防止
* メールアドレスによるドメイン認証 (`@icu.ac.jp`)。
* 初回登録時の学籍番号入力による心理的ハードル設置。

### トラブル対応
* **書き込み/汚損:** 事前の写真登録と状態記述を必須化し、証拠とする。
* **未返却:** Stripeによる決済ホールドを活用し、重大な違反時はアカウント停止措置を行う。