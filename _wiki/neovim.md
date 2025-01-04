---
layout  : wiki
title   : Neovim
summary : neovim 그리고 lua 
date    : 2025-01-04 10:40:51 +0900
updated : 2025-01-04 11:00:22 +0900
tag     : 
toc     : true
public  : true
parent  : 
latex   : false
resource: 65443906-EAD4-48E0-8498-27CE424CEE26
---
* TOC
{:toc}

# Neovim

vim 은 메인테이너가 소수라 업데이트가 느리다.  
neovim 은 vim 을 fork 한 오픈소스로 커뮤니티 버전 vim 이리고 보면될거 같다.
vim 업데이트는 팔로업 하되, 독자적인 feature 들이 있는 것이다.

## Lua

lua 는 간단한 프로그래밍 언어이다.
neovim 0.5 부터 lua 기반 설정이 가능하다.

### 설정방법

`~/.config/nvim/init.lua`에서 설정한다.
플러그인을 모듈화할 수도 있다.
```
~/.config/nvim
├── init.lua        # Neovim 설정의 진입점
└── lua/
    └── plugins/    # 플러그인 관련 설정을 담을 디렉토리
```

### Neovim 에서 사용하는 유용한 lua 문법

vim.opt.number = true 처럼 사용할 수도 있고, 기존 vimscript 문법을 사용하려면 vim.cmd("set number") 과 같은 형식으로 사용해도 된다.  
vim 에서 어떤 옵션이 있고 어떤게 나에게 유용한지 아직 모르는 상황에선, 새로운 vim 커맨드를 학습하고, vim.cmd("")에 넣는게 가장 좋은 접근일거 같다.  

키매핑은 아래와 같이 할 수 있다.

```lua
vim.keymap.set("n", "<leader>w", ":w<CR>", { noremap = true, silent = true }) -- 노멀 모드에서 저장
vim.keymap.set("v", "<leader>y", '"+y')  -- 비주얼 모드에서 클립보드 복사
vim.keymap.set("i", "jk", "<Esc>")       -- 삽입 모드에서 jk로 탈출
```

> 참고로 :help key-notation 를 사용하면 `<CR>` 같은 표기 의미를 알수있다.

