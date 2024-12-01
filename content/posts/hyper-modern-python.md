---
title: 'ハイパーモダンPython'
description: 'ハイパーモダンPythonを読んだメモ'
date: 2024-11-30
draft: false
---

![](https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0092-8.jpeg)

[ハイパーモダンPython](https://www.oreilly.co.jp/books/9784814400928/)を読んだ覚え書き。

## 1章 Pythonのインストール

python-launcherが便利らしい。
hpython-launcherからpythonインタプリタを起動するとインタプリタやvenvを自動的に検出してくれる。

```**sh**
$ brew install python-launcher
$ brew install python@3.12 python@3.11 python@3.10
```

FedoraなどのRHEL系OSはpythonと密接に関わっているので無闇にpythonをグローバルインストールしないのが良いとのこと。

## 2章 Python環境

グローバル環境を汚さないためにvenvを使う。

python-launcherと合わせて使うことでいちいち `source .venv/bin/activate` を実行しなくて良くなる。
`py -m pip` を使うとvenv環境に対してパッケージをインストールしてくれるとのこと。

```sh
$ py -m venv .venv
$ py -m pip install httpx
```

グローバルにパッケージをインストールしたいときはpipxを使う。

pipxはパッケージを仮想環境にインストールしておき、エントリポイントを `$PATH` 上に作成することでどこからでもパッケージを呼び出せるようにするという思想。賢い。

```sh
$ pipx list
venvs are in /home/nagu/.local/pipx/venvs
apps are exposed on your $PATH at /home/nagu/.local/bin
   package black 24.10.0, installed using Python 3.9.18
    - black
    - blackd
   package hatch 1.13.0, installed using Python 3.9.18
    - hatch
   package hatch-vcs 0.4.0, installed using Python 3.9.18
    - hatchling

$ ls -l ~/.local/bin
total 0
lrwxrwxrwx. 1 nagu nagu 44 Nov 22 15:45 black -> /home/nagu/.local/pipx/venvs/black/bin/black
lrwxrwxrwx. 1 nagu nagu 45 Nov 22 15:45 blackd -> /home/nagu/.local/pipx/venvs/black/bin/blackd
lrwxrwxrwx. 1 nagu nagu 44 Nov 22 15:46 hatch -> /home/nagu/.local/pipx/venvs/hatch/bin/hatch
lrwxrwxrwx. 1 nagu nagu 52 Nov 22 15:47 hatchling -> /home/nagu/.local/pipx/venvs/hatch-vcs/bin/hatchling
```

## 3章 Pythonパッケージ

pyproject.tomlを使ったプロジェクト管理入門のような内容。
あまり使わなそうなためスキップ。

## 4章 依存関係の管理

> バージョン指定子は、許容できるバージョンの範囲を指定します。新しい依存関係を追加する際は、そのパッケージの現在のバージョンを下限値として指定するとよいでしょう。また、そのパッケージの新しい機能に依存するようになったら下限を更新してください。  
> ...  
> 憶測でバージョンの上限を指定しないでください。新しいリリースがプロジェクトと互換性がないと確信できる場合を除いて、上限を制限するべきではありません。

Pythonは各パッケージの特定バージョンしかインストールできないため、上限を設定すると他のパッケージが指定するバージョンとコンフリクトする可能性が高まる。上限はできる限り設定しないのが良いらしい。

venvを使っててもそうなのか...?  
→ プロジェクトが依存しているパッケージAとパッケージBがパッケージCのv1.2とv2.0に依存しているとvenv環境でもコンフリクトするかも。

## 6章 pytestによるテスト

ここから先はパッケージの使い方紹介みたいな内容だったので流し読み。  
いつかpytest使う日が来たらきちんと読み返そうと思う。

## 7章 Coverage.pyによるカバレッジ測定

テストカバレッジはテスト感度の上限として見れるという話。テストカバレッジが高いことが必ずしもテストの感度が高いことにはならない。

## 8章 Noxによる自動化

Noxというものでビルド・テストなんでもできる様子。メモ。

## 9章 Ruffとpre-commitによるリント

Pythonリンタ略史が面白い。昔はFlake8を使っていた記憶がフラッシュバックする。  
現代ではRuff入れとけば大体問題ないということが記されている。

## 10章 安全性とインスペクションのための型アノテーション

pythonに型アノテーションを付けることで型チェックができるようになる。

大昔のコードに書いてあるlistやdictは何を期待しているのかぱっとわからないので型アノテーションが欲しい。

```py
lines: list[str] = []

fruits: dict[str, int] = {
    "banana": 3,
    "apple": 2,
    "orange": 1,
}
```
