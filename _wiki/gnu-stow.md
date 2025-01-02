---
layout  : wiki
title   : GNU Stow
summary : symlink farm manager
date    : 2025-01-02 22:34:57 +0900
updated : 2025-01-02 22:53:35 +0900
tag     : 
toc     : true
public  : true
parent  : 
latex   : false
resource: CC665614-937F-4B70-A873-AFE42E6BB10D
---
* TOC
{:toc}

# How?

모든 dotfile 들과 설정 파일들을 한곳에 모으려면 어떻게 해야할까?

먼저 아래와 같이 git 으로 관리할 수 있다.

```bash
mkdir test
cd test
touch .zshrc
touch .vimrc
ln -s .zshrc ~/.zshrc
ln -s .vimrc ~/.vimrc
```

이렇게 관리할 수도 있지만 점점 파일들이 늘어나고, dotfile 처럼 하나의 파일이 아니라 여러 파일들을 한데 묶어서 사용하는 설정파일 이라면 어떻게 해야할까?

예를 들어서, 다음과 같은 파일들이 있다고 생각해보자
```bash
$ tree -al
.
├── .vimrc
├── .zshrc
└── neovim
    ├── init.lua
    └── plugins
        ├── helloworod.lua
        ├── plugin-good.lua
        └── treesitter.lua

3 directories, 6 files
```
vimrc와 zshrc는 각각 그렇게 했다고 치더라도 neovim 안에 있는 설정파일들은 어떻게 해야할까?  
init.lua, helloworld.lua, plugin-good.lua, treesitter.lua 각각 link 할수밖에 없다.  

### GNU Stow

GNU Stow 는 이런것들을 해결할 수 있다.  
GNU Stow 설명은 홈페이지에 아래처럼 나온다.

> GNU Stow is a symlink farm manager which takes distinct packages of software and/or data located in separate directories on the filesystem, and makes them appear to be installed in the same place.

설명만 봐선 잘 이해가 안간다.
```bash
$ tree -a
.
├── bash
│   ├── .bashrc
│   └── .profile
└── vim
    └── .vimrc
```
만약에 위와 같이 vim, bash 폴더에 설정 파일들을 넣도록 구조를 만들었다고 생각해보자.

```bash
$ stow vim
```
```bash
$ ls -al ~ | grep vimrc
lrwxr-xr-x    1 kyupid  staff      20  7 Jan 12:35 .vimrc -> ~/test/vim/.vimrc
```
`stow vim` 을 치면, 자동으로 위와같이 링크해준다. 



