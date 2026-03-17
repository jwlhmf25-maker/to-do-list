# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static web project with two independent mini-projects. No build system, no package manager, no dependencies — plain HTML/CSS/JS only.

## Structure

- `hello-world/` — minimal starter page with a blue gradient background
- `profile/` — personal profile card page (Korean content, purple theme)

## Running the Pages

Open any `index.html` directly in a browser. No server required.

## Code Conventions

- Language: Korean (`lang="ko"`, Korean UI text)
- CSS: vanilla CSS with custom properties and flexbox; no frameworks
- JS: vanilla ES5-style functions; entry point is `initApp()` called at the bottom of `main.js`
- Color theme: `profile/` uses purple gradient (`#667eea → #764ba2`)

## 주의
주석은 한글로 해주세요
