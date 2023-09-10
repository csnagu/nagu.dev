---
title: 'macbookをセットアップする2023'
description: 'm2 macbook air (2022) を購入したためよく使うツール等をセットアップする時のメモ'
date: 2023-04-28
---

## todo-list

1. インストーラーを使うものをインストール
- [chrome](https://www.google.com/intl/ja_jp/chrome/)
- [warp](https://www.warp.dev/)
- [visual studio code](https://code.visualstudio.com/)
2. App Store経由のものをインストール
- [bitwarden](https://apps.apple.com/jp/app/bitwarden/id1352778147?mt=12)
3. [Homebrew](https://brew.sh/index_ja)とHomebrew経由のものをインストール

Homebrewインストール後に警告が出たら権限を調整する。

```sh
$ sudo chmod 755 /opt/homebrew/share/
```

よく使うツールたち。
```sh
$ brew install anyenv wakeonlan gnu-sed gnu-time screenfetch tmux go gcc
$ brew install hammerspoon --cask
```
5. 旧環境のdotfilesをコピー

6. **envをインストール

```sh
$ anyenv install pyenv
$ pyenv install xxx; pyenv global xxx
$ anyenv install nodenv
$ nodenv install xxx; nodenv global xxx
```

7. 各種ツールのセットアップ

■ 競プロ

参考: https://qiita.com/NaokiOsako/items/dcbc0a91e1bbca8ee45d

```sh
$ npm install -g atcoder-cli
$ pip install online-judge-tools
$ sudo ln -s /opt/homebrew/bin/g++-12 /usr/local/bin/g++
```

■ git

```sh
$ git config --global user.name "hoge"
$ git config --global user.email "hoge@fuga.com"
```

8. [Cica](https://github.com/miiton/Cica)(Font)をインストール

おわり。