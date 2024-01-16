#!/usr/bin/env just --justfile

run +COMMAND:
	mise x node@lts -- npm run {{COMMAND}}

install *PACKAGES:
	mise x node@lts -- npm install {{PACKAGES}}

format:
	just run lint -- --fix
	just run format

build:
    just run build

synth:
    just run synth