---
title: '達人が教えるWebパフォーマンスチューニング'
description: '達人が教えるWebパフォーマンスチューニングを読んだメモ'
date: 2025-06-14
draft: false
---

![カバー画像](https://gihyo.jp/assets/images/cover/2022/9784297128463.jpg)

[達人が教えるWebパフォーマンスチューニング〜ISUCONから学ぶ高速化の実践](https://gihyo.jp/book/2022/978-4-297-12846-3) を読んだ覚え書き｡
[private-isu](https://github.com/catatsuy/private-isu)を題材として手を動かしつつWebアプリのパフォーマンスチューニングを学ぶことができる｡

## モチベーション
- パフォーマンスチューニングを興味がある
- Grafana Cloudを使ってみたい

## システム構成
- Arch Linux (Hypervisor)
  - private-isu app実行環境 (VM 4vCPU, 7.5GB RAM)
  - private-isu benchmerker実行環境 (VM 4vCPU, 7.5GB RAM)
- Mac
	- vscodeクライアント
- Grafana Cloud
  - Alloy
  - Grafana

private-isu環境は [private-isu](https://github.com/catatsuy/private-isu) のVagrantを参考にして構築する｡  

### private-isu app実行環境の構築

自宅サーバのKVM上で動かせるようにVagrantファイルに変更を入れる｡

<details><summary>show diff</summary>
  
```diff
❯ git diff Vagrantfile
diff --git a/Vagrantfile b/Vagrantfile
index da33de2..667d343 100644
--- a/Vagrantfile
+++ b/Vagrantfile
@@ -1,7 +1,8 @@
 # vi: set ft=ruby :

 Vagrant.configure("2") do |config|
-  config.vm.box = "ubuntu/jammy64"
+  #config.vm.box = "ubuntu/jammy64"
+  config.vm.box = "bento/ubuntu-22.04"
   config.vm.box_check_update = false

   config.vm.network "private_network", type: "dhcp"
@@ -9,9 +10,12 @@ Vagrant.configure("2") do |config|
   config.vm.define "app" do |app|
     app.vm.hostname = "app"
     app.vm.network "forwarded_port", guest: 80, host: 8000
-    app.vm.provider "virtualbox" do |vb|
-      vb.cpus = 2
-      vb.memory = 1500
+    #app.vm.provider "virtualbox" do |vb|
+    app.vm.provider "libvirt" do |vb|
+      vb.cpus = 4
+      vb.memory = 7680
+      # vb.cpus = 2
+      # vb.memory = 1500
     end

     app.vm.provision "ansible" do |ansible|
@@ -29,7 +33,7 @@ Vagrant.configure("2") do |config|

   config.vm.define "bench" do |bench|
     bench.vm.hostname = "bench"
-    bench.vm.provider "virtualbox" do |vb|
+    bench.vm.provider "libvirt" do |vb|
       vb.cpus = 4
       vb.memory = 7680
     end
```

</details>

AnsibleではRuby, PHPの実行環境の構築に失敗してしまう｡  
使う予定もないので下記ファイルから該当の処理をコメントアウトする｡

- provisioning/image/ansible/03_nginx.yml
- provisioning/image/ansible/04_xbuild.yml
- provisioning/image/ansible/07_application.yml


VagrantでVMを立ち上げ､[private-isu の manual.md](https://github.com/catatsuy/private-isu/blob/master/manual.md) を参考にgo実装に切り替える｡

app.local でアクセスできるようにするために `avahi` をインストールする｡

```sh
sudo apt install -y avahi-daemon
```

### private-isu benchmerker実行環境

同じくVagrantでVMを立ち上げ､imageデータをダウンロード･展開する｡

```sh
cd private-isu-bench/benchmarker
make

cd private-isu-bench/benchmarker/userdata
curl -# -OL https://github.com/catatsuy/private-isu/releases/download/img/img.zip
unzip img.zip
```

bench.local でアクセスできるようにするために `avahi` をインストールする｡

```sh
sudo apt install -y avahi-daemon
```

benchmarkを走らせて動作確認｡
```sh
/home/isucon/private_isu/benchmarker/bin/benchmarker -u /home/isucon/private_isu/benchmarker/userdata -t http://app.local
```

どうやらScore:0､ エラーありの状態から開始らしい｡  
そんなポンコツスペックではないのでなにかおかしそうだが､気にせず進める｡

```json
{"pass":false,"score":0,"success":4,"fail":6,"messages":["リクエストがタイムアウトしました (POST /login)","リクエストがタイムアウトしました (POST /register)"]}
```

## 監視環境を作る

### process-exporterの導入

topコマンドみたいなプロセスごとのCPU Usageが見たい｡  
app.localに[process-exporter](https://github.com/ncabatoff/process-exporter)を入れる｡
```sh
wget https://github.com/ncabatoff/process-exporter/releases/download/v0.8.7/process-exporter_0.8.7_linux_amd64.deb

sudo apt install ./process-exporter_0.8.7_linux_amd64.deb
rm ./process-exporter_0.8.7_linux_amd64.deb
```

### Alloyでメトリクス転送

[install grafana alloy on linux](https://grafana.com/docs/alloy/latest/set-up/install/linux/#install-grafana-alloy-on-linux) を参考に app.local にAlloyをインストールする｡

app.local 環境にインストールしたalloyのconfig: `/etc/alloy/config.alloy`

```ini
prometheus.scrape "local_exporter" {
  targets = [
    {"__address__" = "localhost:9256", "instance" = "private-isu"},
  ]
  forward_to = [prometheus.remote_write.grafana_cloud.receiver]
}

prometheus.remote_write "grafana_cloud" {
  endpoint {
    url = "https://prometheus-prod-xxx.grafana.net/api/prom/push"

	basic_auth {
        username = "xxx"
        password = "xxx"
      }
  }
}
```

alloy をリスタート
```sh
sudo systemctl enable alloy
sudo systemctl start alloy
systemctl status process-exporter
```

### grafanaで可視化

![Grafana](/images/web-performance-tuning-grafana.png)

CPU Usage

```promql
(sum(irate(namedprocess_namegroup_cpu_seconds_total{instance="private-isu", groupname=~"app|alloy|mysqld|nginx|node|code-848b80aeb5"}[$__rate_interval])) by (groupname) > 0) / scalar(count(count(node_cpu_seconds_total) by (cpu)))
```

File Descriptor Usage

```promql
namedprocess_namegroup_open_filedesc{instance=~"private-isu", job="$job"}
```

Memory Usage

```promql
namedprocess_namegroup_memory_bytes{instance="private-isu", memtype="resident", job="$job"} / ignoring(memtype) namedprocess_namegroup_num_procs > 0
```

Threads (これはあまり見なかった)

```promql
namedprocess_namegroup_num_threads{instance="private-isu", job="$job"}
```

## プロファイラ
### alp

nginxのアクセスログを解析するツール｡

インストール｡
```sh
wget https://github.com/tkuchiki/alp/releases/download/v1.0.21/alp_linux_amd64.zip
unzip alp_linux_amd64.zip
sudo install alp /usr/local/bin/alp
```

使用できるか確認
```sh
$ alp -v
1.0.21
```

### pt-query-digest

MySQLのスロークエリを解析するツール｡

インストール｡ ref. [GitHub](https://github.com/percona/percona-toolkit)

```bash
cd /tmp
git clone https://github.com/percona/percona-toolkit.git
cd percona-toolkit

perl Makefile.PL
make
make test
make install # /usr/local/binへのwrite権限がなく失敗する
sudo cp -a /tmp/percona-toolkit/blib/script/pt-query-digest /usr/local/bin/
```

pt-query-digestでスロークエリを解析｡

```bash
pt-query-digest /var/log/mysql/mysql-slow.log
```

## パフォーマンスチューニングのログ
### 初期状態

Score
```json
{"pass":false,"score":0,"success":4,"fail":6,"messages":["リクエストがタイムアウトしました (POST /login)","リクエストがタイムアウトしました (POST /register)"]}
```

### commentsテーブルの post_id, created_at にインデックスを貼る

```sql
ALTER TABLE comments ADD INDEX post_id_idx (post_id, created_at DESC);
```

Score  
スコアが一気に伸びた｡

```json
{"pass":true,"score":1947,"success":1853,"fail":0,"messages":[]}
```

### 静的ファイルをnginxで配信 [# Commit 742d6bc](https://github.com/csnagu/private-isu-2025/commit/742d6bcfb32c000b0457f1f1c4e03900fac03859)

favicon.ico, css, js, img をnginxから配信する｡

```diff
$ git diff etc/nginx.conf
-  root /home/isucon/private_isu/webapp/public/;
+  root /home/isucon/private_isu/webapp/public;
+
+  location ~^/(favicon\.ico|css/|js/|img/) {
+    root /home/isucon/private_isu/webapp/public/;
+    expires 1;
+  }
```

Score  
6,000 くらい向上した｡

```json
{"pass":true,"score":2107,"success":2011,"fail":0,"messages":[]}
```

### アップロード画像を静的ファイルとして配信 [# Commit c61e4f8](https://github.com/csnagu/private-isu-2025/commit/c61e4f83863962c2e7d2838ac6d5fa7957b0e59a)

App → MySQLへ問い合わせると､MySQLから取得した画像のバイナリデータを一度メモリに載せてからレスポンスを返すため､オーバーヘッドが大きい｡  
アプリケーションを介さず静的ファイルとして配信する｡


Score

```json
{"pass":true,"score":3020,"success":2901,"fail":0,"messages":[]}
```

### GET / を改修する [# Commit 7ccdcdb](https://github.com/csnagu/private-isu-2025/commit/7ccdcdbd1aba267fd7c6605af8c644d9b9a99b6e)


`GET /` のmakePosts()の中で､post１件毎にusersテーブルにクエリを発行するN+1問題が発生している｡postsテーブルとusersテーブルをJOINして読み込む行数を減らすことを試みる｡

```sql
mysql> SELECT COUNT(*) FROM `posts`;
+----------+
| COUNT(*) |
+----------+
|    10183 |
+----------+
1 row in set (0.03 sec)

mysql> EXPLAIN SELECT p.id, p.user_id, p.body, p.mime, p.created_at, u.account_name FROM posts AS p JOIN users AS u ON (p.user_id=u.id) WHERE u.del_flg=0 ORDER BY p.created_at DESC LIMIT 20\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: p
   partitions: NULL
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 10128
     filtered: 100.00
        Extra: Using filesort
*************************** 2. row ***************************
           id: 1
  select_type: SIMPLE
        table: u
   partitions: NULL
         type: eq_ref
possible_keys: PRIMARY
          key: PRIMARY
      key_len: 4
          ref: isuconp.p.user_id
         rows: 1
     filtered: 10.00
        Extra: Using where
2 rows in set, 1 warning (0.00 sec)
```

postsテーブルからほぼ全行の読み込みをしている｡インデックスを貼って読み込む行数を減らす｡

```sql
ALTER TABLE posts ADD INDEX posts_order_idx (created_at DESC);
```

```sql
mysql> EXPLAIN SELECT p.id, p.user_id, p.body, p.mime, p.created_at, u.account_name FROM posts AS p JOIN users AS u ON (p.user_id=u.id) WHERE u.del_flg=0 ORDER BY p.created_at DESC LIMIT 20\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: p
   partitions: NULL
         type: index
possible_keys: NULL
          key: posts_order_idx
      key_len: 4
          ref: NULL
         rows: 199
     filtered: 100.00
        Extra: NULL
*************************** 2. row ***************************
           id: 1
  select_type: SIMPLE
        table: u
   partitions: NULL
         type: eq_ref
possible_keys: PRIMARY
          key: PRIMARY
      key_len: 4
          ref: isuconp.p.user_id
         rows: 1
     filtered: 10.00
        Extra: Using where
2 rows in set, 1 warning (0.00 sec)
```

良さそう｡この結果を持ってapp.goを改修する｡  
sqlxではJOINをそのまま使えないらしい｡user構造体を持つpost構造体に､user構造体の値 `u.account_name`をdb.Select()から入れようとするとエラーになる｡

```go
type User struct {
	ID int `db:"id"`
	AccountName string `db:"account_name"`
	Passhash string `db:"passhash"`
	Authority int `db:"authority"`
	DelFlg int `db:"del_flg"`
	CreatedAt time.Time `db:"created_at"`
}
type Post struct {
	ID int `db:"id"`
	UserID int `db:"user_id"`
	Imgdata []byte `db:"imgdata"`
	Body string `db:"body"`
	Mime string `db:"mime"`
	CreatedAt time.Time `db:"created_at"`
	CommentCount int
	Comments []Comment
	User User
	CSRFToken string
}

func getIndex(w http.ResponseWriter, r *http.Request) {
	results := []Post{}
	  
	err := db.Select(&results, "SELECT p.id, p.user_id, p.body, p.mime, p.created_at, u.account_name FROM posts AS p JOIN users AS u ON (p.user_id=u.id) WHERE u.del_flg=0 ORDER BY p.created_at DESC LIMIT ?", postsPerPage)
...
}
```

```text
Jun 01 06:37:17 private-isu app[54238]: 2025/06/01 06:37:17 app.go:392: missing destination name account_name in *[]main.Post
```

以下のように明示的にuser構造体のフィールドであることを指定して解消できた｡

```sql
u.account_name as `user.account_name`
```

Score
```json
{"pass":true,"score":4424,"success":4242,"fail":0,"messages":[]}
```


### プリペアドステートメントの改修 [# Commit 8b72a8d](https://github.com/csnagu/private-isu-2025/commit/8b72a8df42665ff5dcfccd5bf7bec229517479bb)

`interpolateParams=true` をdsnに追加すると良いらしい｡  
└ [prepare と interpolateParams=true | tetsuzawa.com](https://www.tetsuzawa.com/docs/ISUCON/go/prepare-interpolateParams/)

Score

```json
{"pass":true,"score":6104,"success":5870,"fail":0,"messages":[]}
```

### comments テーブルへインデックスを追加する

slow-query

```sql
# Profile
# Rank Query ID                      Response time Calls R/Call V/M   Item
# ==== ============================= ============= ===== ====== ===== ====
#    1 0x396201721CD58410E070DA94... 77.9625 32.4% 13906 0.0056  0.01 SELECT users
#    2 0x624863D30DAC59FA16849282... 40.9843 17.0%  5120 0.0080  0.01 SELECT comments
#    3 0x422390B42D4DD86C7539A5F4... 36.4387 15.1%  5303 0.0069  0.01 SELECT comments
#    4 0xCDEB1AFF2AE2BE51B2ED5CF0... 29.5805 12.3%    30 0.9860  0.05 SELECT comments

```

1,2,3は呼び出し回数(Call)が多いが､1呼び出しあたりの処理時間(R/Call)は短いためアプリ側の改善が必要にみえる｡
4番目のクエリは呼び出し回数が少ないが1呼び出しあたりの処理時間が長いため改善の余地がある｡対象のSQLは以下｡

```sql
mysql> EXPLAIN SELECT COUNT(*) AS count FROM `comments` WHERE `user_id` = 724\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: comments
   partitions: NULL
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 99359
     filtered: 10.00
        Extra: Using where
1 row in set, 1 warning (0.02 sec)
```

ほぼ全探索してしまっている｡user_idにインデックスを貼る｡

```sql
ALTER TABLE `comments` ADD INDEX `idx_user_id` (`user_id`);
```

Score

```json
{"pass":true,"score":6434,"success":6195,"fail":0,"messages":[]}
```

### N+1問題の解消   [# Commit 40cef4d](https://github.com/csnagu/private-isu-2025/commit/40cef4df64a8825f775e23c74ce6e551318ce652)

```sql
# Profile
# Rank Query ID                      Response time Calls R/Call V/M   Item
# ==== ============================= ============= ===== ====== ===== ====
#    1 0x396201721CD58410E070DA94... 82.6631 36.8% 14687 0.0056  0.01 SELECT users
#    2 0x624863D30DAC59FA16849282... 42.7369 19.0%  5284 0.0081  0.01 SELECT comments
#    3 0x422390B42D4DD86C7539A5F4... 39.4725 17.6%  5492 0.0072  0.01 SELECT comments

---
SELECT * FROM `users` WHERE `id` = 360\G
SELECT * FROM `comments` WHERE `post_id` = 9963 ORDER BY `created_at` DESC LIMIT 3\G
SELECT COUNT(*) AS `count` FROM `comments` WHERE `post_id` = 9995\G
```

`makePosts()` 関数のloopでDBへの問い合わせが頻発している｡

```go
for _, p := range results {
	err := db.Get(&p.CommentCount, "SELECT COUNT(*) AS `count` FROM `comments` WHERE `post_id` = ?", p.ID)
	if err != nil {
		return nil, err
	}

	query := "SELECT * FROM `comments` WHERE `post_id` = ? ORDER BY `created_at` DESC"
	if !allComments {
		query += " LIMIT 3"
	}
	var comments []Comment
	err = db.Select(&comments, query, p.ID)
	if err != nil {
		return nil, err
	}

	for i := 0; i < len(comments); i++ {
		err := db.Get(&comments[i].User, "SELECT * FROM `users` WHERE `id` = ?", comments[i].UserID)
		if err != nil {
			return nil, err
		}
	}
```

まずはJOINを使ってN+1問題を解消する｡ 

Score

2,000 上昇した｡効果はかなり大きそう｡
```json
{"pass":true,"score":8589,"success":8306,"fail":0,"messages":[]}
```

### memcachedによるコメント関連のキャッシュ  [# Commit ee0e5bd](https://github.com/csnagu/private-isu-2025/commit/ee0e5bdeedd32ffbd019b08461ab1e27d7ddb797)

memcachedを使ってキャッシュする｡仕様は以下｡
- makePosts関数の中でmemcachedに問い合わせ
	- キャッシュがあれば使う
	- キャッシュがなければMySQLに問い合わせキャッシュを作成する
- 投稿にコメントが追加された場合は､コメントのあった投稿に関するキャッシュを破棄する
- TTLは10秒
- 投稿ごとのコメント数のキーは `comments.{posts.id}.count`
- 投稿ごとのコメント全件のキーは `comments.{posts.id}.true`
- 投稿ごとのコメント最新3件のキーは `comments.{posts.id}.false`

Score

500向上｡思ったより控えめ
```json
{"pass":true,"score":9025,"success":8721,"fail":0,"messages":[]}
```

### 外部コマンドの呼び出しを辞める  [# Commit 45c868c](https://github.com/csnagu/private-isu-2025/commit/45c868ca5675e2332158446bec54803203b4c3cc)

```go
func digest(src string) string {Add commentMore actions
	return fmt.Sprintf("%x", sha512.Sum512([]byte(src)))
```

Score  
ついに大台の1万を超えた｡

```json
{"pass":true,"score":10779,"success":10330,"fail":0,"messages":[]}
```

### MySQLの設定調整でINSERTを高速にする  [# Commit 6a29538](https://github.com/csnagu/private-isu-2025/commit/6a2953830ad02ed503b34ee8138e6a83c408038e)

5, 11, 12, 14, 16のINSERTを消し去りたい｡
```sql
# Profile
# Rank Query ID                       Response time Calls R/Call V/M   Ite
# ==== ============================== ============= ===== ====== ===== ===
#    1 0x1FD3A7D53ECF44C9E39DB9A71... 17.0185 22.0%  1525 0.0112  0.01 SELECT comments users
#    2 0x422390B42D4DD86C7539A5F45... 11.2074 14.5%  1458 0.0077  0.01 SELECT comments
#    3 0xA047A0D0BA167343E5B367867...  7.2239  9.3%   235 0.0307  0.01 SELECT users
#    4 0x9F7A2CFF4B8BA81A450918E7E...  7.1677  9.3%   272 0.0264  0.02 SELECT posts
#    5 0x2822B8A98D614ECBDD1C1E56F...  6.0068  7.8%    15 0.4005  0.30 INSERT posts
#    6 0x312E0027ABA918FBCF55E5D19...  5.2580  6.8%   369 0.0142  0.01 SELECT posts users
#    7 0x19759A5557089FD5B718D440C...  5.1002  6.6%   137 0.0372  0.02 SELECT posts
#    8 0x42C29FB96699C9FDDB09D3D3F...  4.2100  5.4%   272 0.0155  0.01 SELECT comments users
#    9 0x396201721CD58410E070DA942...  2.0887  2.7%   316 0.0066  0.01 SELECT users
#   10 0x995F41A1456C1CF6746D96521...  1.9253  2.5%   929 0.0021  0.00 SET
#   11 0x26489ECBE26887E480CA8067F...  1.5483  2.0%    31 0.0499  0.04 INSERT users
#   12 0x16CFE2667473FE8863B8066E0...  1.4166  1.8%     2 0.7083  0.01 INSERT posts
#   13 0x82E4B026FA27240AB4BB2E774...  1.1999  1.5%    44 0.0273  0.02 SELECT users
#   14 0x9F2038550F51B0A3AB05CA526...  1.0381  1.3%    21 0.0494  0.01 INSERT comments
#   15 0x979CA34F096654135383AD4AD...  0.7422  1.0%    44 0.0169  0.01 SELECT posts
#   16 0x174B1FAB84BE4F47C2D96EA0B...  0.7392  1.0%     1 0.7392  0.00 INSERT posts
```

mysql.cnfの `[mysqld]` スタンザに設定を変更する｡

```ini
[mysqld]
# コミットごとに更新データをログに書き､1秒毎にログをフラッシュ
innodb_flush_log_at_trx_commit = 2
# バイナリログを無効化する
disable-log-bin = 1
```

slow-query
postsへのINSERTは残ってしまったが､その他のINSERTは姿を消した｡
```sql
# Profile
# Rank Query ID                       Response time Calls R/Call V/M   Ite
# ==== ============================== ============= ===== ====== ===== ===
#    1 0x1FD3A7D53ECF44C9E39DB9A71... 14.7391 21.3%  1536 0.0096  0.01 SELECT comments users
#    2 0x422390B42D4DD86C7539A5F45... 10.3143 14.9%  1487 0.0069  0.01 SELECT comments
#    3 0x9F7A2CFF4B8BA81A450918E7E...  8.9774 13.0%   314 0.0286  0.04 SELECT posts
#    4 0xA047A0D0BA167343E5B367867...  6.6693  9.6%   255 0.0262  0.02 SELECT users
#    5 0x2822B8A98D614ECBDD1C1E56F...  5.6779  8.2%    20 0.2839  0.19 INSERT posts
#    6 0x312E0027ABA918FBCF55E5D19...  5.5711  8.1%   387 0.0144  0.02 SELECT posts users
#    7 0x42C29FB96699C9FDDB09D3D3F...  4.3243  6.3%   313 0.0138  0.01 SELECT comments users
#    8 0x19759A5557089FD5B718D440C...  2.9153  4.2%    99 0.0294  0.02 SELECT posts
#    9 0x396201721CD58410E070DA942...  1.9488  2.8%   344 0.0057  0.01 SELECT users
#   10 0x995F41A1456C1CF6746D96521...  1.8903  2.7%   997 0.0019  0.00 SET
#   11 0x82E4B026FA27240AB4BB2E774...  1.1899  1.7%    49 0.0243  0.01 SELECT users
#   12 0x979CA34F096654135383AD4AD...  0.7460  1.1%    49 0.0152  0.03 SELECT posts
#   13 0xC37F2207FE2E699A3A976F5EB...  0.7283  1.1%    49 0.0149  0.02 SELECT comments

---
INSERT INTO `posts` (`user_id`, `mime`, `imgdata`, `body`) VALUES (340,'image/png',_binary'�PNG\r\n\Z\n\0\...');
```

Score  
400ほど向上した｡

```json
{"pass":true,"score":11101,"success":10630,"fail":0,"messages":[]}
```

### memcachedへの問い合わせ回数を減らす  [# Commit e0bec0e](https://github.com/csnagu/private-isu-2025/commit/e0bec0eb9cb50761bf08031312ac772537bee288)

`memcacheClient.Get()` で都度問い合わせをしている箇所を､`memcacheClient.GetMulti()`を使ってまとめて問い合わせるようにする｡


Score  
2,000向上した｡getMulti()の効果すごい｡

```json
{"pass":true,"score":13561,"success":12983,"fail":0,"messages":[]}
```


**ここまでで書籍の内容は一通り終わり**｡

---
### pprofを導入する  [# Commit cd10305](https://github.com/csnagu/private-isu-2025/commit/cd10305263781661c403697639bfc3c0bf73ffc8)

pprofを動かしている状態でベンチマークを実行して基準となるScore, alp, slow-queryを更新する｡

```sh
go tool pprof -seconds 70 -http=localhost:1080 http://localhost:6060/debug/pprof/profile
```

Score

```json
{"pass":true,"score":12296,"success":11786,"fail":0,"messages":[]}
```

### GoのTemplateを高速にする  [# Commit 4118f9a](https://github.com/csnagu/private-isu-2025/commit/4118f9adc150954d8be8b00287d0db4ba1dc5ba1)

pporfの結果を見るとtemplateの処理に結構な時間がかかっている｡
![](/images/web-performance-tuning-pprof-before.png)

`getIndex()` のtemplate.executeしている部分を`fmt.Sprintf()`に置き換えた｡先人の力を借りる｡  
└ [GET /, GET /admin/bannedでhtml/templateを使わないようにした](https://github.com/Gurrium/private-isu/pull/4/commits/a55dad2a01f5ff7286c41f02402691fb00937a81)

pprofの結果としてもだいぶ改善されている｡
![](/images/web-performance-tuning-pprof-after.png)


Score  
4,000あがった｡

```json
{"pass":true,"score":16043,"success":15407,"fail":0,"messages":[]}
```

### json.Marshal(), json.Unmsharshal() を高速にする

pprofの結果から以下の処理で時間かかっているように見える｡
- `json.Unmarshal`
- `json.Marshal`
- `memcached`

Marshal, Unmarshalが高速と噂のgo-jsonに置き換える｡  
└ https://pkg.go.dev/github.com/goccy/go-json

pprof上ではmarshal, unmarshalの所要時間が減ったが､Scoreはほとんど変化なし

Score

```json
{"pass":true,"score":16002,"success":15353,"fail":0,"messages":[]}
```

### account_nameにインデックスを貼る

```sql
ALTER TABLE users ADD INDEX users_accountname_idx(account_name);
```

Score  
微増した｡

```json
{"pass":true,"score":16269,"success":15606,"fail":0,"messages":[]}
```

## Scoreの推移


```json
// 初期スコア
{"pass":false,"score":0,"success":4,"fail":6,"messages":["リクエストがタイムアウトしました (POST /login)","リクエストがタイムアウトしました (POST /register)"]}

// commentsテーブルの post_id, created_at にインデックスを貼る
{"pass":true,"score":1947,"success":1853,"fail":0,"messages":[]}

// 静的ファイルをnginxで配信 [# Commit 742d6bc](https://github.com/csnagu/private-isu-2025/commit/742d6bcfb32c000b0457f1f1c4e03900fac03859)
{"pass":true,"score":2107,"success":2011,"fail":0,"messages":[]}

// アップロード画像を静的ファイルとして配信 [# Commit c61e4f8](https://github.com/csnagu/private-isu-2025/commit/c61e4f83863962c2e7d2838ac6d5fa7957b0e59a)
{"pass":true,"score":3020,"success":2901,"fail":0,"messages":[]}

// GET / を改修する [# Commit 7ccdcdb](https://github.com/csnagu/private-isu-2025/commit/7ccdcdbd1aba267fd7c6605af8c644d9b9a99b6e)
{"pass":true,"score":4424,"success":4242,"fail":0,"messages":[]}

// プリペアドステートメントの改修 [# Commit 8b72a8d](https://github.com/csnagu/private-isu-2025/commit/8b72a8df42665ff5dcfccd5bf7bec229517479bb)
{"pass":true,"score":6104,"success":5870,"fail":0,"messages":[]}

// comments テーブルへインデックスを追加する
{"pass":true,"score":6434,"success":6195,"fail":0,"messages":[]}

// N+1問題の解消   [# Commit 40cef4d](https://github.com/csnagu/private-isu-2025/commit/40cef4df64a8825f775e23c74ce6e551318ce652)
{"pass":true,"score":8589,"success":8306,"fail":0,"messages":[]}

// memcachedによるコメント関連のキャッシュ  [# Commit ee0e5bd](https://github.com/csnagu/private-isu-2025/commit/ee0e5bdeedd32ffbd019b08461ab1e27d7ddb797)
{"pass":true,"score":9025,"success":8721,"fail":0,"messages":[]}

// 外部コマンドの呼び出しを辞める  [# Commit 45c868c](https://github.com/csnagu/private-isu-2025/commit/45c868ca5675e2332158446bec54803203b4c3cc)
{"pass":true,"score":10779,"success":10330,"fail":0,"messages":[]}

// MySQLの設定調整でINSERTを高速にする  [# Commit 6a29538](https://github.com/csnagu/private-isu-2025/commit/6a2953830ad02ed503b34ee8138e6a83c408038e)
{"pass":true,"score":11101,"success":10630,"fail":0,"messages":[]}

// memcachedへの問い合わせ回数を減らす  [# Commit e0bec0e](https://github.com/csnagu/private-isu-2025/commit/e0bec0eb9cb50761bf08031312ac772537bee288)
{"pass":true,"score":13561,"success":12983,"fail":0,"messages":[]}

// pprofを導入する  [# Commit cd10305](https://github.com/csnagu/private-isu-2025/commit/cd10305263781661c403697639bfc3c0bf73ffc8)
{"pass":true,"score":12296,"success":11786,"fail":0,"messages":[]}

// GoのTemplateを高速にする  [# Commit 4118f9a](https://github.com/csnagu/private-isu-2025/commit/4118f9adc150954d8be8b00287d0db4ba1dc5ba1)
{"pass":true,"score":16043,"success":15407,"fail":0,"messages":[]}

// json.Marshal(), json.Unmsharshal() を高速にする
{"pass":true,"score":16002,"success":15353,"fail":0,"messages":[]}

// account_nameにインデックスを貼る
{"pass":true,"score":16269,"success":15606,"fail":0,"messages":[]}
```

## 感想

ボトルネック箇所に順にアプローチしていくことでスコアを上げていくのが楽しい｡
簡単にだがNginxやMySQLの設定を垣間見れた｡パラメータが多すぎて本気のチューニングは大変そう｡

Grafana Cloudでの可視化は無料枠でできて非常にお手軽だった｡
主にPrometheusとGrafanaを使っていたが､他にもLokiやTempo, Pyroscopeも無料で使えるようで､どこかで使う機会があれば試してみたい｡

pprofの可視化を途中から取り入れたが､もっと早くから取り入ればよかった程に役に立った｡Goのアプリケーションでチューニングをするときにはぜひ使いたい｡
