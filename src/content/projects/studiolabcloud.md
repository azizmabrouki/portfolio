---
title: StudioLabCloud
summary: A SaaS platform for selling and managing cloud services, built as a modular monolith with recurring billing, a support desk and an AI assistant that knows when to hand over.
sheet: '01'
period: Feb – Aug 2026
role: Software architect intern, final-year project
company: StudioLab
stack:
  - Laravel 12
  - PHP
  - Stripe
  - Python
  - Flask
  - Hugging Face Transformers
  - Pest
  - OpenAPI
  - Docker
  - Kubernetes
  - Grafana
  - CI/CD
numbers:
  - value: '609'
    label: automated tests
  - value: '25'
    label: OpenAPI specs
  - value: '3'
    label: releases in 6 sprints
disclosure: Shown with StudioLab’s agreement, at the level of architecture and decisions. No code, screens or client data.
decisions:
  - title: One deployable, hard module boundaries
    chose: A modular Laravel monolith whose modules talk only through explicit contracts and DTOs.
    over: Microservices from the first release.
    why: One team, one database and a first release to ship. Contracts give most of the separation microservices promise, without the network hops, the extra deployments and the distributed failures.
    tradeoff: Nothing but discipline stops a module from reaching into another one. Architecture decision records write down why each boundary exists, so it survives the next deadline.
    node: contracts
  - title: Webhooks that may arrive twice
    chose: Idempotent webhook processing, so each payment event is recorded and applied once.
    over: Trusting every webhook to arrive exactly once.
    why: Payment providers retry deliveries, and a replayed event must never charge a client twice.
    tradeoff: One more piece of state to store and check on every event, and tests written for the replay cases.
    node: billing
  - title: An assistant that knows when to stop
    chose: A separate Python RAG assistant behind a handover contract that escalates to a human agent.
    over: An assistant inside the PHP application, or one that tries to answer everything.
    why: Python has the retrieval and model tooling. The contract says when the bot passes the conversation to a person, so a wrong answer is never the last word.
    tradeoff: A second runtime to deploy and monitor, and a contract to keep in step on both sides.
    node: assistant
diagram:
  title: StudioLabCloud, simplified
  description: Clients and support agents use one Laravel application split into modules. The billing module talks to Stripe and receives its webhooks; the support module hands conversations to and from a separate Python assistant. Everything runs on Kubernetes, watched by Grafana.
  columns: 6
  rows: 4
  groups:
    - id: app
      label: Laravel modular monolith · Kubernetes
      x: 0
      y: 1
      w: 4
      h: 2
  nodes:
    - id: clients
      label: Client portal
      note: order · pay · get help
      kind: client
      x: 0
      y: 0
      w: 2
    - id: agents
      label: Back office
      note: support and admin
      kind: client
      x: 2
      y: 0
      w: 2
    - id: accounts
      label: Accounts
      x: 0
      y: 1
    - id: catalogue
      label: Catalogue
      note: cloud services
      x: 1
      y: 1
    - id: provisioning
      label: Provisioning
      x: 2
      y: 1
    - id: billing
      label: Billing
      note: multi-currency · tax
      accent: true
      x: 3
      y: 1
    - id: support
      label: Support desk
      note: tickets · handover
      accent: true
      x: 0
      y: 2
    - id: messaging
      label: Messaging
      note: chat · video calls
      x: 1
      y: 2
    - id: contracts
      label: Module contracts
      note: DTOs · ADRs
      kind: service
      x: 2
      y: 2
      w: 2
    - id: stripe
      label: Stripe
      note: payments
      kind: external
      x: 5
      y: 1
    - id: assistant
      label: RAG assistant
      note: Python · Flask
      kind: service
      x: 0
      y: 3
    - id: database
      label: Database
      kind: store
      x: 2
      y: 3
    - id: grafana
      label: Grafana
      note: monitoring
      kind: external
      x: 5
      y: 2
  edges:
    - from: clients
      to: app
      label: HTTPS
    - from: agents
      to: app
      label: HTTPS
    - from: billing
      to: stripe
      label: charges
    - from: stripe
      to: billing
      label: webhooks, applied once
      dashed: true
    - from: support
      to: assistant
      label: questions
    - from: assistant
      to: support
      label: handover
      dashed: true
    - from: app
      to: database
    - from: app
      to: grafana
      label: metrics
      dashed: true
---

## Context

StudioLab sells cloud services to French-speaking clients: compute, hosting, storage and business email. StudioLabCloud is the platform where those clients order the services, pay for them every month and get help when something goes wrong.

I designed and built it as my final-year engineering project, from February to August 2026, and owned the whole chain: system architecture, interface design, implementation, tests and deployment. It shipped in three releases over six Scrum sprints.

## The problem

Three concerns had to live in one product without tangling. **Money:** recurring payments in several currencies, with taxes, where a bug costs a client real money. **Services:** what each client has ordered and what is running for them. **People:** tickets, messages and video calls with the support team, where a stalled conversation loses a client.

And a small team had to be able to run it and change it after I leave. That ruled out anything clever for its own sake.

## What I built

A Laravel application split into modules with explicit contracts, so billing never reaches into support and support never reaches into billing. Recurring Stripe billing in several currencies, with webhook processing that is safe to replay. A support desk with ticketing, client messaging and video calls. In the last sprint, a Python retrieval-augmented assistant for first-level support, which hands the conversation to a human agent when it can’t answer.

Around it: 609 automated tests, 25 OpenAPI specs, architecture decision records, CI/CD pipelines, a Kubernetes deployment and Grafana monitoring.
